const AppError =require('../utils/error/app-error')
const {StatusCodes}=require('http-status-codes')
const User=require('../models/userModel');
const Token=require('../models/tokenModel');
const { AUTH } = require('../utils/common');
const { hashToken } = require('../utils/helper/index');
const parser = require('ua-parser-js');
const {ServerConfig}=require('../config');
const sendEmail = require('../utils/helper/sendMail');
const crypto=require('crypto')

const Cryptr = require('cryptr');
const cryptr = new Cryptr(ServerConfig.CRYPTR_KEY);

const {OAuth2Client} = require('google-auth-library');
const client=new OAuth2Client(ServerConfig.GOOGLE_CLIENT_ID)


async function userRegistration(userData,req){

    try {
        const {name,email,password}=userData;

        if(!name || !email || !password){
         throw new AppError('One of the field is missing', StatusCodes.BAD_GATEWAY);
        }
    
        if(password.length<6){
            throw new AppError('Password should be at least 6 digit', StatusCodes.BAD_GATEWAY);
        }
    
        const userFound=await User.findOne({email})
        if(userFound){
            throw new AppError('User Already Exists', StatusCodes.BAD_REQUEST)
        }

        const ua = parser(req.headers['user-agent']);
    
        const user=await User.create({
            name,
            email,
            password,
            userAgent:[ua.ua]
        })
    
        const JWT_Token=AUTH.createToken({_id:user._id});
        if(user) return {JWT_Token,user}
        else{
            throw new AppError('Unable to Process Registration:'+user,StatusCodes.INTERNAL_SERVER_ERROR);
        }
        
    } catch (error) {
        console.log(error);
        if(error instanceof AppError)throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError('Unable to Process Registration:'+error,StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function userLogin(req){

    try {
        const {email,password}=req.body;

    if(!email || !password){
        throw new AppError('Please fill Email or Password',StatusCodes.BAD_REQUEST)
    }

    const user=await User.findOne({email});
    if(!user){
        throw new AppError('No User Found with this Email',StatusCodes.BAD_REQUEST);
    }
    const validPassword=await AUTH.checkPassword(password,user.password)

    if(!validPassword){
        throw new AppError('Password is incorrect',StatusCodes.BAD_REQUEST)
    }

    //2Factor Authentication
    const ua = parser(req.headers['user-agent']);
    const currentAgent=ua.ua;
    const unknownAgent=user.userAgent.includes(currentAgent);

    if(!unknownAgent){

        //Generate Login Code
        const loginCode=Math.floor(100000+Math.random()*900000)

        //Encrypt Login Code
        const encryptedLoginToken=cryptr.encrypt(loginCode.toString())
        //Delete if any Verification Token Exists
        const token=await Token.findOne({userId:user._id})
        if(token){
            await token.deleteOne()
        }

        //Save the hashedToken to the database
        await new Token({
            userId:user._id,
            loginToken:encryptedLoginToken,
            createdAt:Date.now(),
            expiresAt:Date.now() + 60*(60*1000)  //60Min
        }).save()
        throw new AppError('New Device has detected',StatusCodes.UNAUTHORIZED)
    }

    if(user && validPassword){
        const jwtToken=AUTH.createToken({_id:user?._id})
        return {jwtToken, user}
    }
    else{
        throw new AppError('Something Went Wrong, Please try again later',StatusCodes.INTERNAL_SERVER_ERROR)
    }

    } catch (error) {
        if(error instanceof AppError)throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError('Something Went Wrong: '+error,StatusCodes.INTERNAL_SERVER_ERROR); 
    }
}

async function sendVerificationEmail(req){
    try {
        const user= await User.findById(req.user._id);
        if(!user){
            throw new AppError('User not found',StatusCodes.NOT_FOUND)
        }
        if(user.isVerified){
            throw new AppError('User already verified',StatusCodes.NOT_FOUND)
        }

        //Delete if any Verification Token Exists
        const token=await Token.findOne({userId:user._id})
        if(token){
            await token.deleteOne()
        }

        //Create a verification Token
        const verificationToken=crypto.randomBytes(32).toString('hex')+user._id
        console.log(verificationToken);
        //Hashed the Token
        const hashedToken=hashToken(verificationToken)
        //Save the hashedToken to the database
        await new Token({
            userId:user._id,
            verToken:hashedToken,
            createdAt:Date.now(),
            expiresAt:Date.now() + 60*(60*1000)  //60Min
        }).save()

        //Create Verification URl

        const verificationUrl=`${ServerConfig.FRONTEND_URL}verify/${verificationToken}`

        //sendEmail
        const sent_from=ServerConfig.OUTLOOK_USER
        const name=user.name
        const subject="Verification Email: AuthYoYo✌️✌️✌️"
        const template="verifyEmail"
        const send_to=user.email
        const reply_to='noreply@yoyo.com'
        const response=await sendEmail(subject,send_to,sent_from,template,reply_to,name,verificationUrl)
        return response;
        
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError("Unable to send the Verification Email",StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function forgotPassword(email){
    try {

        if(!email){
            throw new AppError('Please provide Email of the User',StatusCodes.BAD_REQUEST)
        }

        const user= await User.findOne({email});

        if(!user){
            throw new AppError('User not found',StatusCodes.NOT_FOUND)
        }

        //Delete if any Verification Token Exists
        const token=await Token.findOne({userId:user._id})
        if(token){
            await token.deleteOne()
        }

        //Create a verification Token
        const resetToken=crypto.randomBytes(32).toString('hex')+user._id
        console.log(resetToken);
        //Hashed the Token
        const hashedToken=hashToken(resetToken)
        //Save the hashedToken to the database
        await new Token({
            userId:user._id,
            resetToken:hashedToken,
            createdAt:Date.now(),
            expiresAt:Date.now() + 60*(60*1000)  //60Min
        }).save()

        //Create Verification URl

        const resetUrl=`${ServerConfig.FRONTEND_URL}resetPassword/${resetToken}`

        //sendEmail
        const sent_from=ServerConfig.OUTLOOK_USER
        const name=user.name
        const subject="Reset Email: AuthYoYo✌️✌️✌️"
        const template="forgotPassword"
        const send_to=user.email
        const reply_to='noreply@yoyo.com'
        const response=await sendEmail(subject,send_to,sent_from,template,reply_to,name,resetUrl)
        return response;
        
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError("Unable to send the Reset Email",StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function verifyUser(verificationToken){
    try {
        const hashedToken=hashToken(verificationToken);

        const tokenFound=await Token.findOne({
            verToken:hashedToken,
            expiresAt:{
                $gt:Date.now()
            }
        })
        if(!tokenFound){
            throw new AppError('Token has expired or timeout, Please re-send the verification email',StatusCodes.FORBIDDEN)
        }
        const user= await User.findById(tokenFound.userId).select('-password')
        if(!user){
            throw new AppError('User not found, Contact Administrator',StatusCodes.NOT_FOUND)
        }
        if(user.isVerified){
            throw new AppError('User Already verified, no need of verification',StatusCodes.BAD_REQUEST)
        }
    
        user.isVerified=true;
        await user.save();
        return user;
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError("Unable to Verify the User: "+error,StatusCodes.INTERNAL_SERVER_ERROR); 
    }

}

async function resetPassword(resetToken,password,cPassword){
    try {

        if(!password || !cPassword || password!==cPassword){
            throw new AppError('Please Provide Password or Password doesn\'t match with Confirm Password',StatusCodes.BAD_REQUEST)
        }
        const hashedToken=hashToken(resetToken);

        const tokenFound=await Token.findOne({
            resetToken:hashedToken,
            expiresAt:{
                $gt:Date.now()
            }
        })
        if(!tokenFound){
            throw new AppError('Token has expired or timeout, Please re-send the Reset email',StatusCodes.FORBIDDEN)
        }
        const user= await User.findById(tokenFound.userId)
        if(!user){
            throw new AppError('User not found, Contact Administrator',StatusCodes.NOT_FOUND)
        }
    
        user.password=password;
        await user.save();
        return await User.findById(tokenFound.userId).select('-password')
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError("Unable to Reset the Password: "+error,StatusCodes.INTERNAL_SERVER_ERROR); 
    }

}

async function changePassword(req){
    try {
        const {oldPassword,newPassword}=req.body;

        if(!oldPassword || !newPassword || oldPassword===newPassword){
            throw new AppError('Please Provide Password or New Password shouldn\'t same with Old Password',StatusCodes.BAD_REQUEST)
        }

        const user= await User.findById(req.user._id)

        if(!user){
            throw new AppError('User not found, Contact Administrator',StatusCodes.NOT_FOUND)
        }
        const passMatched= await AUTH.checkPassword(oldPassword,user.password)

        if(!passMatched){
            throw new AppError('Please provide correct Old Password',StatusCodes.BAD_REQUEST)
        }

        if(user && passMatched){
            user.password=newPassword;
            await user.save();
            //const ReportUrl=`${ServerConfig.FRONTEND_URL}verify/${verificationToken}`

            //sendEmail
            const sent_from=ServerConfig.OUTLOOK_USER
            const name=user.name
            const subject="Successfully Changed the Password: AuthYoYo✌️✌️✌️"
            const template="changePassword"
            const send_to=user.email
            const reply_to='noreply@yoyo.com'
            await sendEmail(subject,send_to,sent_from,template,reply_to,name)
        }
        return await User.findById(user._id).select('-password')
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError("Unable to Change the Password: "+error,StatusCodes.INTERNAL_SERVER_ERROR); 
    }

}

async function updateUser(req){
    try {
        const user= await User.findById(req.user._id);
        if(!user){
            throw new AppError('User not found',StatusCodes.NOT_FOUND);
        }
        
        const {name,phone,bio,photo}=user;
        user.name=req.body.name || name;
        user.name=req.body.name || name;
        user.phone=req.body.phone || phone
        user.bio=req.body.bio || bio
        user.photo=req.body.photo || photo

        const updatedUser = await user.save();
        return updatedUser;
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError("Unable to authenticate to the Server",StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateRole(userData){
    try {
        const {id,role}=userData;

        if(!id || !role){
            throw new AppError('Id or Role is missing',StatusCodes.BAD_REQUEST)
        }
        const user= await User.findById(id).select('-password');

        if(!user){
            throw new AppError('User not found',StatusCodes.NOT_FOUND);
        }
        if(user.role===role){
            throw new AppError('User Role already updated',StatusCodes.BAD_REQUEST);
        }
        // if(!user.isVerified){
        //     throw new AppError('User is not verified,Please ask the user to verify first',StatusCodes.BAD_REQUEST);
        // }
        user.role=role;
        await user.save();
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError("Unable to authenticate to the Server",StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function deleteUser(req){
    try {
        //console.log(req.params.id)
        const user= await User.findById(req.params.id);
        if(!user){
            throw new AppError('User not found',StatusCodes.NOT_FOUND);
        }
        await User.deleteOne({_id:user._id})
        //await user.remove();
    } catch (error) {
        console.log(error);
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError("Unable to authenticate to the Server",StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function sendAutomatedEmail(data){
    try {
        console.log(data)
        const {subject,send_to,template,reply_to,url,role}=data;

        if(!subject || !send_to || !template || !reply_to || !role){
            throw new AppError('Email Params is missing',StatusCodes.BAD_REQUEST)
        }
        const user=await User.findOne({email:send_to})
        if(!user){
            throw new AppError('User not found',StatusCodes.NOT_FOUND)
        }
        if(user.role===role){
            throw new AppError(`User already have ${role} role`,StatusCodes.NOT_FOUND)
        }
        const sent_from=ServerConfig.OUTLOOK_USER
        const name=user.name
        const links=ServerConfig.FRONTEND_URL+url
        const response=await sendEmail(subject,send_to,sent_from,template,reply_to,name,links,role)
        return response;
        
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError("Unable to send the Email",StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function sendLoginCode(email){
    try {

        if(!email){
            throw new AppError('Email Params is missing',StatusCodes.BAD_REQUEST)
        }
        const user=await User.findOne({email})
        if(!user){
            throw new AppError('User not found',StatusCodes.NOT_FOUND)
        }

        const tokenFound=await Token.findOne({
            userId:user._id,
            expiresAt:{
                $gt:Date.now()
            }
        })
        if(!tokenFound){
            throw new AppError('Token has expired or timeout, Please re-login to get Login Code',StatusCodes.FORBIDDEN)
        }

        const loginCode=tokenFound.loginToken
        const decryptedCode=cryptr.decrypt(loginCode);

         //sendEmail
        const sent_from=ServerConfig.OUTLOOK_USER
        const name=user.name
        const subject="Login Code: AuthYoYo✌️✌️✌️"
        const template="loginCode"
        const send_to=email
        const reply_to='noreply@yoyo.com'
        const response=await sendEmail(subject,send_to,sent_from,template,reply_to,name,decryptedCode)
        return response;
    } catch (error) {
        console.log(error);
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError("Unable to send the Email",StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function loginWithCode(req){
    try {
        const {loginCode}=req.body
        const {email}=req.params

        const user=await User.findOne({email}).select('-password')
        if(!user){
            throw new AppError('User not found',StatusCodes.NOT_FOUND)
        }

        const tokenFound=await Token.findOne({
            userId:user._id,
            expiresAt:{$gt:Date.now()}
        })

        if(!tokenFound){
            throw new AppError('Token is expired or wrong, Please try-again',StatusCodes.NOT_FOUND)
        }

        const decryptToken=cryptr.decrypt(tokenFound.loginToken);

        if(decryptToken!==loginCode){
            throw new AppError('Token has expired or wrong Token, Please try again',StatusCodes.BAD_REQUEST)
        }

        const ua = parser(req.headers['user-agent']);
        user.userAgent.push(ua.ua);
        await user.save();
        const jwtToken=AUTH.createToken({_id:user?._id})
        return {jwtToken, user}
  
    } catch (error) {
        if(error instanceof AppError)throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError('Something Went Wrong while login with Code: '+error,StatusCodes.INTERNAL_SERVER_ERROR); 
    }
}

async function loginWithGoogle(req){
    try {
        const {userToken}=req.body
        const ticket=await client.verifyIdToken({
            idToken:userToken,
            audience:ServerConfig.GOOGLE_CLIENT_ID
        })
        const payload=ticket.getPayload();
        const {name,email,sub,picture}=payload;

        const user=await User.findOne({email}).select('-password')
        if(!user){
        //Register User
        const ua = parser(req.headers['user-agent']);
    
        const newUser=await User.create({
            name,
            email,
            password:Date.now()+sub,
            photo:picture,
            isVerified:true,
            userAgent:[ua.ua]
        })
        if(!newUser){
            throw new AppError('Not able to login/signup using Google Account',StatusCodes.INTERNAL_SERVER_ERROR)
        }
        if(newUser){
        const jwtToken=AUTH.createToken({_id:newUser?._id})
        return {jwtToken, user:newUser}
        }
    }
    const jwtToken=AUTH.createToken({_id:user?._id})
    return {jwtToken, user}
  
    } catch (error) {
        if(error instanceof AppError)throw error;
        if(error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name=='TokenExpiredError'){
            throw new AppError('JWT Token has been expired',StatusCodes.BAD_REQUEST)
        }
        throw new AppError('Something Went Wrong while login with Google Account: '+error,StatusCodes.INTERNAL_SERVER_ERROR); 
    }
}


module.exports={
    userRegistration,
    userLogin,
    updateUser,
    deleteUser,
    updateRole,
    sendAutomatedEmail,
    sendVerificationEmail,
    verifyUser,
    forgotPassword,
    resetPassword,
    changePassword,
    sendLoginCode,
    loginWithCode,
    loginWithGoogle
}