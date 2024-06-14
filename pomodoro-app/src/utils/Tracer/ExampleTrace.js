import { WebTracerProvider } from '@opentelemetry/web';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

// Create and configure the tracer provider
const provider = new WebTracerProvider();

// Configure the Jaeger exporter
const exporter = new JaegerExporter({
  serviceName: 'frontend-app',
  endpoint: 'http://18.246.240.71:30231/api/traces', // Replace with your Jaeger endpoint
});

// Add the exporter to the provider
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Optionally, add a console exporter for debugging purposes
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

// Register the provider
provider.register();

// Register instrumentations (e.g., for HTTP requests)
registerInstrumentations({
  instrumentations: [getWebAutoInstrumentations()],
});

// Export the tracer for use in your application
export const tracer = provider.getTracer('frontend-app');

