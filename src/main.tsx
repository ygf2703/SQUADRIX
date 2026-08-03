import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './styles.css';
import './branding.css';
import { App } from './routes/App';
const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;
createRoot(document.getElementById('root')!).render(<StrictMode><Router basename="/app"><App /></Router></StrictMode>);
