const fetch = require('node-fetch')
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config.json')
const { objArrayToArray,
        verifyToken } = require("../util/helpers")
let { applianceArray } = require("../util/applianceArray")
const host = config[env].appUrl


/**s
 * Controllers for authentication
 */
exports.getLogin = (req, res) => {
    res.render('login')
}

exports.doLogin = async (req, res) => {
    try {
        const { username, password } = req.body

        const user = await fetch(`${host}/api/auth/login`, {
            method: 'post',
            body: `username=${username}&password=${password}`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        const data = await user.json()

        if (!user.ok) return res.render("login", { loginMsg: data.message })

        res.cookie('token', data.access_token, {
            expires: new Date(Date.now() + (config[env].jwtExpiry * 1000)),
            secure: false,
            httpOnly: true
        })
        res.redirect('/')
        
    } catch (e) {
        console.error(e.stack)
    }
    
}

exports.doLogout = async (req, res) => {
    try {
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            secure: false,
            httpOnly: true
        })
        res.redirect('/login')
    } catch (e) {
        console.log(e.stack)
    }
}

/**
 * Controller for index.
 */
exports.index = async (req, res) => {
    try {
        const user = req.user
        if (user.role === 'ROLE_ADMIN') {
            return res.render('admin/dashboard', {
                user: {
                    id: user.id,
                    username: user.user,
                    role: user.role
                }
            })
        }

        const a = await fetch(`${host}/api/campaigns/status/1,2`, {
            headers: { "Authorization": `Bearer ${req.cookies.token}`}
        })
        const data = await a.json()

        res.render('index', { 
            user: {
                id: user.id,
                username: user.user,
                role: user.role
            },
            appliances: data
        })
    }
    catch (e) {
        console.error(e.stack)
    }
    
}

/**
 * Controller for /:appliance
 */
exports.getCampaignAppliances = async (req, res) => {
    try {
        const user = req.user

        const brigArray = objArrayToArray(user.brigades, "brigadeID")

        const c = await fetch(`${host}/api/appliances/campaign/${req.params.campaign}`, {
                headers: { "Authorization": `Bearer ${req.cookies.token}`}
        })
        const data = await c.json()

        res.render('index-2', {
            user: {
                id: user.id,
                username: user.user,
                role: user.role
            },
            campaign: req.params.campaign,
            appliances: data
        })
    } catch (e) {
        console.error(e.stack)
    }
}

/**
 * Controller for /:appliance/:campaign/
 */
exports.getCampaignRoutes = async (req, res) => {
    try {
        const user = req.user

        const r = await fetch(`${host}/api/routes/campaign/${req.params.campaign}`, {
                headers: { "Authorization": `Bearer ${req.cookies.token}`}
        })
        const data = await r.json()

        res.render('index-3', { 
            user: {
                id: user.id,
                username: user.user,
                role: user.role
            },
            appliance: req.params.appliance,
            campaign: req.params.campaign,
            routes: data
        })
    } catch (e) {
        console.error(e)
    }
}

/**
 * Controller for /:appliance/:campaign/:route
 */
exports.getRoute = async (req, res) => {
    try {
        const user = req.user

        const r = await fetch(`${host}/api/routes/${req.params.route}`, {
                headers: { "Authorization": `Bearer ${req.cookies.token}`}
        })
        const data = await r.json()

        res.render('route', { 
            user: {
                id: user.id,
                username: user.user,
                role: user.role
            },
            gApi: config.google_api.key,
            appliance: req.params.appliance,
            campaign: req.params.campaign,
            route: data
        })
    } catch (e) {
        console.error(e)
    }
}

/**
 * Controller for /dashboard
 */
exports.getDashboard = (req, res) => {
    try {
        const user = req.user
    
        if (token.role === 'ROLE_ADMIN') {
            return res.render('dashboard', {user: {
                id: user.id,
                username: user.user,
                role: user.role
            }})
        }
        
        res.status(401).send('Unauthorised')
    } catch (e) {
        console.error(e.stack)
    }
}

/**
 * Controllers for /accounts
 */
