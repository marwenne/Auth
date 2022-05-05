const Admin = require('../models/admin.models')
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/JWT_Token');
const User = require('../models/user.models');
const Agency = require('../models/agency.models');
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const generator = require("generate-password");
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const bcrypt = require('bcryptjs')


//register agency
exports.registerAdmin = async (req, res) => {
    const { username, password, email  } = req.body;
    const admin = await Admin.create({
        username,
        password,
        email,
    })
    res.status(200).json(admin);
    console.log(admin)
}

//login admin

exports.loginAdmin = async (req , res ,next)=>{
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new ErrorHandler('Please enter your Username and Password..!', 400))
    }
    const admin = await Admin.findOne({ username }).select('+password')
    if (!admin) {
        return next(new ErrorHandler('Invalid Username or Password', 401));
    }
    const isPasswordMatched = await admin.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Password', 401));
    }
    sendToken(admin, 200, res)
}


//get all users
exports.getAllUser= async(req,res)=>{
    try {
    const users = await User.find().select('-password')
    res.status(200).json(users)
} 
catch (err) {
    res.status(500).json(err)
  }
}

//get not verified agency
exports.getNotVerifiedAgency= async(req,res)=>{
    try {
    const agencys = await Agency.find({verified : false})
    res.status(200).json(agencys)
} 
catch (err) {
    res.status(500).json(err)
  }
}
//get verified agency
exports.getVerifiedAgency= async(req,res)=>{
    try {
    const agencys = await Agency.find({verified : true})
    res.status(200).json(agencys)
} 
catch (err) {
    res.status(500).json(err)
  }
}
//add agency 
exports.AddAgencyByAdmin = catchAsyncErrors(async (req, res,next) => {
    var psw = generator.generate({
        length: 10,
        numbers: true,
      });
    const newAgency = {
      verified : true,
      password : await bcrypt.hash(psw, 10)
    }
    const message =`Your account has been accepted by admin and use this password :\n\n${psw}\n\n
    and you can changed it`

    const agency = await Agency.findByIdAndUpdate(req.params.id, newAgency)
    try {
        await sendEmail({
            email: agency.email,
            subject: 'MalaBus Accepted account',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to: ${agency.email}`,
        }
        )
    }
    catch (error) {
        await agency.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
})

//Refuser agency
exports.RefusedAgencyByAdmin = catchAsyncErrors(async (req, res,next) => {
    const message =`Your account has been Refused by admin `
    const agency = await Agency.findByIdAndDelete(req.params.id)
    if (agency.verified==false)
    {
        try {
            await sendEmail({
                email: agency.email,
                subject: 'MalaBus Refused account',
                message
            })
            res.status(200).json({
                success: true,
                message: `Email sent to: ${agency.email}`,
                messageError :`Acount refused`
            }
            )
        }
        catch (error) {
            await agency.save({ validateBeforeSave: false });
            return next(new ErrorHandler(error.message, 500));
        }
    }
        else{

            res.status(400).json({
                message: `this acoount in already verified`,
                
            }
            )
        }
    
    
})


//search agency by name
exports.getAgencyByname = (async (req, res, next) => {
    const {nameagency  } = req.body;
    const agency = await Agency.findOne({ nameagency }).select('+nameagency')
    if (!agency) {
        return next(new ErrorHandler('Invalid agency name', 401));
    }
        res.status(200).json(agency)
})
// delete user
exports.deleteUser= async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        !user && res.status(404).json("user not found");
        await user.deleteOne();
        res.status(200).json("the user has been deleted");
} 
catch (err) {
    res.status(500).json(err)
  }
}

// delete agency
exports.deleteAgency= async(req,res)=>{
    try {
        const agency = await Agency.findById(req.params.id);
        !agency && res.status(404).json("agency not found");
        await agency.deleteOne();
        res.status(200).json("the agency has been deleted");
} 
catch (err) {
    res.status(500).json(err)
  }
}

//Forget password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
        return next(new ErrorHandler('Email not found...!', 404));
    }
    const resetToken = admin.getResetPasswordToken();
    await admin.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;
    const message = 
    `You asked us to reset your forgotten password.
     To complete the process, please click on the link below or paste 
     it into your browser:\n\n${resetUrl}\n\n`
    try {
        await sendEmail({
            email: admin.email,
            subject: 'MalaBus password ',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to: ${admin.email}`
        })
    } catch (error) {
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpire = undefined;
        await admin.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
})

//Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const admin = await Admin.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!admin) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }
    // Setup new password
    admin.password = req.body.password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save();
    sendToken(admin, 200, res)

})


//loged admin
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

//find admin by id
exports.getAdminProfil= async(req,res)=>{
    try {
    const admin = await Admin.findById(req.params.id)
    res.status(200).json(admin)
} 
catch (err) {
    res.status(500).json(err)
  }
}

//find user by id_user
exports.getUserById= async(req,res)=>{
    try {
        id = req.body.id_user
    const user = await User.findOne({ id_user:id })
    res.status(200).json(user)
} 
catch (err) {
    res.status(500).json(err)
  }
}

// Update admin profile 
exports.updateProfile = catchAsyncErrors(async (req, res) => {
    const newAdmin = {  
        username : req.body.username,
        email: req.body.email,
    }
    const admin = await Admin.findByIdAndUpdate(req.params.id,newAdmin, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    })
})


