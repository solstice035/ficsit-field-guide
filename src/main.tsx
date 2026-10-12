import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter/wght.css';
import { App } from './App.tsx';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
