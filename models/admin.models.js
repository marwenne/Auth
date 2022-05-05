const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const AdminSchema = new mongoose.Schema({

    username: {
        type: String,
        unique: true,
        required: [true, 'User name is required'],
        maxLength: [10, 'Your user name cannot exceed 10 characters']
    },

    email: {
        type: String,
        required: [true, 'Your mail is required'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
    },

    password: {
        type: String,
        required: [true, 'Your password is required'],
        minLength: [6, 'Your password must be longer than 6 characters'],
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})
//Crypt password
AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})
// Compare password
AdminSchema.methods.comparePassword = async function (Password) {
    return await bcrypt.compare(Password, this.password)
}
// JWT token
AdminSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    })
}
//Rest password
  AdminSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.resetPasswordExpire = Date.now() + 30 * 60 * 9000000
    return resetToken
    }
module.exports = mongoose.model('Admin', AdminSchema);