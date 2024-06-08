import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const start = performance.now();
let loadTime = null;

const root = ReactDOM.createRoot(document.getElementById('root'));

const AppWrapper = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  useEffect(() => {
    const end = performance.now();
    loadTime = end - start;

    const checkBackendAvailability = async () => {
      try {
        const pingResponse = await fetch('http://localhost:7100/metrics/ready', {
          method: 'GET',
        });
        if (pingResponse.status === 200) {
          setIsBackendAvailable(true);
        }
      } catch (err) {
        return;
      }
    };

    checkBackendAvailability();
  }, []);

  useEffect(() => {
    if (isBackendAvailable && loadTime !== null) {
      const sendLoadTimeToBackend = async () => {
        try {
          await fetch('http://localhost:7100/metrics/app-load-time', {
            method: 'POST',
            body: JSON.stringify({ app_time: loadTime }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (err) {
          return;
        }
      };
      sendLoadTimeToBackend();
    }
  }, [isBackendAvailable, loadTime]);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

root.render(<AppWrapper />);