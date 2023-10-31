const { StatusCodes } = require("http-status-codes");
const User = require("../models/userModel");
const { AUTH, ErrorResponse } = require("../utils/common");
const AppError =require('../utils/error/app-error')
const {ServerConfig}=require('../config')

async function checkAuthentication(req,res,next){
    try {
        const token=req.cookies.token;
        if(!token) throw new AppError('Please provide Access Token or Login first',StatusCodes.BAD_REQUEST);
        const isTokenExists=await AUTH.verifyToken(token);
        if(!isTokenExists)throw error;
        let user;

        if(isTokenExists){
            user= await User.findById(isTokenExists._id).select('-password');
        }
        if(!user){
            throw new AppError('User not found',StatusCodes.NOT_FOUND);
        }
        if(user.role==='suspended'){
            throw new AppError('User has suspended, Please contact support',StatusCodes.BAD_REQUEST);
        }


        if(token && isTokenExists && user){
            req.user=user;
            next();
        }
        else{
            throw new AppError("Unable to authenticate to the Server,Please try again",StatusCodes.INTERNAL_SERVER_ERROR);
        }
    } catch (error) {
        console.log(error);
        ErrorResponse.message=error.explanation;
        ErrorResponse.error=error;
        let statusCode=StatusCodes.INTERNAL_SERVER_ERROR
        ErrorResponse.stack=ServerConfig.NODE_ENV==='development'?error.stack:null;
        if(error.name == 'JsonWebTokenError') {
            ErrorResponse.message='Invalid JWT token';
            statusCode=StatusCodes.UNAUTHORIZED
        }
        if(error.name=='TokenExpiredError'){
            ErrorResponse.message='JWT Token has been expired';
            statusCode=StatusCodes.UNAUTHORIZED
        }
        return res
                  .status(statusCode)
                  .json(ErrorResponse)
        
    }
}

async function adminOnly(req,res,next){
    try {
        if(req.user && req.user.role=='admin'){
            next();
        }
        else {
            throw new AppError('User is not authorized to do the required Action',StatusCodes.UNAUTHORIZED)
        }
    } catch (error) {
        console.log(error);
        return res
                  .status(StatusCodes.UNAUTHORIZED)
                  .json(error)
    }
}

async function authorOnly(req,res,next){
    try {
        if(req.user && (req.user.role==='author' || req.user.role==='admin'))next();
        else throw new AppError('User is not authorized to do the required Action',StatusCodes.UNAUTHORIZED)
    } catch (error) {
        console.log(error);
        return res
                  .status(StatusCodes.UNAUTHORIZED)
                  .json(error)
    }
}

async function isVerified(req,res,next){
    try {
        if(req.user && req.user.isVerified)next();
        else throw new AppError('User is not verified, Please verify to do the required Action',StatusCodes.UNAUTHORIZED)
    } catch (error) {
        console.log(error)
        return res
                  .status(StatusCodes.UNAUTHORIZED)
                  .json(error)
    }
}

async function checkLoginStatus(req,res,next){
    try {
        const token=req.cookies.token;
        if(!token) return res.json(false);
        const response=AUTH.verifyToken(token);
        if(!response) return res.json(false);
        return res.json(true);
    } catch (error) {
        console.log(error);
        return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(false)
    }
}


module.exports={
    checkAuthentication,
    adminOnly,
    authorOnly,
    isVerified,
    checkLoginStatus
}