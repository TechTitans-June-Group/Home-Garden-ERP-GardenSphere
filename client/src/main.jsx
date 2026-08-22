import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CustomerProvider } from './context/CustomerContext.jsx';
import { StaffProvider } from './context/StaffContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <CustomerProvider>
          <StaffProvider>
            <App />
          </StaffProvider>
        </CustomerProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
