const User = require('../models/user.models');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/JWT_Token');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const genUsername = require("unique-username-generator");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
var generator = require('generate-password');


//register user
exports.registerUser = async (req, res, next) => {
    var id_user ="#";
    var userExist;
    
    try{
  
    const { fname, lname, username,
        birthday, phoneNum, email,
        password, job, civility,
        address, postalCode, city,
        country,status } = req.body;
        userExist = await User.findOne({ email:req.body.email })
        if (userExist) {
            return res.status(401).json({ error: 'user already exist' });
        }
        
        id_user = id_user + genUsername.generateFromEmail(email,3) 
        const user = await User.create({
            fname, lname, username,
            birthday, phoneNum, email,
            password, job, civility,
            address, postalCode, city,
            country,id_user,status
        })

        res.status(200).json(user);
        console.log(user)
    }
    catch(e){
        console.log(e.message)
        return res.status(400).json({ "error":e.message.replace(/fname:|User validation failed:|lname:|username:|birthday:|phoneNum:|address:|postalCode:/gi,'') });

    }
}
//login user 
exports.loginUser = (async (req, res, next) => {
    console.log(req.body);
     const password= req.body.password;
     const credentels = req.body.email;
     var user;

    if (!credentels || !password) {
        //return next(new ErrorHandler('Please enter your Username or email and Password..!', 400))
        return res.status(400).json({ error: 'Please enter your Username or email and Password' });
        
    }
    if (credentels.indexOf('@') === -1) {
         user = await User.findOne({ username:credentels }).select('+password')
        if (!user) {
            return res.status(401).json({ error: 'Invalid Username or Password' });
          //  return next(new ErrorHandler('Invalid Username or Password', 401));
        }
    }else{
         user = await User.findOne({ email:credentels }).select('+password')
        if (!user) {
         //   return next(new ErrorHandler('Invalid email or Password', 401));
         return res.status(401).json({ error: 'Invalid Username or Password' });
         
        }
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
       // return next(new ErrorHandler('Invalid Password', 401));
        return res.status(401).json({ error: 'Invalid Password' });
    }
    sendToken(user, 200, res)
})

//loged user
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

//Forget password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        //return next(new ErrorHandler('Email not found...!', 404));
        return res.status(404).json({ error: 'email not found' });
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;
    const message =
        `You asked us to reset your forgotten password.
     To complete the process, please click on the link below or paste 
     it into your browser:\n\n${resetUrl}\n\n`
    try {
        await sendEmail({
            email: user.email,
            subject: 'MalaBus password ',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ error: error.message });
        //return next(new ErrorHandler(error.message, 500));
    }
})

//Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }
    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res)

})
//find user by id
exports.getUserProfil= async(req,res)=>{
    try {
    const user = await User.findById(req.params.id)
    res.status(200).json(user)
} 
catch (err) {
    res.status(500).json(err)
  }
}

// Update user profile 
exports.updateProfile = catchAsyncErrors(async (req, res) => {
    try{
    const newUser = {
        fname: req.body.fname,
        lname: req.body.lname,
       // username : req.body.username,
        birthday:req.body.birthday,
        phoneNum:req.body.phoneNum,
        job:req.body.job,
        civility:req.body.civility,
        address:req.body.address,
       // postalCode:req.body.postalCode,
      //  city:req.body.city,
       // country: req.body.country,
        email: req.body.email,
    }
    const user = await User.findByIdAndUpdate(req.params.id, newUser, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    })
}
    catch(e){
        console.log(e.message)
        return res.status(400).json({ "error":e.message.replace(/fname:|User validation failed:|lname:|username:|birthday:|phoneNum:|address:|postalCode:/gi,'') });
    }
    
})

exports.sendsms = catchAsyncErrors(async (req, res) => {
    var smsCode
    phone=req.body.phoneNum
try{
    smsCode= Math.floor(Math.random() * (99999 - 10000 )) + 10000+""
    client.messages
  .create({
     body:  `This is the verification code from Malabus ${smsCode} `,
     from: '+13072842343',
     to: '+216'+phone
   })
  .then(message => console.log(message.sid));
    
    res.status(200).json({
        code: smsCode
    })
}catch(e){
    console.log(e)
    res.status(400).json({
        success: "error"
    })
}
})

exports.verifyUser = catchAsyncErrors(async (req, res) => {
    var id_user ="#";
    var userExist;
try{

    const { fname, lname, username,
        birthday, phoneNum, email,
        password, job, civility,
        address, postalCode, city,
        country,status } = req.body;
        userExist = await User.findOne({ email:req.body.email })
        if (userExist) {
            return res.status(401).json({ error: 'user already exist' });
        }
        id_user = id_user + genUsername.generateFromEmail(email,3) 
        const user = await User.create({
            fname, lname, username,
            birthday, phoneNum, email,
            password, job, civility,
            address, postalCode, city,
            country,id_user,status
        }) 
        await user.deleteOne();
    res.status(200).json({
        verified: true
    })
}catch(e){
    
     return res.status(400).json({ "error":e.message.replace(/fname:|User validation failed:|lname:|username:|birthday:|phoneNum:|address:|postalCode:/gi,'') });
        
   
}
})

exports.forgotPasswordMobile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ error: 'email not found' });
    }
    const newPassword  = generator.generate({
        length: 10,
        numbers: true,
        symbols:true,
        lowercase:true,
        uppercase:true,
        exclude:" "
    });

    hachedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUser = await User.findOneAndUpdate({ email: req.body.email }, {
        $set: {
            password:hachedPassword
        }
    })
    const message =
        `this is a new password please use it to sign in and then change it :\n\n${newPassword}\n\n`
    try {
        await sendEmail({
            email: user.email,
            subject: 'MalaBus password ',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})







