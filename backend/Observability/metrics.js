const client = require('prom-client');
// Create a new registry for the metrics
let register = new client.Registry();


// break mertrics
// -----------------------
const shortBreakCounter = new client.Counter({
    name: 'pomodoro_short_break_total',
    help: 'Number of short breaks taken',
    registers: [register]
});

const longBreakCounter = new client.Counter({
    name: 'pomodoro_long_break_total',
    help: 'Number of long breaks taken',
    registers: [register]
});

// user metrics
// --------------
const activeUsersGauge = new client.Gauge({
    name: 'pomodoro_active_users',
    help: 'Number of active users',
    registers: [register]
});

const newUsersCounter = new client.Counter({
    name: 'pomodoro_new_users_total',
    help: 'Number of new users',
    registers: [register]
});

// tasks metrics
// ----------------
const tasksCreatedCounter = new client.Counter({
    name: 'pomodoro_tasks_created_total',
    help: 'Number of tasks created',
    registers: [register]
});

const tasksCompletedCounter = new client.Counter({
    name: 'pomodoro_tasks_completed_total',
    help: 'Number of tasks completed',
    registers: [register]
});

const downloadReportsCounter = new client.Counter({
    name: 'pomodoro_download_reports_total',
    help: 'Number reports downloaded',
    registers: [register]
})

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

const appUptimeGauge = new client.Gauge({
    name: 'pomodoro_app_uptime_seconds',
    help: 'Application uptime in seconds',
    registers: [register]
});

const errorCounter = new client.Counter({
    name: 'app_errors_total',
    help: 'Total number of application errors',
    registers: [register],
});

const memoryUsageGauge = new client.Gauge({
    name: 'pomodoro_memory_usage_bytes',
    help: 'Memory usage in bytes',
    registers: [register]
});

const cpuUsageGauge = new client.Gauge({
    name: 'pomodoro_cpu_usage_seconds',
    help: 'CPU usage seconds',
    registers: [register]
});

// client side metrics
// ----------------------
const pageLoadTimeGauge = new client.Gauge({
    name: 'pomodoro_client_page_load_time_seconds',
    help: 'Page load time in seconds',
    registers: [register]
});

const clientErrorCounter = new client.Counter({
    name: 'pomodoro_client_errors_total',
    help: 'Number of client-side errors',
    registers: [register]
});


module.exports = {
    register,
    shortBreakCounter,
    longBreakCounter,
    activeUsersGauge,
    newUsersCounter,
    tasksCompletedCounter,
    tasksCreatedCounter,
    downloadReportsCounter,
    httpRequestCounter,
    httpRequestDurationHistogram,
    databaseQueryDurationHistogram,
    errorCounter,
    appUptimeGauge,
    memoryUsageGauge,
    cpuUsageGauge,
    pageLoadTimeGauge,
    clientErrorCounter,
}
