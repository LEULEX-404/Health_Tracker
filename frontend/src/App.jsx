import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Tharuka/Common/Preloader';
import { ThemeProvider } from './context/Tharuka/ThemeContext';
import { FontSizeProvider } from './context/Tharuka/FontSizeContext';
import './utils/Tharuka/i18n';
import './styles/Tharuka/variables.css';
import './styles/Tharuka/global.css';
import ScrollAura from './components/Tharuka/Common/ScrollAura';

// Pages — Tharuka (Lazy Loaded for Performance)
const HomePage = lazy(() => import('./pages/Tharuka/HomePage'));
const AboutPage = lazy(() => import('./pages/Tharuka/AboutPage'));
const TermsPage = lazy(() => import('./pages/Tharuka/TermsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/Tharuka/PrivacyPolicyPage'));
const ContactPage = lazy(() => import('./pages/Tharuka/ContactPage'));
const FaqPage = lazy(() => import('./pages/Tharuka/FaqPage'));
const ServicesPage = lazy(() => import('./pages/Tharuka/ServicesPage'));

// Pages — Imasha (Auth) (Lazy Loaded)
const LoginPage = lazy(() => import('./pages/Imasha/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Imasha/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/Imasha/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/Imasha/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/Imasha/VerifyEmailPage'));
import { AuthProvider } from './context/Imasha/AuthContext';

function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Ensure the premium heartbeat animation has time to confidently draw and exit
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <FontSizeProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#0a140f', color: '#fff', border: '1px solid rgba(0, 200, 151, 0.2)' } }} />
        <BrowserRouter>
          <ScrollAura />
          {/* AuthProvider must be inside BrowserRouter (uses useNavigate) */}
          <AuthProvider>
            <AnimatePresence mode="wait">
              {initialLoading && <Preloader key="preloader" />}
            </AnimatePresence>

            {/* Suspense handles background loading of lazy routes after the initial preloader finishes */}
            <Suspense fallback={null}>
              <Routes>
                {/* Tharuka — Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />

                {/* Imasha — Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </FontSizeProvider>
    </ThemeProvider>
  );
}

export default App;
