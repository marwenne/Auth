require('dotenv').config({ path: './config/.env' });
require('./config/db');
const app = require('./app');


//create server
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})