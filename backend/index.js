const express = require('express');
const mongoose = require('mongoose');
const cors  =require('cors');
const session = require('express-session');
const passport = require('passport');
const config = require('./config');
const route = require('./Routes/route');
const metricsRoute = require('./Routes/metricsRoute');
const PORT = config.server.port;
require('./middlewares/passport');

// observability
const client = require('prom-client');
const responseTime = require('response-time');
const { startMetrics, counter, responseTimeHistogram } = require('./Observability/metrics');


// logger
const uuid = require('uuid');
const logger = require('./Logger/logger');

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

// logg middleware
app.use((req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || Math.ceil(Math.random() * 2000);
    console.log('corr - ', correlationId);
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

//
startMetrics();

// telemetry response-time middleware
app.use(responseTime((req, res, time) => {
    if(req?.route?.path) {
        responseTimeHistogram.observe({
            method: req.method,
            route: req.route.path,
            status_code: res.statusCode
        }, time*1000)
    }
}));

// telemtry counter middleware
app.use((req, res, next) => {
    if(req?.route?.path) {
        counter
            .labels({
                method: req.method,
                route: req.route,
                status_code: res.statusCode
            })
            .inc();
        next();
    }
})

// handlers or routes
app.use('/', route)
app.use('/metrics', metricsRoute)

// http://localhost:7000/metrics
// app.get("/metrics", async (req, res) => {
//     res.set("Content-Type", client.register.contentType);
//     res.send(await client.register.metrics());
// });


if(db) {
    app.listen(PORT, (err, client) => {
        if(err) {
            console.error('Server is not connected', err)
            // logger.error('Server is not connected', err)
        }
        // logger.info('server and database are connected')
        console.log('server connected at PORT: ', PORT)
        console.log('MongoDB database is connected.') 
        // startMetrics();
    })
}