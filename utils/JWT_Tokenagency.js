// Create and send token and save in the cookie.
const sendToken = (agency, statusCode, res) => {
    // Create Jwt token
    const token = agency.getJwtToken();
    // Options for cookie
    const options= {
        expires: new Date(
            Date.now() 
        ),
        httpOnly: true
    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        agency
    })
}

module.exports = sendToken;



