const mongoose = require("mongoose");


//connect data
mongoose.connect('mongodb+srv://' + process.env.DB_USER_PASS+ '@cluster3.ptgze.mongodb.net/malabus', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Failed to connect to MongooDB', err));