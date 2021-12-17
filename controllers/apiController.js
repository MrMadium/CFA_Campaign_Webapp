/**
 * Required modules for Api Controller.
 */
const { 
    generateAccessToken,
    stringToArray } = require('../util/helpers');
const { 
    User,
    Brigade,
    Permission,
    Appliance,
    ApplianceClass,
    Campaign,
    Route,
    sequelize } = require("../models")

/**
 * Controller for /api/
 */
exports.index = (req, res) => {
    res.status(200).json({ message: 'hi!' })
}

/**
 * Controller for /api/login
 */
exports.authUser = async (req, res) => {
    try {
        const { username, password } = req.body
        
        const user = await User.findOne({
            where: { username: username, hash: null },
            include: [Brigade,Permission]
        })

        if (!user) {
            return res.status(404).send({ message: "Username or password incorrect." })
        }

        const userRole = await user.getPermission()

        if (!userRole) {
            return res.status(404).send({ message: "User has no permissions." })
        }

        const token = generateAccessToken({
            id: user.userID, 
            user: user.userName,
            brigades: user.Brigades, 
            role: `ROLE_${user.Permission.permissionName.toUpperCase()}`
        })

        res.status(200).send({
            username: user.userName,
            role: `ROLE_${user.Permission.permissionName.toUpperCase()}`,
            brigade: user.Brigades.map(b => { return b.brigadeID }),
            access_token: token
        })
    } 
    catch (e) {
        console.error(e.stack)
    }
    
}


/**
 * Controllers for /api/users endpoints.
 */
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [Brigade, Permission]
        })

        if (!users) {
            return res.status(404).send({ message: "No users." })
        } 

        res.status(200).send(users.map(u => { return {
            id: u.userID,
            username: u.userName,
            memberID: u.memberID,
            Permission: `ROLE_${u.Permission.permissionName.toUpperCase()}`,
            Brigades: u.Brigades.map(b => { return {brigadeID: b.brigadeID, brigadeName: b.brigadeName}})
        } }))
    } catch (e) {
        console.error(e.stack);
    }
}

exports.getUsersByBrigade = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                model: Brigade,
                where: {
                    brigadeID: [13781]
                }
            }, Permission]
        })

        if (!users) {
            return res.status(404).send({ message: "No users." })
        }

        res.status(200).send(users.map(u => { return {
            id: u.userID,
            username: u.userName,
            memberID: u.memberID,
            Permission: u.Permission.permissionName,
            Brigades: u.Brigades.map(b => { return {brigadeID: b.brigadeID, brigadeName: b.brigadeName}})
        } }))
    } catch (e) {
        console.error(e.stack);
    }
}

exports.getUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { userID: req.params.id },
            attributes: {
                exclude: ['permissionLevel']
            },
            include: [{
                model: Permission,
                attributes: ['permissionName']
            }, {
                model: Brigade,
                attributes: ['brigadeID', 'brigadeName'],
                through: {
                    attributes: []
                }
            }]
        })

        if (!user) {
            return res.status(404).send({ message: 'User not found.' })
        }

        res.status(200).send({
            id: user.userID,
            username: user.userName,
            hash: user.hash,
            memberID: user.memberID,
            Permission: `ROLE_${user.Permission.permissionName.toUpperCase()}`,
            Brigades: user.Brigades.map(b => { return {brigadeID: b.brigadeID, brigadeName: b.brigadeName}})
        })
    } catch (e) {
        console.error(e.stack);
    }
}

exports.newUser = async (req, res) => {
    try {
        const { username, password, permission, brigades } = req.body

        const user = await sequelize.transaction(async (t) => {

            const user = await User.create({
                userName: username,
                hash: password,
                permissionLevel: permission
            }, { transaction: t });
        
            await user.setBrigades(stringToArray(brigades), { transaction: t });
        
            return user;
        
        });

        const role = await user.getPermission()
        const brigade = await user.getBrigades()

        res.status(200).send({
            id: user.userID,
            username: user.userName,
            Permission: `ROLE_${role.permissionName.toUpperCase()}`,
            Brigades: brigade.map(b => { return {brigadeID: b.brigadeID, brigadeName: b.brigadeName}})
        })
        
    } catch (e) {
        if (e.name == 'SequelizeUniqueConstraintError') {
            return res.status(404).send({ message: 'Username already exists.' })
        } 
        else if (e.name == 'SequelizeForeignKeyConstraintError') {
            return res.status(404).send({ message: `${e.table} not found.` })
        } 
        else {
            console.error(e.stack)
        }
    }
}

