const req = require('express/lib/request')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || "development"
const config = require("../config/config.json")
const { verifyToken } = require("../util/helpers")
let auth = {}

auth.apiSecured = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json('Unauthorised')
    }

    jwt.verify(token.split(" ")[1], 'OURAPPSECRET')

    next()
}

auth.authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // authenticate JWT token and attach user to request object (req.user)
        
        const user = verifyToken(req.cookies.token)

        req.user = user

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        next()
    };
}

module.exports = auth