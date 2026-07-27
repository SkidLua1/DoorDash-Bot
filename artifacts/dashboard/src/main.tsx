import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setBaseUrl } from '@workspace/api-client-react';
import { API_BASE_URL } from './lib/api';

import './index.css';

// If VITE_API_URL is set (e.g. on Vercel), point all API calls there.
// In dev, Vite's proxy handles /api → localhost:8080 so no base URL is needed.
if (API_BASE_URL) {
  setBaseUrl(API_BASE_URL);
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
