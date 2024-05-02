const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const config = require('./config');
const passport = require('passport');
const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const PORT = config.server.port;
require('./middlewares/passport');

const app = express();

// connect to database
const mongoUrl = config.database.mongoUrl; 
const db = mongoose.connect(mongoUrl);

// middlewares
app.use(express.json());
app.use(cors({
    method: 'GET, POST, PUT, PATCH, DELETE',
    headers: "x-access-token, Content-Type, Accept, Access-Control-Allow-Credentials",
    credentials: true
}))
// session middleware
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.use('/auth', authRoutes);
app.use('/user', userRoutes);



if(db) {
    app.listen(PORT, (err, client) => {
        if(err) {
            console.log(err)
        }
        console.log('Server is running on port: ', PORT)
        console.log('Database is running')
    })
}