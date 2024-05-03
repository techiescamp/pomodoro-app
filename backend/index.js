const express = require('express');
const mongoose = require('mongoose');
const cors  =require('cors');
const session = require('express-session');
const passport = require('passport');
const config = require('./config');
const route = require('./Routes/route');
const PORT = config.server.port;
require('./middlewares/passport');


const app = express();

// connect to database
const mongoUrl = config.database.mongoUrl;
const db = mongoose.connect(mongoUrl);

// middlewares
app.use(express.json());
app.use(cors({
    origin: config.urls.baseUrl,
    method: 'GET, POST, PUT, PATCH, DELETE',
    headers: "x-access-token, Content-Type, Accept, Access-Control-Allow-Credentials",
    credentials: true
}));


// session middleware
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// handlers or routes
app.use('/', route)


if(db) {
    app.listen(PORT, (err, client) => {
        if(err) {
            console.error('Server is not connected', err)
            // logger.error('Server is not connected', err)
        }
        // logger.info('server and database are connected')
        console.log('server connected at PORT: ', PORT)
        console.log('MongoDB database is connected.')        
    })
}

