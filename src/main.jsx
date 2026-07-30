// ============================================
// REACT ENTRY POINT (Vite)
// ============================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Find the root element in index.html
const root = document.getElementById('root');

// Create React root and render the App
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);