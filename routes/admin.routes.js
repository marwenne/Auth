const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/admin.controllers')
const {isAuthenticatedUser,isVerifiedEmail,isVerifiedPassword} = require('../middleware/auth')
//routes admin
router.post('/register',isVerifiedEmail,isVerifiedPassword, AdminController.registerAdmin)
router.post('/login', AdminController.loginAdmin)
router.get('/findalluser', isAuthenticatedUser, AdminController.getAllUser)
router.get('/searchAgency', isAuthenticatedUser, AdminController.getAgencyByname)
router.get('/findagency_not_verified', isAuthenticatedUser, AdminController.getNotVerifiedAgency)
router.get('/findagency_verified', isAuthenticatedUser, AdminController.getVerifiedAgency)
router.delete('/deleteuser/:id', isAuthenticatedUser, AdminController.deleteUser)
router.delete('/deleteagency/:id', isAuthenticatedUser, AdminController.deleteAgency)
router.put('/add_agency/:id' , isAuthenticatedUser, AdminController.AddAgencyByAdmin)
router.delete('/refused_agency/:id' , isAuthenticatedUser, AdminController.RefusedAgencyByAdmin)
router.get('/logout', AdminController.logout)
router.post('/password/forgetpassword' , AdminController.forgotPassword)
router.put('/password/reset/:token' , AdminController.resetPassword)
router.get('/logout', AdminController.logout)
router.get('/find_user' , isAuthenticatedUser, AdminController.getUserById)
module.exports = router;