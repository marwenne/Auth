const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('./catchAsyncErrors')
const jwt = require("jsonwebtoken");
const user = require('../models/user.models');
const agency = require('../models/agency.models');
const passwordValidator = require('password-validator');
//const verifier = require('email-verify');

// verify user is connected or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return next(new ErrorHandler('Login first to access this ressource.', 401))
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
    req.user = await user.findById(decoded.id);
    next()
})

// verify admin is connected or not
exports.isAuthenticatedAdmin = catchAsyncErrors(async (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return next(new ErrorHandler('Login first to access this ressource.', 401))
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
    req.agency = await agency.findById(decoded.id);
    next()
})

//verify strong password
// Create a schema
const passwordSchema = new passwordValidator();
// Add properties to it
passwordSchema
.is().min(8)                                    // Minimum length 8
.is().max(20)                                   // Maximum length 20                           // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.has().symbols(1)                               // Should have at least 1 Symbol
.is().not().oneOf(['Passw0rd', 'Password123']);

//Quality password
exports.isVerifiedPassword = catchAsyncErrors(async(req, res , next)=>{
    var password= req.body.password
    if (passwordSchema.validate(password)== false){
        errmsg=""
        errList = passwordSchema.validate(password, { details: true });
        errList.forEach(function(value) 
        { errmsg=errmsg+"\n"+value.message})
        // return next(new ErrorHandler("Please enter valid Password:"+errmsg.replace(/string/g,'password') , 400))
        return res.status(400).json({ error: "Please enter valid Password:"+errmsg.replace(/string/g,'password') });
    }
    next()

})

//verify email
exports.isVerifiedEmail = catchAsyncErrors(async (req, res, next) => {
    const email = req.body.email
    if (email.length === 0) {
        //return next(new ErrorHandler('Your mail mesiing @ ', 400))
        return res.status(400).json({ error: 'Your mail is required' });
   }

    if (email.indexOf("@") < 0) {
         //return next(new ErrorHandler('Your mail mesiing @ ', 400))
         return res.status(400).json({ error: 'Your mail missing @' });
    }
    if (email.indexOf(".") < email.indexOf("@")) {
        //return next(new ErrorHandler('Your mail mesiing . ', 400))
        return res.status(400).json({ error: 'Your mail mesiing .' });
    }
    next()
})







