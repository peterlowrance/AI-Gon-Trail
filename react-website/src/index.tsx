import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { EuiProvider } from '@elastic/eui';
import '@elastic/eui/dist/eui_theme_light.css';
import { Provider } from 'react-redux';
import store from './store';

const container = document.getElementById("app");
const root = ReactDOM.createRoot(container);
root.render(<Provider store={store}>
    <EuiProvider colorMode='light'>
        <App />
    </EuiProvider>
</Provider>);
