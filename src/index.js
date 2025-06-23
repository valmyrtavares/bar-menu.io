import React from 'react';
import ReactDom from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { GlobalStorage } from './GlobalContext';
import StyleProvider from './StyleProvider';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDom.createRoot(document.getElementById('root'));
const basename = '/';
//const basename = '/bar-menu.io';

root.render(
  <BrowserRouter basename={basename}>
    <GlobalStorage>
      <StyleProvider>
        <App />
      </StyleProvider>
    </GlobalStorage>
  </BrowserRouter>
);
