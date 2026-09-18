import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './styles/global.css';
import 'katex/dist/katex.min.css';
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

Sentry.init({
  dsn: "https://3c07639ac9f315742ad89e80e3d4915e@o4512101797527552.ingest.de.sentry.io/4512101845499984",
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, 
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SupabaseAuthProvider>
        <App />
      </SupabaseAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
