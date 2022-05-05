const express = require('express');
const router = express.Router();
const AgencyController = require('../controllers/agency.controllers');
const {isVerifiedEmail} = require('../middleware/auth')


//Routes agency
router.post('/register',AgencyController.registerAgency)
router.post('/login', AgencyController.loginAgency)
router.get('/logout', AgencyController.logout)
router.post('/password/forgetpassword', AgencyController.forgotPassword)
router.put('/password/reset/:token' , AgencyController.resetPassword)
router.get('/getProfil/:id' , AgencyController.getAgencyProfil)
router.put('/updateProfil/:id' , AgencyController.updateProfile)
router.post('/forgetpassword', AgencyController.forgotPasswordMobile)

module.exports = router;