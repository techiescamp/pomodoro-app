const client = require('prom-client');
const express = require('express');

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
  
    app.listen(7100, () => {
      console.log("Metrics server started at http://localhost:7100");
    });
  }


module.exports = { 
    startMetricsServer: startMetricsServer,
    counter: counter,
    responseTimeHistogram: responseTimeHistogram,
    databaseResponseTimeHistogram: databaseResponseTimeHistogram,
}