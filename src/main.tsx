import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupFetchInterceptor } from './services/apiClient';

// Aktifkan interceptor fetch agar token dikirim ke semua endpoint API (termasuk di Incognito / Safari)
setupFetchInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
