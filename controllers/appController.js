const request = require('request')
const util = require('../util/helpers')

/**
 * Controller for index.
 */
exports.index = (req, res) => {
    const user = util.verifyToken(req.cookies.token)

    if (user.role === 'Admin') {
        res.render('admin/dashboard', {
            user: {
                id: user.id,
                username: user.user,
                role: user.role
            }
        })
    } 

    let brigArray
    if (Array.isArray(user.brigades)) {
        brigArray = []
        user.brigades.forEach(brigade => {
            brigArray.push(brigade.brigadeID)
        })
        brigArray = `${brigArray}`
    } else {
        brigArray = user.brigades.brigadeID
    }
    
    request.get(`http://localhost:8000/api/appliances/brigade/${brigArray}`, {
        'auth': {
            'bearer': req.cookies.token
        }
    }, (error, response, body) => {
        const obj = JSON.parse(body);

        res.render('index', { 
            user: {
                id: user.id,
                username: user.user,
                role: user.role
            },
            appliances: obj
        })
    })
}

exports.getApplianceCampaigns = (req, res) => {
    const user = util.verifyToken(req.cookies.token)

    request.get(`http://localhost:8000/api/appliances/${req.params.appliance}`, {
        'auth': {
            'bearer': req.cookies.token
        }
    }, (error, response, body) => {
        const info = JSON.parse(body);

        res.render('index-2', { 
            user: {
                id: user.id,
                username: user.user,
                role: user.role
            },
            appliance: req.params.appliance,
            campaigns: info.Campaigns
        })
    })
}

exports.getCampaignRoutes = (req, res) => {
    const user = util.verifyToken(req.cookies.token)

    request.get(`http://localhost:8000/api/routes/campaign/${req.params.campaign}`, {
        'auth': {
            'bearer': req.cookies.token
        }
    }, (error, response, body) => {
        const info = JSON.parse(body);

        res.render('index-3', { 
            user: {
                id: user.id,
                username: user.user,
                role: user.role
            },
            appliance: req.params.appliance,
            campaign: req.params.campaign,
            routes: info
        })
    })
}

exports.getRoute = (req, res) => {
    const user = util.verifyToken(req.cookies.token)

    res.render('route', { 
        user: {
            id: user.id,
            username: user.user,
            role: user.role
        }
    })
}

exports.getLogin = (req, res) => {
    res.render('login')
}

exports.doLogin = (req, res) => {
    const { username, password } = req.body

    request.post({
        url: 'http://localhost:8000/api/auth/login',
        form: {
            username: username,
            password: password
        }
    }, (error, response, body) => {
        const info = JSON.parse(body);
        if (response.statusCode == 200) {
            res.cookie('token', info.access_token, {
                expires: new Date(Date.now() + 604800000),
                secure: false,
                httpOnly: true
            })
            res.redirect('/')
        } else {
            res.render('login', { loginMsg: JSON.parse(body) })
        }
    })
}

exports.doLogout = (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        secure: false,
        httpOnly: true
    })
    res.redirect('/login')
}

exports.getDashboard = (req, res) => {
    const token = util.verifyToken(req.cookies.token)
    
    if (token.role === 'Admin') {
        res.render('dashboard', {user: {
            id: user.id,
            username: user.user,
            role: user.role
        }})
    } else {
        res.status(401).send('Unauthorised')
    }
}

exports.getAccounts = (req, res) => {
    const user = util.verifyToken(req.cookies.token)

    let brigades = []
    user.brigades.forEach(brigade => {
        brigades.push(brigade.brigadeID)
    });

    if (user.role == 'Supervisor') {
        request.get({
            url: `http://localhost:8000/api/brigades/${brigades}`,
            'auth': {
                'bearer': req.cookies.token
            }
        }, (error, response, body) => {
            const info = JSON.parse(body);

            let users = []
            info.forEach(b => {
                b.Users.forEach(u => {
                    users.push(u)
                })
            })

            res.render('shared/accounts', { user: {
                id: user.id,
                username: user.user,
                role: user.role,
                brigade: info,
                accounts: users
            }})
        })
    }

    if (user.role == 'Admin') {
        request.get({
            url: `http://localhost:8000/api/users`,
            'auth': {
                'bearer': req.cookies.token
            }
        }, (error, response, body) => {
            const info = JSON.parse(body);

            res.render('shared/accounts', { user: {
                id: user.id,
                username: user.user,
                role: user.role,
                accounts: info
            }})
        })
    }
}

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

exports.getBrigades = (req, res) => {
    const user = util.verifyToken(req.cookies.token)

    if (user.role === 'Supervisor') {

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

    if (user.role === 'Admin') {
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