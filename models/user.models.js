const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const verifier = require('email-verify');
const userSchema = new mongoose.Schema({
    fname: {
        type: String,
      required: [true, 'First name is required'],
      maxLength: [10, 'Your first name cannot exceed 10 characters'],
      validate: [validator.isAlpha, 'Name must be alphabetic']
    },
    lname: {
        type: String,
        required: [true, 'Last name is required'],
        maxLength: [10, 'Your last name must be at least 6 characters'],
        validate: [validator.isAlpha, 'Last name must be alphabetic']
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'User name is required'],
        minlength:[6, 'Your User name must contain at least 6 caracters'],
        maxLength: [10, 'Your user name cannot exceed 10 characters'],
        validate: [validator.isAlpha, 'username must be alphabetic']
    },

    id_user:{
        type: String,
        unique: true
    },

    birthday: {
        type: Date,
        required: [true, 'Your birthday is required'],
    },
    phoneNum: {
        type: String,
        unique:[true, 'Your phone number already exist'],
        required: [true, 'Your phone number is required'],
        validate: [validator.isMobilePhone, 'Please enter valid phone number']
    },
    email: {
        type: String,
        required: [true, 'Your mail is required'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address'],
        verify :[verifier.email,'email invalide']
    },
    password: {
        type: String,
        required: [true, 'Your password is required'],
        select: false,
    },
    status: {
        type: String,
    },
    job: {
        type: String,
        required: [true, 'Your job is required'],
        enum: {
            values: [
                "étudinat",
                "Employé",
                "Chômeur",
                "Retraité",
            ]
        }
    },
    civility: {
        type: String,
        enum: {
            values: [
                "Mlle",
                "Madame",
                "Monsieur",
            ]
        }
    },
    address: {
        type: String,
        required: [true, "Your address is required"]
    },
    postalCode: {
        type: String,
        required: [true, "Your postal code is required "],
        validate: [validator.isNumeric, 'Postal code must be number'],
    },

    city: {
        type: String,
        required: [true, "Your city is required"],
        enum: {
            values: [
                "Ariana",
                "Beja",
                "Ben Arous",
                "Bizerte",
                "Gabés",
                "Gafsa",
                "Jendouba",
                "Kairouan",
                "Kasserine",
                "Kébili",
                "Kéf",
                "Mehdia",
                "Manouba",
                "Médenine",
                "Monastir",
                "Nabeul",
                "Sfax",
                "Sidi bouzid",
                "Siliana",
                "Sousse",
                "Tataouine",
                "Tozeur",
                "Tunis",
                "Zaghouane",
            ]
        }
    },
    country: {
        type: String,
        required: [true, "Your country is required"],
        enum: {
            values: [
                "Tunisie"
            ]
        }
    },

    
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})
//Hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})
// Compare password
userSchema.methods.comparePassword = async function (Password) {
    return await bcrypt.compare(Password, this.password)
}
// JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    })
}
//Reset password
userSchema.methods.getResetPasswordToken = function () {
const resetToken = crypto.randomBytes(20).toString('hex');
this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
this.resetPasswordExpire = Date.now() + 30 * 60 * 9000000
return resetToken
}

module.exports = mongoose.model('User', userSchema);