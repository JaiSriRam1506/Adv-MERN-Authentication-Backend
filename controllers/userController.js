const { UserService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { ServerConfig } = require("../config");
const User = require("../models/userModel");

async function userRegistration(req, res) {
  try {
    const response = await UserService.userRegistration(
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      },
      req
    );
    const { JWT_Token, user } = response;
    const { _id, name, email, phone, bio, photo, role, isVerified, userAgent } =
      user;
    SuccessResponse.data = {
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      isVerified,
      role,
      JWT_Token,
      userAgent,
    };
    SuccessResponse.message = "User Registration Successful";
    console.log(SuccessResponse.data);

    return res
      .status(StatusCodes.CREATED)
      .cookie("token", JWT_Token, {
        // expiresIn: ServerConfig.JWT_EXPIRY,
        httpOnly: true,
        // path = where the cookie is valid
        path: "/",
        // secure = only send cookie over https
        secure: true,
        // sameSite = only send cookie if the request is coming from the same origin
        sameSite: "none", // "strict" | "lax" | "none" (secure must be true)
        // maxAge = how long the cookie is valid for in milliseconds
        maxAge: 2592000000, // 1 hour
      })
      .json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.data = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV == "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function sendVerificationEmail(req, res) {
  try {
    const sendMail = await UserService.sendVerificationEmail(req);
    SuccessResponse.message = `Successfully send the verification email to ${req.user.email}`;
    SuccessResponse.data = sendMail;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function forgotPassword(req, res) {
  try {
    const sendMail = await UserService.forgotPassword(req.body.email);
    SuccessResponse.message = `Successfully send the reset Password email`;
    SuccessResponse.data = sendMail;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function changePassword(req, res) {
  try {
    const response = await UserService.changePassword(req);
    SuccessResponse.message = `Successfully changed the Password`;
    SuccessResponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function verifyUser(req, res) {
  try {
    const response = await UserService.verifyUser(req.params.verificationToken);
    SuccessResponse.message = `Verification has Successful`;
    SuccessResponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function resetPassword(req, res) {
  try {
    const response = await UserService.resetPassword(
      req.params.resetToken,
      req.body.password,
      req.body.cPassword
    );
    SuccessResponse.message = `Successfully Reset the Password`;
    SuccessResponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function userLogin(req, res) {
  try {
    const response = await UserService.userLogin(req);
    const { JWT_Token, user } = response;
    const { _id, name, email, phone, bio, photo, role, isVerified, userAgent } =
      user;
    SuccessResponse.data = {
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      isVerified,
      role,
      JWT_Token,
      userAgent,
    };
    SuccessResponse.message = "Login Successful";
    return res
      .status(StatusCodes.OK)
      .cookie("token", JWT_Token, {
        // expiresIn: ServerConfig.JWT_EXPIRY,
        httpOnly: true,
        // path = where the cookie is valid
        path: "/",
        // secure = only send cookie over https
        secure: true,
        // sameSite = only send cookie if the request is coming from the same origin
        sameSite: "none", // "strict" | "lax" | "none" (secure must be true)
        // maxAge = how long the cookie is valid for in milliseconds
        maxAge: 2592000000, // 1 hour
      })
      .json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : "";
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function userLogout(req, res) {
  try {
    SuccessResponse.data = { jWT_Token: "" };
    SuccessResponse.message = "Logout Successful";
    return res
      .status(StatusCodes.OK)
      .cookie("token", "", {
        // expiresIn: ServerConfig.JWT_EXPIRY,
        httpOnly: true,
        // path = where the cookie is valid
        path: "/",
        // secure = only send cookie over https
        secure: true,
        // sameSite = only send cookie if the request is coming from the same origin
        sameSite: "none", // "strict" | "lax" | "none" (secure must be true)
        // maxAge = how long the cookie is valid for in milliseconds
        maxAge: 0, // 1 hour
      })
      .json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function getUser(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    // console.log("Controller")
    // console.log(user)
    SuccessResponse.message = "Successfully retrieved the User data";
    SuccessResponse.data = user;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function getUsers(req, res) {
  try {
    const users = await User.find().sort("createdAt").select("-password");
    SuccessResponse.message = "Successfully retrieved all the User data";
    SuccessResponse.data = users;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function updateUser(req, res) {
  try {
    const updatedUser = await UserService.userUpdate(req);
    const user = await User.findById(updatedUser._id).select("-password");
    SuccessResponse.message = "Successfully updated the User data";
    SuccessResponse.data = user;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    // console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function deleteUser(req, res) {
  try {
    await UserService.deleteUser(req);
    SuccessResponse.message = "Successfully deleted the User data";
    SuccessResponse.data = "";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function updateRole(req, res) {
  try {
    const updatedRole = await UserService.updateRole({
      id: req.body.id,
      role: req.body.role,
    });
    SuccessResponse.message = `Successfully updated the User Role to ${req.body.role}`;
    SuccessResponse.data = "";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function sendAutomatedEmail(req, res) {
  try {
    const sendMail = await UserService.sendAutomatedEmail(req.body);
    SuccessResponse.message = `Successfully send the email to ${req.body.send_to}`;
    SuccessResponse.data = sendMail;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function sendLoginCode(req, res) {
  try {
    const response = await UserService.sendLoginCode(req.params.email);
    //The below code is not required
    // const { jwtToken, user}=response;
    // const { _id,name,email,phone,bio,photo,role,isVerified,userAgent} =user;
    //SuccessResponse.data={_id,name,email,phone,bio,photo,isVerified,role,jwtToken,userAgent}
    SuccessResponse.data = "";
    SuccessResponse.message = "Login Code Send Successfully";
    return (
      res
        .status(StatusCodes.OK)
        //   .cookie('token',jwtToken,{
        //         path:'/',
        //         httpOnly:true,
        //         expiresIn:ServerConfig.JWT_EXPIRY,
        //         sameSite:false,
        //         secure:true
        //   })
        .json(SuccessResponse)
    );
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function loginWithCode(req, res) {
  try {
    const response = await UserService.loginWithCode(req);
    const { JWT_Token, user } = response;
    const { _id, name, email, phone, bio, photo, role, isVerified, userAgent } =
      user;
    SuccessResponse.data = {
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      isVerified,
      role,
      JWT_Token,
      userAgent,
    };
    SuccessResponse.message = `Login Successful with Code`;
    //SuccessResponse.data=response;
    return res
      .status(StatusCodes.OK)
      .cookie("token", JWT_Token, {
        // expiresIn: ServerConfig.JWT_EXPIRY,
        httpOnly: true,
        // path = where the cookie is valid
        path: "/",
        // secure = only send cookie over https
        secure: true,
        // sameSite = only send cookie if the request is coming from the same origin
        sameSite: "none", // "strict" | "lax" | "none" (secure must be true)
        // maxAge = how long the cookie is valid for in milliseconds
        maxAge: 3600000, // 1 hour
      })
      .json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

async function loginWithGoogle(req, res) {
  try {
    const response = await UserService.loginWithGoogle(req);
    const { JWT_Token, user } = response;
    const { _id, name, email, phone, bio, photo, role, isVerified, userAgent } =
      user;
    SuccessResponse.data = {
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      isVerified,
      role,
      JWT_Token,
      userAgent,
    };
    SuccessResponse.message = `Login Successful with Google Account`;
    return res
      .status(StatusCodes.OK)
      .cookie("token", JWT_Token, {
        // expiresIn: ServerConfig.JWT_EXPIRY,
        httpOnly: true,
        // path = where the cookie is valid
        path: "/",
        // secure = only send cookie over https
        secure: true,
        // sameSite = only send cookie if the request is coming from the same origin
        sameSite: "none", // "strict" | "lax" | "none" (secure must be true)
        // maxAge = how long the cookie is valid for in milliseconds
        maxAge: 3600000, // 1 hour
      })
      .json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.message = error.explanation;
    ErrorResponse.error = error;
    ErrorResponse.stack =
      ServerConfig.NODE_ENV === "development" ? error.stack : null;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}
module.exports = {
  userRegistration,
  userLogin,
  userLogout,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  updateRole,
  sendAutomatedEmail,
  sendVerificationEmail,
  verifyUser,
  forgotPassword,
  resetPassword,
  changePassword,
  sendLoginCode,
  loginWithCode,
  loginWithGoogle,
};
