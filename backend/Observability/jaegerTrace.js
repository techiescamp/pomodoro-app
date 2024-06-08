const config = require('../config');
// const { ConsoleLogger } = require('@opentelemetry/core');
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
// const { SEMRESATTRS_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
// const { NodeSDK } = require('@opentelemetry/sdk-node');
// const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
//
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

// const provider = new BasicTracerProvider({
//     resource: new Resource({
//         [SEMRESATTRS_SERVICE_NAME]: 'my-pomodoro-app'
//     }),
// })

const provider = new NodeTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'my-pomodoro-app'
    }),
})

// add jaeger-exporter to spna processor
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
// register
provider.register();

//
const tracer = provider.getTracer('my-pomodoro-app');
const span = tracer.startSpan('test-oper-name');
span.addEvent('your log message');
span.addEvent('Another log message');

span.end();

module.exports = { tracer };

// const sdk = new NodeSDK({
//     traceExporter: exporter,
//     instrumentations: [getNodeAutoInstrumentations()]
// })

// sdk.start();