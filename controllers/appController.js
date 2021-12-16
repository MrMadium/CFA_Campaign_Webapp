const fetch = require('node-fetch')
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config.json')
const { objArrayToArray } = require("../util/helpers")

/**
 * Controllers for authentication
 */
exports.getLogin = (req, res) => {
    res.render('login')
}

exports.doLogin = async (req, res) => {
    try {
        const { username, password } = req.body

        const user = await fetch('http://localhost:8000/api/auth/login', {
            method: 'post',
            body: `username=${username}&password=${password}`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        const data = await user.json()

        if (!user.ok) return res.render("login", { loginMsg: data.message })

        res.cookie('token', data.access_token, {
            expires: new Date(Date.now() + config[env].jwtExpiry),
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
            res.render('admin/dashboard', {
                user: {
                    id: user.id,
                    username: user.user,
                    role: user.role
                }
            })
        }

        const brigArray = objArrayToArray(user.brigades, "brigadeID")

        const a = await fetch(`http://localhost:8000/api/appliances/brigade/${brigArray}`, {
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
exports.getApplianceCampaigns = async (req, res) => {
    try {
        const user = req.user

        const brigArray = objArrayToArray(user.brigades, "brigadeID")

        const c = await fetch(`http://localhost:8000/api/campaigns/brigade/${brigArray}`, {
                headers: { "Authorization": `Bearer ${req.cookies.token}`}
        })
        const data = await c.json()

        res.render('index-2', { 
            user: {
                id: user.id,
                username: user.user,
                role: user.role
            },
            appliance: req.params.appliance,
            campaigns: data
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

        const r = await fetch(`http://localhost:8000/api/routes/campaign/${req.params.campaign}`, {
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

        const r = await fetch(`http://localhost:8000/api/routes/${req.params.route}`, {
                headers: { "Authorization": `Bearer ${req.cookies.token}`}
        })
        const data = await r.json()

        res.render('route', { 
            user: {
                id: user.id,
                username: user.user,
                role: user.role
            },
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
            res.render('dashboard', {user: {
                id: user.id,
                username: user.user,
                role: user.role
            }})
        } else {
            res.status(401).send('Unauthorised')
        }
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

            const r = await fetch(`http://localhost:8000/api/users/brigade/${brigades}`, {
                    headers: { "Authorization": `Bearer ${req.cookies.token}`}
            })
            const data = await r.json()

            res.render('shared/accounts', { user: {
                id: user.id,
                username: user.user,
                role: user.role,
                brigade: data,
                accounts: data
            }})
        }

        if (user.role == 'ROLE_ADMIN') {
            const r = await fetch('http://localhost:8000/api/users/all', {
                    headers: { "Authorization": `Bearer ${req.cookies.token}`}
            })
            const data = await r.json()

            console.log(data);

            res.render('shared/accounts', { user: {
                id: user.id,
                username: user.user,
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
exports.createUser = (req, res) => {
    const { username, password, permission } = req.body
    const user = util.verifyToken(req.cookies.token)

    let brigades = []
    user.brigades.forEach(brigade => {
        brigades.push(brigade.brigadeID)
    });

    console.log(req.body);

    request.post({
        url: `http://localhost:8000/api/users/new`,
        'auth': {
            'bearer': req.cookies.token
        },
        form: {
            username: username,
            password: password,
            permission: permission,
            brigade: brigades
        },
    }, (error, response, body) => {
        const info = JSON.parse(body)

        res.status(200).json({ id: info.userID })
    })
    
}

/**
 * Controller to delete to /api/users
 */
exports.removeUser = (req, res) => {
    const { username, password, permission } = req.body

    request.delete({
        url: `http://localhost:8000/api/users/${req.params.id}`,
        'auth': {
            'bearer': req.cookies.token
        }
    }, (error, response, body) => {
        const info = JSON.parse(body)

        console.log(info);
    })
    
}

/**
 * Controller to update to /api/users
 */
exports.editUser = (req, res) => {
    const { username, password, permission } = req.body
    const user = util.verifyToken(req.cookies.token)

    console.log(req.body);

    let brigades = []
    user.brigades.forEach(brigade => {
        brigades.push(brigade.brigadeID)
    });

    request.post({
        url: `http://localhost:8000/api/users/${req.params.id}`,
        'auth': {
            'bearer': req.cookies.token
        },
        form: {
            username: username,
            password: password,
            permission: permission,
            brigade: brigades
        },
    }, (error, response, body) => {
        const info = JSON.parse(body)

        res.status(200).json({ id: info.userID })
    })
}

/**
 * Controller for /brigades
 */
exports.getBrigades = (req, res) => {
    const user = util.verifyToken(req.cookies.token)

    if (user.role === 'ROLE_SUPERVISOR') {

        let brigades = []
        user.brigades.forEach(brigade => {
            brigades.push(brigade.brigadeID)
        })

        request.get({
            url: `http://localhost:8000/api/brigades/${brigades}`,
            'auth': {
                'bearer': req.cookies.token
            }
        }, (error, response, body) => {
            const info = JSON.parse(body);

            res.render('shared/brigades', { user: {
                id: user.id,
                username: user.user,
                role: user.role,
                brigade: {
                    name: ['a', 'b'],
                    objects: info
                }
            }})
        })
    }

    if (user.role === 'ROLE_ADMIN') {
        res.render('shared/brigades', { user: {
            id: user.id,
            username: user.user,
            role: user.role
        }})
    }
}

exports.createBrigade = (req, res) => {
    const user = util.verifyToken(req.cookies.token)
}

exports.removeBrigade = (req, res) => {
    const user = util.verifyToken(req.cookies.token)
}

exports.editBrigade = (req, res) => {
    const user = util.verifyToken(req.cookies.token)
}


exports.getCampaigns = (req, res) => {
    const user = util.verifyToken(req.cookies.token)

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
    const user = util.verifyToken(req.cookies.token)
}

exports.removeCampaign = (req, res) => {
    const user = util.verifyToken(req.cookies.token)
}

exports.editCampaign = (req, res) => {
    const user = util.verifyToken(req.cookies.token)
}


exports.getRoutes = (req, res) => {
    const user = util.verifyToken(req.cookies.token)

    res.render('shared/routes', { user: {
        id: user.id,
        username: user.user,
        role: user.role
    }})
}

exports.createRoute = (req, res) => {
    const user = util.verifyToken(req.cookies.token)
}

exports.removeRoute = (req, res) => {
    const user = util.verifyToken(req.cookies.token)
}

exports.editRoute = (req, res) => {
    const user = util.verifyToken(req.cookies.token)
}