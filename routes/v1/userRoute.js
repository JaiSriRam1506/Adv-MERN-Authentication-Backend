const express = require('express')
const router=express.Router()

const {UserController}=require('../../controllers')
const {AuthMiddleware}=require('../../middlewares')

router.post('/register',UserController.userRegistration)
router.post('/login',UserController.userLogin)
router.get('/logout',UserController.userLogout)
router.get('/getUser',AuthMiddleware.checkAuthentication,UserController.getUser)
router.patch('/updateUser',AuthMiddleware.checkAuthentication,UserController.updateUser)
router.delete('/deleteUser/:id',AuthMiddleware.checkAuthentication,AuthMiddleware.adminOnly,UserController.deleteUser)
router.get('/getUsers',AuthMiddleware.checkAuthentication,AuthMiddleware.authorOnly,UserController.getUsers)
router.get('/getLoginStatus',AuthMiddleware.checkLoginStatus)
router.patch('/updateRole',AuthMiddleware.checkAuthentication,AuthMiddleware.adminOnly,UserController.updateRole)
router.post('/sendAutomatedEmail',AuthMiddleware.checkAuthentication,UserController.sendAutomatedEmail)

router.post('/sendVerificationEmail',AuthMiddleware.checkAuthentication,UserController.sendVerificationEmail)
router.patch('/verifyUser/:verificationToken',UserController.verifyUser)

router.post('/forgotPassword',UserController.forgotPassword)
router.patch('/resetPassword/:resetToken',UserController.resetPassword)

router.patch('/changePassword',AuthMiddleware.checkAuthentication,UserController.changePassword)

router.post('/sendLoginCode/:email',UserController.sendLoginCode)
router.post('/loginWithCode/:email',UserController.loginWithCode)
router.post('/google/callback',UserController.loginWithGoogle)

module.exports=router;