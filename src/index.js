import React from 'react';
import ReactDom from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { GlobalStorage } from './GlobalContext';

const root = ReactDom.createRoot(document.getElementById('root'));
root.render(
  <GlobalStorage>
    <App />
  </GlobalStorage>
);
