import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CustomerProvider } from './context/CustomerContext.jsx';
import { StaffProvider } from './context/StaffContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CustomerProvider>
        <StaffProvider>
          <App />
        </StaffProvider>
      </CustomerProvider>
    </BrowserRouter>
  </StrictMode>
);
