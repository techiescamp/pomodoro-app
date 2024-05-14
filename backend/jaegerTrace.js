const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes, SEMRESATTRS_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

// create jaeger exporter
const exporter = new JaegerExporter({
    serviceName: 'my-pomodoro-app',
    endpoint: 'http://34.71.163.101:32629/api/traces'
})

const provider = new BasicTracerProvider({
    resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: 'my-pomodoro-app'
    }),
})

// add jaeger-exporter to spna processor
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
// register
provider.register();


const sdk = new NodeSDK({
    traceExporter: exporter,
    instrumentations: [getNodeAutoInstrumentations()]
})

sdk.start();