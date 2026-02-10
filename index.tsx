
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 注册 PWA Service Worker 以实现离线安装
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('AeroCalc SW Registered');
    }).catch(err => {
      console.log('SW Registration failed: ', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
