const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// health check variable
let isDatabaseReady = false;
let isServerReady = false;
let isFrontendLoaded;

const app = express();

// connect to database
const mongoUrl = config.database.mongoUrl;
const db = mongoose.connect(mongoUrl);

// cors middlewares
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'X-Access-Token', 'X-Correlation-ID', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
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
        time / 1000 // convert to seconds
      );
    }
  })
);

// handlers or routes
app.use('/', route)

app.post('/health', async (req, res) => {
  isFrontendLoaded = req.body.loadtime;
});

// health checks
app.get('/health', async (req, res) => {
  try {
    // const mongo = await mongoose.connection.db.admin().ping(); // { ok: 1 }
    const mongo = isDatabaseReady;
    const isMetricsReady = await checkMetricsReady();

    if(mongo && isMetricsReady && isServerReady && isFrontendLoaded) {
      res.status(200).json({
        status: 'HEALTHY',
        statusCode: 200,
        Message: "All mongodb server, metrics server and frontend application are UP and running"
      })
    } else if(mongo && isMetricsReady && isServerReady && !isFrontendLoaded) {
      res.status(400).json({
        status: 'UNHEALTHY FRONTEND',
        statusCode: 400,
        Message: "All servers are UP and running but Frontend Application is DOWN"
      })
    } else if(mongo && isMetricsReady && isServerReady) {
      res.status(400).json({
        status: 'HEALTHY BACKEND',
        statusCode: 400,
        Message: "All servers are UP and running"
      })
    } else {
      res.status(500).json({
        status: 'UNHEALTHY',
        statusbar: 500,
        error: "Monogodb server and metrics are not DOWN and either or both of them are not running. Please check your codes."
      })
    }
  }
  catch(err) {
    res.status(500).json({
      status: 'UNHEALTHY',
      error: err.message
    })
  }
})
async function checkMetricsReady() {
  try{
    const response = await fetch('http://localhost:7100/metrics/ready');
    const data = await response.json();
    return data.status === 'OK';
  }
  catch(err) {
    console.error('Error checking metrics server health: ', err);
    return false;
  }
}

app.get('/live', (req, res) => {
  if(isServerReady && isDatabaseReady) {
    res.json(200).json({
      status: 'UP',
      statusCode: 200,
      message: 'Server and MongoDb is UP'
    })
  } else {
    res.status(500).json({
      status: 'DOWN',
      statusCode: 500,
      message: "Backend server and Database is DOWN"
    })
  }
});

app.get('/ready', async (req, res) => {
  const isMetricsReady = await checkMetricsReady();
  if(isMetricsReady && isServerReady) {
    res.status(200).json({
      status: 'UP and LIVE',
      statusCode: 200,
      message: "Metrics server and Backend server is ready and running"
    })
  } else if(isMetricsReady && !isServerReady) {
    res.status(500).json({
      status: 'DOWN and NOT LIVE',
      statusCode: 500,
      message: "Metrics server is LIVE and Backend server is NOT LIVE"
    })
  } else if(!isMetricsReady && isServerReady) {
    res.status(500).json({
      status: 'DOWN and NOT LIVE',
      statusCode: 500,
      message: "Metrics server is NOT LIVE and Backend server is LIVE"
    })
  } else {
    res.status(500).json({
      status: 'DOWN and NOT LIVE',
      statusCode: 500,
      message: "Both Metrics server and Backend server is NOT LIVE"
    })
  }
});



app.listen(PORT, (err, client) => {
  startMetricsServer();
  if (err) {
    logger.error('Server is not connected', err)
  }
  isServerReady = true;
  logger.info('server connected at PORT: ', PORT)
  if (db) {
    isDatabaseReady = true;
    logger.info('MongoDB database is connected.')
  }
})

module.exports = app;
