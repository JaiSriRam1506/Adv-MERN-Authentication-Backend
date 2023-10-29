const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const {ServerConfig}=require('../../config')
const serverConfig = require('../../config/server-config')

function createToken(input){
    try {

        return jwt.sign(input,serverConfig.JWT_SECRET,{expiresIn:ServerConfig.JWT_EXPIRY})  
    } catch (error) {
        throw error;
    }

}

function verifyToken(token){
    try {
        return jwt.verify(token,serverConfig.JWT_SECRET)
    } catch (error) {
        throw error;
    }

}

function checkPassword(plainPassword,encryptedPassword){
    try {
        return bcrypt.compareSync(plainPassword,encryptedPassword) 
    } catch (error) {
        throw error;
    }
}

module.exports={
    createToken,
    verifyToken,
    checkPassword
}