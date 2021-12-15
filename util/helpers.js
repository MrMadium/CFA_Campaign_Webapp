const jwt = require('jsonwebtoken')
const config = require("../config/config.json")
const env = process.env.NODE_ENV || 'development';

exports.generateAccessToken = (user) => {
    const payload = { 
        id: user.userID, 
        user: user.userName, 
        brigades: user.Brigades, 
        role: user.permissionName 
    }

    return jwt.sign(payload, config[env].secret, { expiresIn: config[env].jwtExpiry })
}

exports.verifyToken = (token) => {
    return jwt.verify(token, 'OURAPPSECRET')
}

exports.stringToArray = (valueString) => {
    return valueString.match( /(?=\S)[^,]+?(?=\s*(,|$))/g )
}

exports.parameterIsArray = (parameter) => {
    if (parameter.includes("[")) {
        return true
    }
    return false
}