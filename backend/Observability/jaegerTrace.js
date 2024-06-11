const config = require('../config');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');

//
// Configure logger to capture OpenTelemetry logs
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// create jaeger exporter
const exporter = new JaegerExporter({
    serviceName: 'my-pomodoro-app',
    endpoint: `${config.observability.jaeger_trace_url}/api/traces`
})

const provider = new NodeTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'test-pomo-app'
    }),
})

// add jaeger-exporter to spna processor
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
// register
provider.register();

//
const tracer = provider.getTracer('test-pomodoro-app');

module.exports = { tracer };
