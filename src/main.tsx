import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SupabaseAuthProvider>
        <App />
      </SupabaseAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
