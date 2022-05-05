const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors())
app.use(bodyParser.json());
const userRoutes = require('./routes/user.routes');
const agencyRoutes = require('./routes/agency.routes');
const adminRoutes = require('./routes/admin.routes');


//routes users
app.use('/user', userRoutes);

//routes agency
app.use('/agency', agencyRoutes);

//routes admin
app.use('/admin', adminRoutes);



module.exports = app;