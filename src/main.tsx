/**
 * index.tsx — React application entry point
 *
 * Mounts the root <App /> component into the #root div defined in public/index.html.
 * React.StrictMode runs extra checks in development (double-invoking effects,
 * detecting deprecated APIs) without affecting the production build.
 */

import React    from 'react';
import ReactDOM from 'react-dom/client';
import App      from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