exports.removeUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                userID: req.params.id
            }
        })

        if (!user) {
            return res.status(404).send({ message: 'User not found.' })
        }

        await user.setBrigades([])

        User.destroy({
            where: {
                userID: req.params.id
            }
        })

        res.status(200).send({ message: 'User removed.' })
    } catch (e) {
        console.error(e.stack)
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { username, password, permission, brigades } = req.body

        const user = await sequelize.transaction(async (t) => {

            const user = await User.findOne({
                where: {
                    userID: req.params.id
                }
            }, { transaction: t })

            if (!user) {
                return res.status(404).send({ message: 'User not found.' })
            }

            const userUpdated = await User.update({
                userName: username,
                hash: password,
                permissionLevel: permission
            }, {
                where: {
                    userID: req.params.id
                }
            }, { transaction: t });
        
            await user.setBrigades(stringToArray(brigades), { transaction: t });
        
            return user;
        
        });

        const role = await user.getPermission()
        const brigade = await user.getBrigades()

        res.status(200).send({
            id: user.userID,
            username: user.userName,
            Permission: `ROLE_${role.permissionName.toUpperCase()}`,
            Brigades: brigade.map(b => { return {brigadeID: b.brigadeID, brigadeName: b.brigadeName}})
        })
        
    } catch (e) {
        if (e.name == 'SequelizeUniqueConstraintError') {
            return status(404).send({ message: 'Username already exists.' })
        } 
        else if (e.name == 'SequelizeForeignKeyConstraintError') {
            return res.status(404).send({ message: `${e.table} not found.` })
        } 
        else if (e.name == 'SequelizeDatabaseError') {
            return res.status(404).send({ message: 'Bad Request.' })
        } 
        else {
            console.error(e.name)
        }
    }
}


/**
 * Controller for /api/role endpoints.
 */
exports.getRoles = async (req, res) => {
    try {
        const permissions = await Permission.findAll()

        if (!permissions) {
            return res.status(404).send({ message: 'No permissions.' })
        }

        res.status(200).send(permissions.map(r => {
            return {
                id: r.permissionID,
                name: r.permissionName,
                description: r.permissionDescription
            }
        }))
    } catch (e) {
        console.error(e.stack)
    }
}

exports.getRole = async (req, res) => {
    try {
        const permission = await Permission.findOne({
            where: {
                permissionID: req.params.id
            }
        })

        if (!permission) {
            return res.status(404).send({ message: 'Permission not found.' })
        }

        res.status(200).send({
            id: permission.permissionID,
            name: permission.permissionName,
            description: permission.permissionDescription
        })
    } catch (e) {
        console.error(e.stack)
    }
}

exports.updateRole = async (req, res) => {
    try {
        const { role, description } = req.body

        await Permission.update({
            permissionName: role,
            permissionDescription: description
        }, {
            where: {
                permissionID: req.params.id
            }
        })

        const permission = await Permission.findOne({
            where: {
                permissionID: req.params.id
            }
        })

        res.status(200).send({
            id: permission.permissionID,
            name: permission.permissionName,
            description: permission.permissionDescription
        })
    } catch (e) {
        console.error(e.stack)
    }
}

exports.newRole = async (req, res) => {
    try {
        const { role, description } = req.body

        await Permission.create({
            permissionName: role,
            permissionDescription: description
        })

        const permission = await Permission.findAll({
            limit: 1,
            order: 'DESC'
        });

        res.status(200).send({
            id: permission.permissionID,
            name: permission.permissionName,
            description: permission.permissionDescription
        })
    } catch (e) {
        console.error(e.stack)
    }
}

exports.removeRole = async (req, res) => {
    try {
        const permission = await Permission.findOne({
            where: {
                permissionID: req.params.id
            }
        })

        if (!permission) {
            return res.status(404).send({ message: 'Permission not found.' })
        }

        User.destroy({
            where: {
                permissionID: req.params.id
            }
        })

        res.status(200).send({ message: 'Permission removed.' })
    } catch (e) {
        console.error(e.stack)
    }
}

/**
 * Controller for /api/appliances/ endpoints.
 */
