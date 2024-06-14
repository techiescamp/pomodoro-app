const config = require('../config');
const { BasicTracerProvider, ConsoleSpanExporter, BatchSpanProcessor, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
//
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb')
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { OTTracePropagator } = require('@opentelemetry/propagator-ot-trace');

//
// Configure logger to capture OpenTelemetry logs
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// create jaeger exporter
const exporter = new JaegerExporter({
    tags: [],
    serviceName: 'backend-traces',
    endpoint: `${config.observability.jaeger_trace_url}/api/traces`
})

const provider = new NodeTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'backend-traces'
    }),
})

// add jaeger-exporter to spna processor
// provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

// register
provider.register({propagator: new OTTracePropagator()});
// register instrumentation
registerInstrumentations({
    instrumentations: [
        new ExpressInstrumentation(), 
        new HttpInstrumentation(),
        new MongoDBInstrumentation({
            enhancedDatabaseReporting: true,
            serviceName: 'mongodb_database'
        })
    ],
});

//
const tracer = provider.getTracer('backend-traces');

module.exports = { tracer };
