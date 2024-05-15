const express = require('express');
const mongoose = require('mongoose');
const cors  =require('cors');
const session = require('express-session');
const passport = require('passport');
const config = require('./config');
const route = require('./Routes/route');
const PORT = config.server.port;
require('./middlewares/passport');
// observability
const { startMetricsServer, responseTimeHistogram } = require('./Observability/metrics');
// logger
const uuid = require('uuid');
const logger = require('./Logger/logger');
const responseTime = require('response-time')

const app = express();

// connect to database
const mongoUrl = config.database.mongoUrl;
const db = mongoose.connect(mongoUrl);

// cors middlewares
app.use(express.json());
app.use(cors({
    origin: config.urls.baseUrl,
    method: 'GET, POST, PUT, PATCH, DELETE',
    headers: "x-access-token, x-correlation-id, Content-Type, Accept, Access-Control-Allow-Credentials",
    credentials: true
}));

// log middleware
app.use((req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || Math.ceil(Math.random() * 2000);
    const requestId = uuid.v4();

    req.correlationId = correlationId;
    req.requestId = requestId;

    res.setHeader('x-correlation-id', correlationId);
    res.setHeader('x-req-id', requestId);

    logger.defaultMeta = {
        correlationId,
        requestId,
    }
    next();
})

// session middleware
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// response time middleware for prometheus
app.use(
    responseTime((req, res, time) => {
      if (req?.route?.path) {
        responseTimeHistogram.observe(
          {
            method: req.method,
            route: req.route.path,
            status_code: res.statusCode,
          },
          time * 1000
        );
      }
    })
  );

// handlers or routes
app.use('/', route)


app.listen(PORT, (err, client) => {
        if(err) {
            // console.error('Server is not connected', err)
            logger.error('Server is not connected', err)
        }
        // console.log('server connected at PORT: ', PORT)
        logger.info('server connected at PORT: ', PORT)
        if(db) {
            // console.log('MongoDB database is connected.') 
            logger.info('MongoDB database is connected.') 
        }
        startMetricsServer();
    })