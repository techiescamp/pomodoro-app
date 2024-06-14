// require('dotenv').config();

const config = {
    apiUrl: process.env.REACT_APP_API_URL,
    metrics_url: process.env.REACT_APP_METRICS_URL,
    jaeger_trace_url: process.env.REACT_APP_JAEGER_TRACE_URL
}

export default config;