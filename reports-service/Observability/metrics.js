const client = require('prom-client');
// Create a new registry for the metrics
let register = new client.Registry();


// application performance metrics
// ---------------------------------
const httpRequestCounter = new client.Counter({
    name: 'pomodoro_http_requests_total',
    help: 'Number of HTTP requests',
    labelNames: ['method', 'route', 'statusCode'],
    registers: [register]
});

const httpRequestDurationHistogram = new client.Histogram({
    name: 'pomodoro_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5, 10], // Adjust buckets as needed
    registers: [register]
});

const databaseQueryDurationHistogram = new client.Histogram({
    name: 'pomodoro_database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'success'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2], // Adjust buckets as needed
    registers: [register]
});

const errorCounter = new client.Counter({
    name: 'app_errors_total',
    help: 'Total number of application errors',
    registers: [register],
});


module.exports = {
    register,
    httpRequestCounter,
    httpRequestDurationHistogram,
    databaseQueryDurationHistogram,
    errorCounter,
}