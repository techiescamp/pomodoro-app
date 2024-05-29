const client = require('prom-client');
const express = require('express');
const cors = require('cors');
const config = require('../config');
const logger = require('../Logger/logger');

const app = express();

let register = new client.Registry();

const counter = new client.Counter({
    name: "pomodoro_http_request_count",
    help: "The total number of processes requests",
    labelNames: ['method', 'route', 'statusCode'],
    registers: [register]
});

const responseTimeHistogram = new client.Histogram({
    name: "respose_time_duration_seconds",
    help: "REST API response time in seconds",
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
});

const databaseResponseTimeHistogram = new client.Histogram({
    name: "db_response_time_duration_seconds",
    help: "Database response time in seconds",
    labelNames: ['operation', 'success'],
    registers: [register]
});

// app-load-time
const appLoadTime = new client.Gauge({
    name: 'app_load_time_seconds',
    help: 'APP Load Time in Seconds => Time for start of the application',
    registers: [register]
});

// API response time
const responseTime = new client.Histogram({
    name: 'api_response_time',
    help: "API Response Time in seconds => The average time for the app's API to respond to requests.",
    buckets: [0.1, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5],
    registers: [register]
})

// uptime %time the app is operational
const uptimeGauge = new client.Gauge({
    name: 'app_uptime_seconds',
    help: 'Application uptime in seconds => The percentage of time the app is available and operational.',
    registers: [register],
});

// Error rate
const errorCounter = new client.Counter({
    name: 'app_errors_total',
    help: 'Total number of application errors',
    registers: [register],
});

function startMetricsServer() {
    const collectDefaultMetrics = client.collectDefaultMetrics;
    collectDefaultMetrics({ register });

    app.use(cors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Accept', 'x-access-token', 'x-correlation-id'],
        credentials: true
    }));

    app.use(express.json());

    app.use((req, res, next) => {
        const end = responseTime.startTimer();
        res.on('finish', () => {
            end();
        });
        next();
    })

    app.post("/metrics/app-load-time", (req, res) => {
        const loadTime = req.body;
        if (typeof loadTime.app_time === 'number') {
            appLoadTime.set(loadTime.app_time / 1000); // Convert milliseconds to seconds
        }
        return res.status(200).send('Load time recorded');
    });

    app.post('/metrics/log-error', (req, res) => {
        console.log(req.body);
        errorCounter.inc();
        res.status(200).send('Error logged');
    })

    app.get("/metrics", async (req, res) => {
        res.set("Content-Type", register.contentType);
        return res.end(await register.metrics());
    });

    // set uptime value periodically
    setInterval(() => {
        uptimeGauge.set(process.uptime());
    }, 1000)
  
    app.listen(7100, "localhost", () => {
    //   console.log(`Metrics server started at ${config.observability.metrics_url}`);
      logger.info(`Metrics server started at ${config.observability.metrics_url}`);
    });
}


module.exports = { 
    startMetricsServer: startMetricsServer,
    counter: counter,
    responseTimeHistogram: responseTimeHistogram,
    databaseResponseTimeHistogram: databaseResponseTimeHistogram,
}