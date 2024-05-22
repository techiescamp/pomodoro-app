const client = require('prom-client');
const express = require('express');
const config = require('../config');
const logger = require('../Logger/logger');

const app = express();

const counter = new client.Counter({
    name: "pomodoro_http_request_count",
    help: "The total number of processes requests",
    labelNames: ['method', 'route', 'statusCode']
});

const responseTimeHistogram = new client.Histogram({
    name: "respose_time_duration_seconds",
    help: "REST API response time in seconds",
    labelNames: ['method', 'route', 'status_code']
});

const databaseResponseTimeHistogram = new client.Histogram({
    name: "db_response_time_duration_seconds",
    help: "Database response time in seconds",
    labelNames: ['operation', 'success']
});

function startMetricsServer() {
    const collectDefaultMetrics = client.collectDefaultMetrics;
    collectDefaultMetrics();
  
    app.get("/metrics", async (req, res) => {
      res.set("Content-Type", client.register.contentType);
      return res.send(await client.register.metrics());
    });
  
    app.listen(7100, "192.168.0.104", () => {
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