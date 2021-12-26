const jwt = require('jsonwebtoken')
const config = require("../config/config.json")
const env = process.env.NODE_ENV || 'development';
const request = require('request')

exports.generateAccessToken = (payload) => {
    return jwt.sign(payload, config[env].secret, { expiresIn: config[env].jwtExpiry })
}

exports.verifyToken = (token) => {
    return jwt.verify(token, 'OURAPPSECRET')
}

exports.stringToArray = (valueString) => {
    return valueString.match( /(?=\S)[^,]+?(?=\s*(,|$))/g )
}

exports.objArrayToArray = (arr, k) => {
    const a = arr.map(b => {
        return b[k]
    })
    return a
}

exports.arrayToUrlParams = (arr, key) => {
    console.log(arr)
    return params
}