import React from 'react';
import ReactDom from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { GlobalStorage } from './GlobalContext';
import StyleProvider from './StyleProvider';
import { BrowserRouter } from 'react-router-dom';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