exports.getAppliances = async (req, res) => {
    try {
        const appliances = await Appliance.findAll({
            include: [Brigade, ApplianceClass]
        })

        if (!appliances) {
            return res.status(404).send({ message: 'Appliances not found.' })
        }

        res.status(200).send(appliances.map(a => {
            return {
                id: a.applianceID,
                name: a.publicName,
                brigade: a.Brigade.brigadeName,
                class: a.ApplianceClass.applianceName
            }
        }))
    } catch (e) {
        console.error(e.stack)
    }
}

exports.getAppliancesByBrigade = async (req, res) => {
    try {
        const appliance = await Appliance.findAll({
            where: {
                brigadeID: stringToArray(req.params.brigadeId)
            },
            include: [Brigade, ApplianceClass]
        })

        if (!appliance) {
            return res.status(404).send({ message: 'No appliances found.' })
        }

        res.status(200).send(appliance.map(a => {
            return {
                id: a.applianceID,
                name: a.publicName,
                brigade: a.Brigade.brigadeName,
                class: a.ApplianceClass.applianceName
            }
        }))
    } catch (e) {
        console.error(e.stack)
    }
}

exports.getAppliance = async (req, res) => {
    try {
        const appliance = await Appliance.findOne({
            where: {
                applianceID: req.params.id
            },
            include: [Campaign, Brigade, ApplianceClass]
        })

        if (!appliance) {
            return res.status(404).send({ message: 'Appliance not found.' })
        }

        res.status(200).send({
            id: appliance.applianceID,
            name: appliance.publicName,
            brigade: appliance.Brigade.brigadeName,
            class: appliance.ApplianceClass.applianceName
        })
    } catch (e) {
        console.error(e.stack)
    }
}

exports.updateAppliance = async (req, res) => {
    try {
        const { name, brigade, classid } = req.body

        const appliance = await sequelize.transaction(async (t) => {

            await Appliance.update({
                publicName: name,
                brigadeID: brigade,
                applianceClass: classid
            }, {
                where: {
                    applianceID: req.params.id
                }
            }, { transaction: t });

            const appliance = await Appliance.findOne({
                where: {
                    applianceID: req.params.id
                },
                include: [Brigade, ApplianceClass]
            }, { transaction: t })
        
            return appliance;
        
        });

        res.status(200).send({
            id: appliance.applianceID,
            name: appliance.publicName,
            brigade: appliance.Brigade.brigadeName,
            class: appliance.ApplianceClass.applianceName
        })       
    } catch (e) {
        if (e.name == 'SequelizeForeignKeyConstraintError') {
            res.status(404).send({ message: `${e.table} not found.` })
        } 
        else {
            console.error(e.stack)
        }
    }
}

exports.newAppliance = async (req, res) => {
    try {
        const { name, brigade, classid } = req.body

        const appliance = await sequelize.transaction(async (t) => {

            const appliance = await Appliance.create({
                publicName: name,
                brigadeID: brigade,
                applianceClass: classid
            }, { transaction: t });
        
            return appliance;
        
        });

        const b = await appliance.getBrigade()
        const a = await appliance.getApplianceClass()

        res.status(200).send({
            id: appliance.applianceID,
            name: appliance.publicName,
            brigade: b.brigadeName,
            class: a.applianceName
        })       
    } catch (e) {
        if (e.name == 'SequelizeForeignKeyConstraintError') {
            return res.status(404).send({ message: `${e.table} not found.` })
        } 
        else {
            console.error(e.stack)
        }
    }
}

exports.removeAppliance = async (req, res) => {
    try {
        const appliance = await Appliance.findOne({
            where: {
                applianceID: req.params.id
            }
        })

        if (!appliance) {
            return res.status(404).send({ message: 'Appliance not found.' })
        }

        Appliance.destroy({
            where: {
                applianceID: req.params.id
            }
        })

        res.status(200).send({ message: 'Appliance removed.' })
    } catch (e) {
        console.error(e.stack)
    }
}

/**
 * Controller for /api/applianceclasses/ endpoints.
 */
exports.getApplianceClasses = async (req, res) => {
    try {
        const aClasses = await ApplianceClass.findAll()

        if (!aClasses) {
            return res.status(404).send({ message: "No appliance classes." })
        } 

        res.status(200).send(aClasses)
    } catch (e) {
        console.error(e.stack);
    }
}

exports.getApplianceClass = async (req, res) => {
    try {
        const aClass = await ApplianceClass.findOne({
            where: {
                classID: req.params.id
            }
        })

        if (!aClass) {
            return res.status(404).send({ message: 'Appliance class not found.' })
        }

        res.status(200).send({
            id: aClass.classID,
            name: aClass.applianceName
        })
    } catch (e) {
        console.error(e.stack)
    }
}

