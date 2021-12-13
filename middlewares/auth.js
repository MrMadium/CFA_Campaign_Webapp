const jwt = require('jsonwebtoken')
const util = require('../util/helpers')
let auth = {}

auth.apiSecured = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json('Unauthorised')
    }

    jwt.verify(token.split(" ")[1], 'OURAPPSECRET')

    next()
}

auth.isAuth = (req, res, next) => {
    if (!req.cookies.token) {
        res.render('login')
    } else {
        next()
    }
}

module.exports = auth