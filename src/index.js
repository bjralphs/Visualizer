import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// T12: React 18 — use createRoot instead of the deprecated ReactDOM.render.
const root = createRoot(document.getElementById('root'));
root.render(<App />);
