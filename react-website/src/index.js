import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { EuiProvider } from '@elastic/eui';
import '@elastic/eui/dist/eui_theme_dark.css';

const container = document.getElementById("app");
const root = ReactDOM.createRoot(container);
root.render(<EuiProvider colorMode='dark'><App /></EuiProvider>);
