const fs = require('fs');
const util = require('../util/helpers')
const db = require("../models")
const { Op } = require('sequelize')

exports.index = (req, res) => {
    res.status(200).json({ message: 'hi!' })
}

exports.authUser = (req, res) => {

    const { username, password } = req.body

    db.User.findOne({ 
        where: { 
            username: username, 
            hash: password 
        },
        include: [{
            model: db.Brigade,
            through: {
                attributes: []
            }
        }]
    })
    .then(async (data, err) => {
        if (data) {
            const roleName = await data.getPermission()
            const token = util.generateAccessToken({ id: data.userID, user: data.userName, brigades: data.Brigades, role: roleName.permissionName })
            res.status(200).json({ token: token })
        } else {
            res.status(403).send({ message: 'Username or password incorrect' }) 
        }
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getUsers = (req, res) => {
    db.User.findAll({
        include: [db.Brigade, db.Permission]
    })
    .then(users => {
        res.status(200).json(users)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getUser = (req, res) => {
    db.User.findOne({
        where: {
            userId: req.params.id
        },
        include: [{
            model: db.Brigade,
            through: {
                attributes: []
            }
        }]
    })
    .then(user => {
        res.status(200).json(user)
    })
    .catch(err => {
        console.log(err);
        res.status(403).json(err)
    })
}

exports.newUser = (req, res) => {
    const { username, password, permission, brigade } = req.body

    db.User.create({
        userName: username,
        hash: password,
        permissionLevel: permission
    })
    .then(() => {
        return db.User.findOne({
            where: {
                userName: username
            }
        })
    })
    .then(user => {
        if (brigade == '') {
            user.setBrigades(null)
        } else if (util.parameterIsArray(brigade)) {
            user.setBrigades(util.stringToArray(brigade)).catch(()=>{})
        } else {
            user.setBrigades(brigade)
        }
        res.status(200).json(user)
    })
    .catch(err => {
        console.log(err);
        res.status(403).json({ error: err })
    })
}

exports.removeUser = (req, res) => {
    let removed;
    db.User.findOne({
        where: {
            userID: req.params.id
        }
    })
    .then((user) => {
        return user.setBrigades(null).catch(() =>{})
    })
    .then(() => {
        return db.User.destroy({
            where: {
                userID: req.params.id
            }
        })
    })
    .then(result => {
        removed = result
        return db.User.findByPk(req.params.id)
    })
    .then(user => {
        if (!user && removed === 1) {
            res.status(200).json({ message: 'success' })
        } else {
            res.status(200).json(null)
        }
    })
    .catch(err => {
        console.log(err);
    })
}

exports.updateUser = (req, res) => {
    const { username, password, permission, brigade } = req.body
    
    db.User.update({
        userName: username,
        hash: password,
        permissionLevel: permission
    }, {
        where: {
            userId: req.params.id
        }
    })
    .then(() => {
        return db.User.findByPk(req.params.id)
    })
    .then(user => {
        if (brigade == '') {
            user.setBrigades(null)
        } else if (util.parameterIsArray(brigade)) {
            user.setBrigades(util.stringToArray(brigade)).catch(()=>{})
        } else {
            user.setBrigades(brigade)
        }
        res.status(200).json(user)
    })
    .catch(err => {
        res.status(403).json({ error: err })
    })
}

exports.getRoles = (req, res) => {
    db.Permission.findAll()
    .then(roles => {
        res.status(200).json(roles)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getRole = (req, res) => {
    db.Permission.findOne({
        where: {
            permissionId: req.params.id
        }
    })
    .then(role => {
        res.status(200).json(role)
    })
    .catch(err => {
        console.log(err)
    })
}

exports.updateRole = (req, res) => {
    const { role, description } = req.body

    db.Permission.update({
        permissionName: role,
        permissionDescription: description
    }, {
        where: {
            permissionId: req.params.id
        }
    })
    .then(() => {
        return db.Permission.findByPk(req.params.id)
    })
    .then(role => {
        res.status(200).json(role)
    })
    .catch((err) => {
        res.status(403).json({ error: err })
    })
}

exports.newRole = (req, res) => {
    const { role, description } = req.body

    db.Permission.create({
        permissionName: role,
        permissionDescription: description
    })
    .then(role => {
        res.status(200).json(role)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.removeRole = (req, res) => {
    let removed;
    db.Permission.destroy({
        where: {
            permissionId: req.params.id
        }
    })
    .then(result => {
        removed = result
        return db.Permission.findByPk(req.params.id)
    })
    .then(role => {
        if (!role && removed === 1) {
            res.status(200).json({ message: 'success' })
        } else {
            res.status(200).json(null)
        }
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getAppliances = (req, res) => {
    db.Appliance.findAll()
    .then(appliances => {
        res.status(200).json(appliances)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getAppliancesByBrigade = (req, res) => {
    db.Appliance.findAll({
        where: {
            brigadeID: util.stringToArray(req.params.brigadeId)
        }
    })
    .then(appliances => {
        res.status(200).json(appliances)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getAppliance = (req, res) => {
    db.Appliance.findOne({
        where: {
            applianceId: req.params.id
        },
        include: [db.Campaign]
    })
    .then(appliance => {
        res.status(200).json(appliance)
    })
    .catch(err => {
        console.log(err)
    })
}

exports.updateAppliance = (req, res) => {
    const { name, brigade, classid } = req.body

    db.Appliance.update({
        publicName: name,
        brigadeID: brigade,
        applianceClass: classid
    }, {
        where: {
            applianceID: req.params.id
        }
    })
    .then(result => {
        if (result[0] === 1) {
            db.Appliance.findByPk(req.params.id)
            .then(appliance => {
                res.status(200).json(appliance)
            })
        } else {
            res.status(200).json(null)
        }
    })
    .catch(err => {
        res.status(200).json(null)
    })
}

exports.newAppliance = (req, res) => {
    const { name, brigade, classid } = req.body

    db.Appliance.create({
        publicName: name,
        brigadeID: brigade,
        applianceClass: classid
    })
    .then(appliance => {
        res.status(200).json(appliance)
    })
    .catch(err => {
        console.log(err);
    })  
}

exports.removeAppliance = (req, res) => {
    let removed;
    db.Appliance.destroy({
        where: {
            applianceId: req.params.id
        }
    })
    .then(result => {
        removed = result
        return db.Appliance.findByPk(req.params.id)
    })
    .then(appliance => {
        if (!appliance && removed === 1) {
            res.status(200).json({ message: 'success' })
        } else {
            res.status(200).json(null)
        }
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getApplianceClasses = (req, res) => {
    db.ApplianceClass.findAll()
    .then(appliancesClasses => {
        res.status(200).json(appliancesClasses)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getApplianceClass = (req, res) => {
    db.ApplianceClass.findOne({
        where: {
            classId: req.params.id
        }
    }).then(applianceClass => {
        res.status(200).json(applianceClass)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.updateApplianceClass = (req, res) => {
    const { name, route } = req.body

    db.ApplianceClass.update({
        applianceName: name, 
        routeGeom: JSON.parse(route)
    }, {
        where: {
            classId: req.params.id
        }
    })
    .then(() => {
        return db.ApplianceClass.findByPk(req.params.id)
    })
    .then(aclass => {
        res.status(200).json(aclass)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.newApplianceClass = (req, res) => {
    const { name, route } = req.body

    db.ApplianceClass.create({
        applianceName: name,
        routeGeom: JSON.parse(route)
    })
    .then(applianceClass => {
        res.status(200).json(applianceClass)
    })
    .catch(err => {
        console.log(err);
    })  
}

exports.removeApplianceClass = (req, res) => {
    let removed;
    db.ApplianceClass.destroy({
        where: {
            classId: req.params.id
        }
    })
    .then(result => {
        removed = result
        return db.ApplianceClass.findByPk(req.params.id)
    })
    .then(aclass => {
        if (!aclass && removed === 1) {
            res.status(200).json({ message: 'success' })
        } else {
            res.status(200).json(null)
        }
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getBrigades = (req, res) => {
    db.Brigade.findAll()
    .then(brigades => {
        res.status(200).json(brigades)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getBrigade = (req, res) => {

    let brigades;
    if (req.params.id.includes(',')) {
        brigades = req.params.id.split(',').map( b => { return parseInt(b) } )
    } else { brigades = req.params.id }

    db.Brigade.findAll({
        where: {
            brigadeId: brigades
        },
        include: [{
            model: db.User,
            include: [db.Permission]
        }]
    })
    .then(brigade => {
        res.status(200).json(brigade)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.updateBrigade = (req, res) => {
    const { brigName, brigAddress, brigLocation } = req.body

    db.Brigade.update({
        brigadeName: brigName,
        brigadeAddress: brigAddress,
        brigadeLocation: JSON.parse(brigLocation)
    }, {
        where: {
            brigadeId: req.params.id,
        }
    })
    .then(() => {
        return db.Brigade.findByPk(req.params.id)
    })
    .then(brigade => {
        res.status(200).json(brigade)
    })
    .catch(err => {
        console.log(err);
    })
    
}

exports.newBrigade = (req, res) => {
    const { brigName, brigAddress, brigLocation } = req.body

    db.Brigade.create({
        brigadeName: brigName,
        brigadeAddress: brigAddress,
        brigadeLocation: JSON.parse(brigLocation)
    })
    .then(brigade => {
        res.status(200).json(brigade)
    })
    .catch(err => {
        res.status(200).json({ error: err })
    })  
}

exports.removeBrigade = (req, res) => {
    let removed;
    db.Brigade.destroy({
        where: {
            brigadeId: req.params.id
        }
    })
    .then(result => {
        removed = result
        return db.Brigade.findByPk(req.params.id)
    })
    .then(brigade => {
        if (!brigade && removed === 1) {
            res.status(200).json({ message: 'success' })
        } else {
            res.status(200).json(null)
        }
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getCampaigns = (req, res) => {
    db.Campaign.findAll()
    .then(campaigns => {
        res.status(200).json(campaigns)
    })
    .catch(err => {
        res.status(403).json(err)
    })
}

exports.getCampaign = (req, res) => {
    db.Campaign.findOne({
        where: {
            campaignId: req.params.id
        },
        include: [{
            model: db.Appliance,
            through: {
                attributes: []
            }
        }]
    })
    .then(campaign => {
        res.status(200).json(campaign)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getCampaignsByBrigade = (req, res) => {
    let brigades;
    if (req.params.id.includes(',')) {
        brigades = req.params.id.split(',').map( b => { return parseInt(b) } )
    } else { brigades = req.params.id }

    db.Campaign.findOne({
        where: {
            leadBrigade: brigades
        }
    })
    .then(campaign => {
        res.status(200).json(campaign)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.updateCampaign = (req, res) => {
    const { name, start, end, notes, status, brigade } = req.body

    db.Campaign.update({
        campaignName: name,
        campaignStart: start,
        campaignEnd: end,
        routeNotes: notes,
        leadBrigade: brigade,
        campaignStatus: status
    }, {
        where: {
            campaignId: req.params.id
        }
    })
    .then(result => {
        if (result[0] === 1) {
            db.Campaign.findByPk(req.params.id)
            .then(campaign => {
                res.status(200).json(campaign)
            })
        } else {
            res.status(200).json(null)
        }
    })
    .catch(err => {
        console.log(err);
    })
}

exports.newCampaign = (req, res) => {
    const { name, start, end, notes, status, brigade } = req.body

    db.Campaign.create({
        campaignName: name,
        campaignStart: start,
        campaignEnd: end,
        routeNotes: notes,
        leadBrigade: brigade,
        campaignStatus: status
    })
    .then(campaign => {
        res.status(200).json(campaign)
    }).catch(err => {
        console.log(err);
    })  
}

exports.removeCampaign = (req, res) => {
    let removed;
    db.Campaign.destroy({
        where: {
            campaignId: req.params.id
        }
    })
    .then(result => {
        removed = result
        return db.Campaign.findByPk(req.params.id)
    })
    .then(campaign => {
        if (!campaign && removed === 1) {
            res.status(200).json({ message: 'success' })
        } else {
            res.status(200).json(null)
        }
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getRoutes = (req, res) => {
    db.Route.findAll()
    .then(routes => {
        res.status(200).json(routes)
    }).catch(err => {
        console.log(err);
    })
}

exports.getRoutesByCampaign = (req, res) => {
    db.Route.findAll({
        where: {
            campaignID: req.params.campaignId
        }
    })
    .then(routes => {
        res.status(200).json(routes)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getRoute = (req, res) => {
    db.Route.findOne({
        where: {
            routeId: req.params.id
        }
    })
    .then(route => {
        res.status(200).json(route)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.updateRoute = (req, res) => {
    const { name, geom, note, campaign } = req.body

    db.Route.update({
        routeName: name,
        routeGeom: JSON.parse(geom),
        routeNote: note,
        campaignID: campaign
    }, {
        where: {
            routeId: req.params.id
        }
    })
    .then(() => {
        return db.Route.findByPk(req.params.id)
    })
    .then(route => {
        res.status(200).json(route)
    })
    .catch(err => {
        console.log(err);
    })
}

exports.newRoute = (req, res) => {
    const { name, geom, note, campaign  } = req.body

    db.Route.create({
        routeName: name,
        routeGeom: JSON.parse(geom),
        routeNote: note,
        campaignID: campaign
    })
    .then(route => {
        res.status(200).json(route)
    })
    .catch(err => {
        console.log(err);
    })  
}

exports.removeRoute = (req, res) => {
    let removed;
    db.Route.destroy({
        where: {
            routeId: req.params.id
        }
    })
    .then(result => {
        removed = result
        return db.Route.findByPk(req.params.id)
    })
    .then(route => {
        if (!route && removed === 1) {
            res.status(200).json({ message: 'success' })
        } else {
            res.status(200).json(null)
        }
    })
    .catch(err => {
        console.log(err);
    })
}