exports.updateApplianceClass = async (req, res) => {
    try {
        const { name } = req.body

        const c = await sequelize.transaction(async (t) => {

            await ApplianceClass.update({
                applianceName: name
            }, {
                where: {
                    classID: req.params.id
                }
            }, { transaction: t });

            const aClass = await ApplianceClass.findOne({
                where: {
                    classID: req.params.id
                }
            }, { transaction: t })
        
            return aClass;
        
        });

        res.status(200).send({
            id: c.classID,
            name: c.applianceName
        })       
    } catch (e) {
        if (e.name == 'SequelizeForeignKeyConstraintError') {
            res.status(404).send({ message: `${e.table} not found.` })
        }
        else if (e instanceof TypeError) {
            res.status(404).send({ message: 'Appliance class not found.' })
        }
        else {
            console.error(e.stack)
        }
    }
}

exports.newApplianceClass = async (req, res) => {
    try {
        const { name } = req.body

        const aClass = await sequelize.transaction(async (t) => {

            const aClass = await ApplianceClass.create({
                applianceName: name
            }, { transaction: t });
        
            return aClass;
        
        });

        res.status(200).send({
            id: aClass.classID,
            name: aClass.applianceName
        })       
    } catch (e) {
        if (e.name == 'SequelizeForeignKeyConstraintError') {
            res.status(404).send({ message: `${e.table} not found.` })
        } 
        else {
            console.error(e.stack)
        }
    }
}

exports.removeApplianceClass = async (req, res) => {
    try {
        const aClass = await ApplianceClass.findOne({
            where: {
                classID: req.params.id
            }
        })

        if (!aClass) {
            return res.status(404).send({ message: 'Appliance class not found.' })
        }

        ApplianceClass.destroy({
            where: {
                classID: req.params.id
            }
        })

        res.status(200).send({ message: 'Appliance class removed.' })
    } catch (e) {
        console.error(e.stack)
    }
}

/**
 * Controller for /api/brigades/ endpoints.
 */
exports.getBrigades = async (req, res) => {
    try {
        const brigades = await Brigade.findAll()

        if (!brigades) {
            return res.status(404).send({ message: "No brigades." })
        } 

        res.status(200).send(brigades.map(b => {
            return {
                id: b.brigadeID,
                name: b.brigadeName,
                address: b.brigadeAddress,
                geoLocation: b.brigadeLocation
            }
        }))
    } catch (e) {
        console.error(e.stack);
    }
}

exports.getBrigade = async (req, res) => {
    try {
        const brigade = await Brigade.findAll({
            where: {
                brigadeID: stringToArray(req.params.id)
            },
            include: [{
                model: User,
                include: [Permission]
            }]
        })

        if (!brigade) {
            return res.status(404).send({ message: 'Brigade not found.' })
        }

        res.status(200).send(brigade.map(b => {
            return {
                id: b.brigadeID,
                name: b.brigadeName,
                address: b.brigadeAddress,
                geoLocation: b.brigadeLocation,
                Users: b.Users
            }
        }))
    } catch (e) {
        console.error(e.stack)
    }
}

exports.updateBrigade = async (req, res) => {
    try {
        const { brigName, brigAddress, brigLocation } = req.body

        const b = await sequelize.transaction(async (t) => {

            await Brigade.update({
                brigadeName: brigName,
                brigadeAddress: brigAddress,
                brigadeLocation: brigLocation
            }, {
                where: {
                    brigadeID: req.params.id
                }
            }, { transaction: t });

            const b = await Brigade.findOne({
                where: {
                    brigadeID: req.params.id
                }
            }, { transaction: t })
        
            return b;
        
        });

        res.status(200).send({
            id: b.brigadeID,
            name: b.brigadeName,
            address: b.brigadeAddress,
            geoLoation: b.brigadeLocation
        })       
    } catch (e) {
        if (e.name == 'SequelizeForeignKeyConstraintError') {
            res.status(404).send({ message: `${e.table} not found.` })
        }
        else if (e instanceof TypeError) {
            res.status(404).send({ message: 'Brigade not found.' })
        }
        else {
            console.error(e.stack)
        }
    }
}

