import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 640,
        margin: '48px auto',
        padding: '0 16px',
        lineHeight: 1.6,
      }}
    >
      <h1>HostelConnect</h1>
      <p>Public web portal scaffold for the hostel management project.</p>
      <p>
        Staff and student features live in the main portal (<code>frontend/portal</code>).
      </p>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
