const crypto=require('crypto')

//Hash the Token

const hashToken=(token)=>{
    return crypto.createHash('sha256').update(token.toString()).digest('hex');
}

module.exports={
    hashToken
}