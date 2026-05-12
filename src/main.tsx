import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AuthProvider } from './features/auth/auth-context';
import './styles.css';

if (!window.location.hash && window.location.pathname !== '/') {
  window.location.replace('/#' + window.location.pathname + window.location.search);
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AppRoot() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppRoot />
      </GoogleOAuthProvider>
    ) : (
      <AppRoot />
    )}
  </React.StrictMode>
);
