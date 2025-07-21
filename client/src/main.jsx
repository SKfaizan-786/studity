import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax'; // ✅ Import this
import App from './App.jsx';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ParallaxProvider> {/* ✅ Wrap your app in this */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ParallaxProvider>
    </React.StrictMode>
  );
} else {
  console.error("No root element found in index.html");
}
