import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('SideMate AI Agent: index.tsx loaded, initializing React app');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('SideMate AI Agent: Could not find root element to mount to');
  throw new Error("Could not find root element to mount to");
}

console.log('SideMate AI Agent: Root element found, creating React root');
const root = ReactDOM.createRoot(rootElement);

console.log('SideMate AI Agent: Rendering React app');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('SideMate AI Agent: React app render initiated');