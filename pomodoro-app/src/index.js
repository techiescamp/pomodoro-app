import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const start = performance.now();

const root = ReactDOM.createRoot(document.getElementById('root'));

const AppWrapper = () => {
  useEffect(() => {
    const end = performance.now();
    const loadTime = end - start;
    try {
      fetch('http://localhost:7000/health', { 
        method: 'POST',
        body: JSON.stringify({loadtime: loadTime}),
        headers: { 'Content-Type': 'application/json' }
      })
    }
    catch(err) {
      console.error(err);
    }
    sendLoadTimeToBackend(loadTime);
  }, []);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

const sendLoadTimeToBackend = (loadTime) => {
  console.log(loadTime)
  fetch('http://localhost:7100/metrics/app-load-time', {
    method: 'POST',
    body: JSON.stringify({app_time: loadTime}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

root.render(<AppWrapper/>)