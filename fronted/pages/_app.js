// _app.js for global setup 
// frontend/pages/_app.js

import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from '../components/Layout'; // Layout hum next step mein banayenge

function MyApp({ Component, pageProps }) {
  return (
    // AuthProvider poore app ko wrap karega
    <AuthProvider>
      <Layout>
        {/* Component: The current page (e.g., /login, /dashboard) */}
        <Component {...pageProps} />
        {/* Toaster for notifications */}
        <Toaster position="top-center" reverseOrder={false} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;