exports.getAccounts = async (req, res) => {
    try {
        const user = req.user

        if (user.role == 'ROLE_USER') return res.status(404).send("401 Unauthorized")

        if (user.role == 'ROLE_SUPERVISOR') {
            const brigades = objArrayToArray(user.brigades, "brigadeID")

            const r = await fetch(`${host}/api/users/brigade/${brigades}`, {
                    headers: { "Authorization": `Bearer ${req.cookies.token}`}
            })
            const data = await r.json()

            return res.render('shared/accounts', { user: {
                id: user.id,
                username: user.user,
                hash: user.hash,
                role: user.role,
                brigade: user.brigades.map(b => { return b.brigadeName }),
                accounts: data
            }})
        }

        if (user.role == 'ROLE_ADMIN') {
            const r = await fetch(`${host}/api/users/all`, {
                    headers: { "Authorization": `Bearer ${req.cookies.token}`}
            })
            const data = await r.json()

            return res.render('shared/accounts', { user: {
                id: user.id,
                username: user.user,
                hash: user.hash,
                role: user.role,
                accounts: data
            }})
        }
    } catch (e) {
        console.error(e)
    }
}

/**
 * Controller to post to /api/users
 */
exports.createUser = async (req, res) => {
    try {
        const { username, memberid, password, permission, brigades } = req.body
        const user = req.user

        const newU = await fetch(`${host}/api/users/new`, {
            method: 'post',
            body: `username=${username}&password=${password}&memberid=${memberid}&permission=${permission}&brigades=${brigades}`,
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${req.cookies.token}`
            }
        })
        const data = await newU.json()
    } catch (e) {
        console.error(e)
    }
}

/**
 * Controller to delete to /api/users
 */
exports.removeUser = async (req, res) => {
    try {
        const { username, password, permission } = req.body

        
        const r = await fetch(`${host}/api/users/${req.params.id}`, {
            method: 'delete',
            headers: { "Authorization": `Bearer ${req.cookies.token}`}
        })
    } catch (e) {
        console.error(e.stack)
    }
}

/**
 * Controller to update to /api/users
 */
exports.editUser = async (req, res) => {
    try {
        const { username, memberid, password, permission, brigades } = req.body
        const user = req.user

        const newU = await fetch(`${host}/api/users/${req.params.id}`, {
            method: 'post',
            body: `username=${username}&password=${password}&memberid=${memberid}&permission=${permission}&brigades=${brigades}`,
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${req.cookies.token}`
            }
        })
        const data = await newU.json()

        res.status(200).json({ id: data.id })
    } catch (e) {
        console.error(e.stack)
    }
}

/**
 * Controller for /brigades
 */
exports.getBrigades = (req, res) => {
    const user = req.user

    if (user.role === 'ROLE_SUPERVISOR') {

        res.render('shared/brigades', { user: {
            id: user.id,
            username: user.user,
            role: user.role,
            brigade: {
                name: ['a', 'b'],
                objects: []
            }
        }})
    }

    if (user.role === 'ROLE_ADMIN') {
        return res.render('shared/brigades', { user: {
            id: user.id,
            username: user.user,
            role: user.role
        }})
    }
}

exports.createBrigade = (req, res) => {
    const user = req.user
}

exports.removeBrigade = (req, res) => {
    const user = req.user
}

exports.editBrigade = (req, res) => {
    const user = req.user
}


exports.getCampaigns = (req, res) => {
    const user = req.user

    res.render('shared/campaigns', { user: {
        id: user.id,
        username: user.user,
        role: user.role,
        brigade: {
            name: user.brigades,
        }
    }})
}

exports.createCampaign = (req, res) => {
    const user = req.user
}

exports.removeCampaign = (req, res) => {
    const user = req.user
}

exports.editCampaign = (req, res) => {
    const user = req.user
}


exports.getRoutes = (req, res) => {
    const user = req.user

    res.render('shared/routes', { user: {
        id: user.id,
        username: user.user,
        role: user.role
    }})
}

exports.createRoute = (req, res) => {
    const user = req.user
}

exports.removeRoute = (req, res) => {
    const user = req.user
}

exports.editRoute = (req, res) => {
    const user = req.user
}