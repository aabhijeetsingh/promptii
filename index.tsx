import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import ProSuccessPage from './components/ProSuccessPage';
import SharePage from './components/SharePage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const path = window.location.pathname;

const AppWrapper = () => {
    const theme = localStorage.getItem('theme');
    const applyTheme = () => {
        if (theme === '"dark"' || !theme) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // This component decides which page to render.
    if (path.startsWith('/pro-success')) {
        applyTheme();
        return <ProSuccessPage />;
    }

    if (path.startsWith('/share/')) {
        const promptId = path.split('/')[2];
        if (promptId) {
            applyTheme();
            return <SharePage promptId={promptId} />;
        }
    }

    // Default to the main app, wrapped in Auth0Provider
    return (
        <Auth0Provider
            domain="dev-p2agkrhb142p0qfr.us.auth0.com"
            clientId="kNENJ7sgIT78dtb2qBlnDMUPHnCc1UQ0"
            authorizationParams={{
                audience: "https://dev-p2agkrhb142p0qfr.us.auth0.com/api/v2/",
                redirect_uri: window.location.origin
            }}
        >
            <App />
        </Auth0Provider>
    );
};


root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);