exports.newBrigade = async (req, res) => {
    try {
        const { brigName, brigAddress, brigLocation } = req.body

        const b = await sequelize.transaction(async (t) => {

            const b = await Brigade.create({
                brigadeName: brigName,
                brigadeAddress: brigAddress,
                brigadeLocation: brigLocation
            }, { transaction: t });
        
            return b;
        
        });

        res.status(200).send({
            id: b.brigadeID,
            name: b.brigadeName,
            address: b.brigadeAddress,
            geoLoation: b.brigadeLocation
        })       
    } catch (e) {
        if (e.name == 'SequelizeForeignKeyConstraintError') {
            res.status(404).send({ message: `${e.table} not found.` })
        } 
        else {
            console.error(e.stack)
        }
    }
}

exports.removeBrigade = async (req, res) => {
    try {
        const b = await Brigade.findOne({
            where: {
                brigadeID: req.params.id
            }
        })

        if (!b) {
            return res.status(404).send({ message: 'Brigade not found.' })
        }

        Brigade.destroy({
            where: {
                brigadeID: req.params.id
            }
        })

        res.status(200).send({ message: 'Brigade removed.' })
    } catch (e) {
        console.error(e.stack)
    }
}

/**
 * Controller for /api/campaigns/ endpoints.
 */
exports.getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.findAll()

        if (!campaigns) {
            return res.status(404).send({ message: "No campaigns." })
        } 

        res.status(200).send(campaigns.map(c => {
            return {
                id: c.campaignID,
                name: c.campaignName,
                leadBrigade: c.leadBrigade,
                dateStart: c.campaignStart,
                dateEnd: c.campaignEnd,
                notes: c.campaignNotes,
                status: c.campaignStatus
            }
        }))
    } catch (e) {
        console.error(e.stack);
    }
}

exports.getCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            where: {
                campaignID: req.params.id
            }
        })

        if (!campaign) {
            return res.status(404).send({ message: 'Campaign not found.' })
        }

        res.status(200).send({
            id: campaign.campaignID,
            name: campaign.campaignName,
            leadBrigade: campaign.leadBrigade,
            dateStart: campaign.campaignStart,
            dateEnd: campaign.campaignEnd,
            notes: campaign.campaignNotes,
            status: campaign.campaignStatus
        })
    } catch (e) {
        console.error(e.stack)
    }
}

exports.getCampaignsByBrigade = async (req, res) => {
    try {
        const c = await Campaign.findAll({
            where: {
                leadBrigade: stringToArray(req.params.id)
            }
        })

        if (!c) {
            return res.status(404).send({ message: 'No campaigns found.' })
        }

        res.status(200).send(c.map(c => {
            return {
                id: c.campaignID,
                name: c.campaignName,
                leadBrigade: c.leadBrigade,
                dateStart: c.campaignStart,
                dateEnd: c.campaignEnd,
                notes: c.campaignNotes,
                status: c.campaignStatus
            }
        }))
    } catch (e) {
        console.error(e.stack)
    }
}

exports.updateCampaign = async (req, res) => {
    try {
        const { name, start, end, notes, status, brigade } = req.body

        const c = await sequelize.transaction(async (t) => {

            await Campaign.update({
                campaignName: name,
                campaignStart: start,
                campaignEnd: end,
                campaignNotes: notes,
                leadBrigade: brigade,
                campaignStatus: status 
            }, {
                where: {
                    campaignID: req.params.id
                }
            }, { transaction: t });

            const c = await Campaign.findOne({
                where: {
                    campaignID: req.params.id
                }
            }, { transaction: t })

            if (!c) {
                return res.status(404).send({ message: 'Campaign not found.' })
            }
        
            return c;
        
        });

        res.status(200).send({
            id: c.campaignID,
            name: c.campaignName,
            leadBrigade: c.leadBrigade,
            dateStart: c.campaignStart,
            dateEnd: c.campaignEnd,
            notes: c.campaignNotes,
            status: c.campaignStatus
        })       
    } catch (e) {
        if (e.name == 'SequelizeForeignKeyConstraintError') {
            res.status(404).send({ message: `${e.table} not found.` })
        }
        else {
            console.error(e.stack)
        }
    }
}

exports.newCampaign = async (req, res) => {
    try {
        const { name, start, end, notes, status, brigade } = req.body

        const c = await sequelize.transaction(async (t) => {

            const c = await Campaign.create({
                campaignName: name,
                campaignStart: start,
                campaignEnd: end,
                routeNotes: notes,
                leadBrigade: brigade,
                campaignStatus: status
            }, { transaction: t });
        
            return c;
        
        });

        res.status(200).send({
            id: c.campaignID,
            name: c.campaignName,
            leadBrigade: c.leadBrigade,
            dateStart: c.campaignStart,
            dateEnd: c.campaignEnd,
            notes: c.campaignNotes,
            status: c.campaignStatus
        })       
    } catch (e) {
        if (e.name == 'SequelizeForeignKeyConstraintError') {
            res.status(404).send({ message: `${e.table} not found.` })
        } 
        else {
            console.error(e.stack)
        }
    }
}

