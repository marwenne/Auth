const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const crypto = require('crypto')
const agencySchema = new mongoose.Schema({

    nameagency : {
        type: String,
        unique : true,
        required : [true, "Your name agency is required"],
        minlength:[2, "Your agency name must be at least 2 characters "],
        maxlength : [15 , "Your agency name cannot  15 characters"],
        validate: [validator.isAlpha, 'Name must be alphabetic']
    },
    matricule: {
        type: String,
        unique: true,
        required: [true, 'Matricule is required!'],
        validate: {
          validator(matricule) {
            const matriculeRegex = /^[0-9]{7}[A-Z]$/;
            return matriculeRegex.test(matricule);
          },
          message: '{VALUE} is not a valid matricule!',
        },
  
      },
    email: {
        type: String,
        required: [true, 'Your mail is required'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    password: {
     type : String,
     select:false
    },
    num_cnss : {
        type : String,
        unique : true,
        required : [true, "Your cnss number is required"],
        maxlength : [7 , "Your cnss number must contain 7 characters"],
        minlength:[7, "Your cnss number must contain 7 characters "],
        validate: [validator.isNumeric, 'Your number cnss  must be number'],
    },
    business_sector : {
        type : String ,
        required : [true , "Your business sector is required"],
        enum : {
            values : [
                "Transport terrestre routier international",
                "Transport terrestre routier de marchandises",
                "Transport collectif de personnes",
                "Transport ferroviaire"
            ]
        }
    },
    legal_status : {
        type : String ,
        required : [true , "Your legal status is required"],
        enum : {
            values : [
                "SARL",
                "SURL",
                "SAS",
                "SA",
                "Autre..."
            ]
        }
    },
    verified: {
        type: Boolean,
        default: false,
      },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

//compare matricule
agencySchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// JWT token
agencySchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    })
}
//Rest password
agencySchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.resetPasswordExpire = Date.now() + 30 * 60 * 9000000
    return resetToken
 }
    

//Rest password
agencySchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.resetPasswordExpire = Date.now() + 30 * 60 * 9000000
    return resetToken
    }

module.exports = mongoose.model('Agency', agencySchema);