import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/Imasha/AuthContext';
import Preloader from './components/Tharuka/Common/Preloader';
import PageTransitionWave from './components/Tharuka/Common/PageTransitionWave';
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
const OnboardingPage = lazy(() => import('./pages/Imasha/OnboardingPage'));
const AdminDashboard = lazy(() => import('./pages/Imasha/Admin/AdminDashboard'));

// Pages — Priya
import ExercisePage from './pages/Priya/Exercise';
import FindSpecialistPage from './pages/Priya/FindSpecialist';

import ProtectedRoute from './components/Imasha/ProtectedRoute';

const AppWrapper = () => (
  <ThemeProvider>
    <FontSizeProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#0a140f', color: '#fff', border: '1px solid rgba(0, 200, 151, 0.2)' } }} />
      <BrowserRouter>
        <ScrollAura />
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </FontSizeProvider>
  </ThemeProvider>
);

function App() {
  const { user, token, loading } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return null;

  return (
    <>
      <PageTransitionWave />
      
      <AnimatePresence mode="wait">
        {initialLoading && <Preloader key="preloader" />}
      </AnimatePresence>

      <Suspense fallback={null}>
        <Routes>
          {token && user && user.role === 'patient' && !user.hasCompletedOnboarding ? (
            <>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              
              {/* Optional Onboarding Route */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

              {/* Protected Priya Routes */}
              <Route path="/exercise" element={<ProtectedRoute><ExercisePage /></ProtectedRoute>} />
              <Route path="/find-specialist" element={<ProtectedRoute><FindSpecialistPage /></ProtectedRoute>} />

              {/* Protected Nutrition Routes */}
              <Route path="/health-data" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
              <Route path="/meal-plan" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
            </>
          )}
        </Routes>
      </Suspense >
    </>
  );
}

export default AppWrapper;