exports.removeCampaign = async (req, res) => {
    try {
        const c = await Campaign.findOne({
            where: {
                campaignID: req.params.id
            }
        })

        if (!c) {
            return res.status(404).send({ message: 'Campaign not found.' })
        }

        Route.destroy({
            where: {
                campaignID: req.params.id
            }
        })

        res.status(200).send({ message: 'Campaign removed.' })
    } catch (e) {
        console.error(e.stack)
    }
}

/**
 * Controller for /api/routes/ endpoints.
 */
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.findAll({
            include: [Campaign]
        })

        if (!routes) {
            return res.status(404).send({ message: "No routes." })
        }

        res.status(200).send(routes.map(r => {
            return {
                id: r.routeID,
                name: r.routeName,
                campaign: r.Campaign.campaignName,
                geom: r.routeGeom,
                note: r.routeNote
            }
        }))
    } catch (e) {
        console.error(e.stack);
    }
}

exports.getRoute = async (req, res) => {
    try {
        const r = await Route.findOne({
            where: {
                routeID: req.params.id
            },
            include: [Campaign]
        })

        if (!r) {
            return res.status(404).send({ message: 'Route not found.' })
        }

        res.status(200).send({
            id: r.routeID,
            name: r.routeName,
            campaign: r.Campaign.campaignName,
            geom: r.routeGeom,
            note: r.routeNote
        })
    } catch (e) {
        console.error(e.stack)
    }
}

exports.getRoutesByCampaign = async (req, res) => {
    try {
        const r = await Route.findAll({
            where: {
                campaignID: req.params.campaignId
            }
        })

        if (!r) {
            return res.status(404).send({ message: 'No routes.' })
        }

        res.status(200).send(r)
    } catch (e) {
        console.error(e.stack)
    }
}

exports.updateRoute = async (req, res) => {
    try {
        const { name, geom, note, campaign } = req.body

        const r = await sequelize.transaction(async (t) => {

            await Route.update({
                campaignID: campaign,
                routeName: name,
                routeGeom: JSON.parse(geom),
                routeNote: note
            }, {
                where: {
                    routeID: req.params.id
                }
            }, { transaction: t });

            const r = await Route.findOne({
                where: {
                    routeID: req.params.id
                }
            }, { transaction: t })

            if (!r) {
                return res.status(404).send({ message: 'Route not found.' })
            }
        
            return r;
        
        });

        const c = await r.getCampaign()

        res.status(200).send({
            id: r.routeID,
            name: r.routeName,
            campaign: c.campaignName,
            geom: r.routeGeom,
            note: r.routeNote
        })       
    } catch (e) {
        if (e.name == 'SequelizeForeignKeyConstraintError') {
            res.status(404).send({ message: `${e.table} not found.` })
        }
        else {
            console.error(e.stack)
        }
    }
}

exports.newRoute = async (req, res) => {
    try {
        const { name, geom, note, campaign  } = req.body

        const r = await sequelize.transaction(async (t) => {

            const r= await Route.create({
                routeName: name,
                routeGeom: JSON.parse(geom),
                routeNote: note,
                campaignID: campaign
            }, { transaction: t });
        
            return r;
        
        });

        const c = await r.getCampaign()

        res.status(200).send({
            id: r.routeID,
            name: r.routeName,
            campaign: c.campaignName,
            geom: r.routeGeom,
            note: r.routeNote
        })       
    } catch (e) {
        if (e.name == 'SequelizeForeignKeyConstraintError') {
            res.status(404).send({ message: `${e.table} not found.` })
        } 
        else {
            console.error(e.stack)
        }
    }
}

exports.removeRoute = async (req, res) => {
    try {
        const r = await Route.findOne({
            where: {
                routeID: req.params.id
            }
        })

        if (!r) {
            return res.status(404).send({ message: 'Route not found.' })
        }

        Route.destroy({
            where: {
                routeID: req.params.id
            }
        })

        res.status(200).send({ message: 'Route removed.' })
    } catch (e) {
        console.error(e.stack)
    }
}
