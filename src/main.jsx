import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { registerSW } from 'virtual:pwa-register';
import { useTranslation } from 'react-i18next';
import './utils/pwaInstall.js';
import './i18n/index.js';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/index.css';

function Root() {
    const { i18n } = useTranslation();
    return <App key={i18n.resolvedLanguage} />;
}

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <Root />
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: 'var(--toast-bg)',
                                color: 'var(--toast-fg)',
                                border: '1px solid var(--toast-border)',
                                maxWidth: '92vw',
                            },
                        }}
                    />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
);