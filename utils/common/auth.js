const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const {ServerConfig}=require('../../config')
const serverConfig = require('../../config/server-config')

async function createToken(input){
    try {
        console.log("CreateToken:----",input)
        return await jwt.sign(input,serverConfig.JWT_SECRET,{expiresIn:ServerConfig.JWT_EXPIRY})  
    } catch (error) {
        console.log(error)
        throw error;
    }

}

async function verifyToken(token){
    try {
        console.log("Verify Token:---",token)
        return await jwt.verify(token,serverConfig.JWT_SECRET)
    } catch (error) {
        console.log(error)
        throw error;
    }

}

async function checkPassword(plainPassword,encryptedPassword){
    try {
        console.log("CheckPassword:---",plainPassword,encryptedPassword)
        return await bcrypt.compare(plainPassword,encryptedPassword) 
    } catch (error) {
        console.log(error)
        throw error;
    }
}

module.exports={
    createToken,
    verifyToken,
    checkPassword
}