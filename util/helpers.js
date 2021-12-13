const jwt = require('jsonwebtoken')

exports.generateAccessToken = (user) => {
    return jwt.sign(user, 'OURAPPSECRET', { expiresIn: '7d' })
}

exports.verifyToken = (token) => {
    return jwt.verify(token, 'OURAPPSECRET')
}

exports.stringToArray = (valueString) => {
    return valueString.substr(0, valueString.length - 1).substr(1).split(',');
}

exports.parameterIsArray = (parameter) => {
    if (parameter.includes("[")) {
        return true
    }
    return false
}