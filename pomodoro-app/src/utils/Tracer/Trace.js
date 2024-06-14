import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import config from '../../config';

// Create and configure the tracer provider
const provider = new WebTracerProvider();

// Configure the OTLP exporter
const collectorOptions = {
  serviceName: 'frontend-traces',
  url: `${config.jaeger_trace_url}/api/traces`, // Adjust this URL to point to your Jaeger or OpenTelemetry Collector OTLP endpoint
};

const exporter = new OTLPTraceExporter(collectorOptions);

// Add the exporter to the provider
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Register the provider
provider.register();

// Register instrumentations
registerInstrumentations({
  instrumentations: [getWebAutoInstrumentations()],
});

// Optionally disable some instrumentations
// '@opentelemetry/instrumentation-fetch': { enabled: false },
    
// Export the tracer for use in your application
export const tracer = provider.getTracer('frontend-traces');