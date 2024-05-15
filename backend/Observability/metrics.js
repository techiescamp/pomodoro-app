const client = require('prom-client');
const express = require('express');

const collectDefaultMetrics = client.collectDefaultMetrics;

const counter = new client.Counter({
    name: "pomodoro_http_request_count",
    help: "The total number of processes requests",
    labelNames: ['method', 'route', 'statusCode']
});

const responseTimeHistogram = new client.Histogram({
    name: "respose_time_duration_seconds",
    help: "REST API esponse time in seconds",
    labelNames: ['method', 'route', 'status_code']
});

const databaseResponseTimeHistogram = new client.Histogram({
    name: "db_response_time_duration_seconds",
    help: "Database response time in seconds",
    labelNames: ['operation', 'success']
});

// function startMetrics() {
//     const collectDefaultMetrics = client.collectDefaultMetrics;
//         collectDefaultMetrics();
//         // Metrics endpoint
//         app.get("/metrics", async (req, res) => {
//             res.set("Content-Type", client.register.contentType);
//             res.send(await client.register.metrics());
//         });
// }

module.exports = { 
    startMetrics: () => collectDefaultMetrics(),
    counter: counter,
    responseTimeHistogram: responseTimeHistogram,
    databaseResponseTimeHistogram: databaseResponseTimeHistogram,
}