const Agency = require('../models/agency.models')
const sendToken = require('../utils/JWT_Tokenagency');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
var generator = require('generate-password');
//register agency
exports.registerAgency = async (req, res,next) => {
  
    try{
    const { nameagency,
        matricule,
        email,
        num_cnss,
        business_sector,
        legal_status } = req.body;

    const agency = await Agency.create({
        nameagency,
        matricule,
        email,
        num_cnss,
        business_sector,
       legal_status
    })

    
    res.status(200).json({
        success: true,
        message: `Your account has been added successfully You must wait for the acceptance by the administrator`,
        return : agency
    }
    )
   // res.status(200).json(agency)
}catch(e){
    console.log(e.message)
    return res.status(400).json({ "error":e.message.replace(/nameagency:|Agency validation failed:|matricule:|email:|num_cnss:|business_sector:|legal_status:/gi,'') });
     }  
}
//login agency
exports.loginAgency = async (req, res, next) => {
    const password = req.body.password
    const credentels = req.body.credentels;
     var agency;
    //verfy name and password agency
    if (!credentels || !password) {
        return res.status(401).json({ error: 'Please enter your name agency or email and password..!' });
    }
    if (credentels.indexOf('@') === -1) {
        agency = await Agency.findOne({ nameagency:credentels }).select('+password')
       if (!agency) {
          return res.status(401).json({ error: 'Invalid agency name or Password' });
       }
   }else{
    agency = await Agency.findOne({ email:credentels }).select('+password')
       if (!agency) {   
           return res.status(401).json({ error: 'Invalid email or Password' });
       }
   }
    //verify account is actif or not
    if(agency.verified == false){
        return res.status(401).json({ error: 'Your account is not verfied' });
    }
    const ipasswordMatched = await agency.comparePassword(password);
    if (!ipasswordMatched) {
       // return next(new ErrorHandler('Invalid password', 401));
       return res.status(401).json({ error: 'Invalid password' });
    }
    sendToken(agency, 200, res)
}
//Forget password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const agency = await Agency.findOne({ email: req.body.email });
    if (!agency) {
        return next(new ErrorHandler('Email not found...!', 404));
    }
    const resetToken = agency.getResetPasswordToken();
    await agency.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;
    const message = 
    `You asked us to reset your forgotten password.
     To complete the process, please click on the link below or paste 
     it into your browser:\n\n${resetUrl}\n\n`
    try {
        await sendEmail({
            email: agency.email,
            subject: 'MalaBus password ',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to: ${agency.email}`
        })
    } catch (error) {
        agency.resetPasswordToken = undefined;
        agency.resetPasswordExpire = undefined;
        await agency.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
})
//Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const agency = await Agency.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!agency) {
        return next(new ErrorHandler('Matricule reset token is invalid or has been expired', 400))
    }

    if (req.body.matricule !== req.body.confirmMatricule) {
        return next(new ErrorHandler('Matricule does not match', 400))
    }
    agency.matricule = req.body.matricule;
    agency.resetPasswordToken = undefined;
    agency.resetPasswordExpire = undefined;
    await agency.save();
    sendToken(agency, 200, res)
})
//loged agency
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
})


//Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const agency = await Agency.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!agency) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }
    // Setup new password
    agency.password = req.body.password;
    agency.resetPasswordToken = undefined;
    agency.resetPasswordExpire = undefined;
    await agency.save();
    sendToken(agency, 200, res)

})

//Forget password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const agency = await Agency.findOne({ email: req.body.email });
    if (!agency) {
        return next(new ErrorHandler('Email not found...!', 404));
    }
    const resetToken = agency.getResetPasswordToken();
    await agency.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;
    const message = 
    `You asked us to reset your forgotten password.
     To complete the process, please click on the link below or paste 
     it into your browser::\n\n${resetUrl}\n\n`
    try {
        await sendEmail({
            email: agency.email,
            subject: 'MalaBus password ',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to: ${agency.email}`
        })
    } catch (error) {
        agency.resetPasswordToken = undefined;
        agency.resetPasswordExpire = undefined;
        await agency.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
})

//find agency by id
exports.getAgencyProfil= async(req,res)=>{
    try {
    const agency = await Agency.findById(req.params.id)
    res.status(200).json(agency)
} 
catch (err) {
    res.status(500).json(err)
  }
}

// Update agency profile 
exports.updateProfile = catchAsyncErrors(async (req, res) => {
    const newAgency = {
        nameagency: req.body.nameagency,
        email: req.body.email,
        num_cnss : req.body.num_cnss,
        business_sector:req.body.business_sector,
        legal_status:req.body.legal_status
    }
    const agency = await Agency.findByIdAndUpdate(req.params.id, newAgency, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    })
})


exports.forgotPasswordMobile = catchAsyncErrors(async (req, res, next) => {
    const agency = await Agency.findOne({ email: req.body.email });
    if (!agency) {
        return res.status(404).json({ error: 'email not found' });
    }

    if (agency.verified==false) {
        return res.status(404).json({ error: 'agency not verified' });
    }
    // si agence non veririfier
    const newPassword  = generator.generate({
        length: 10,
        numbers: true,
        symbols:true,
        lowercase:true,
        uppercase:true,
        exclude:" "
    });
    hachedPassword = await bcrypt.hash(newPassword, 10)
    const updatedAgence = await Agency.findOneAndUpdate({ email: req.body.email }, {
        $set: {
            password:hachedPassword
        }
    })
    
    const message = 
    `this is a new password please use it to sign in and then change it :\n\n${newPassword}\n\n`
    try {
        await sendEmail({
            email: agency.email,
            subject: 'MalaBus password ',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to: ${agency.email}`
        })
    } catch (error) {
        return res.status(404).json({ error: error.message });
        
    }
})