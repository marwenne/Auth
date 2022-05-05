const validator = require('validator')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('./catchAsyncErrors')

//verify Attributs
exports.VerfyAttributs = catchAsyncErrors(async (req, res, next) => {
    const fname = req.body.fname
    const lname = req.body.lname
    const phoneNum = req.body.phoneNum
    const email = req.body.email
    const  job = req.body.job
    const postalCode = req.body.postalCode
    validateAlpha = validator.isAlpha
    validateMobilPhone = validator.isMobilePhone
    validateNumber = validator.isNumeric
    validateEmail = validator.isEmail
//Verify attributs
    if(!fname.validateAlpha){
        return next(new ErrorHandler('Name must be alphabetic', 400))
    }
    if(!lname.validateAlpha){
        return next(new ErrorHandler('Last name must be alphabetic', 400))
    }
    if(!job.validateAlpha){
        return next(new ErrorHandler('Job must be alphabetic', 400))
    }
    if(!phoneNum.validateMobilPhone){
        return next(new ErrorHandler('Please enter valid phone number', 400))
    }
    if(!postalCode.validateNumber){
        return next(new ErrorHandler('Postal code must be number', 400))
    }
    if(!email.isEmail){
        return next(new ErrorHandler('Please enter valid email address', 400))
    }
    next()
})

