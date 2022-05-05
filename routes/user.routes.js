const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controllers');
const { isAuthenticatedUser } = require('../middleware/auth')
const {isVerifiedEmail,isVerifiedPassword} = require('../middleware/auth')

//Routes user
router.post('/register',isVerifiedEmail, isVerifiedPassword,UserController.registerUser)
router.post('/login', UserController.loginUser)
router.get('/logout', UserController.logout)
router.post('/password/forgetpassword', UserController.forgotPassword)
router.put('/password/reset/:token' , UserController.resetPassword)
router.get('/getProfil/:id' ,  UserController.getUserProfil)
//router.put('/updateProfil/:id' ,isAuthenticatedUser, UserController.updateProfile)
router.put('/updateProfil/:id' , UserController.updateProfile)
router.post('/sms', UserController.sendsms)
router.post('/verify',isVerifiedEmail, isVerifiedPassword,UserController.verifyUser)
router.post('/forgetpasword',isVerifiedEmail,UserController.forgotPasswordMobile)



module.exports = router;