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

auth.isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token

        if (!token) return res.redirect("/login")

        const user = verifyToken(token)

        req.user = user

        next()

    } catch (e) {
        if (e.name == 'TokenExpiredError') {
            res.cookie('token', null, {
                expires: new Date(Date.now()),
                secure: false,
                httpOnly: true
            })
            res.redirect("/login")
        } else {
            console.error(e.stack)
        }
    }    
}

module.exports = auth