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
const HealthDataPage = lazy(() => import('./pages/Tharuka/HealthDataPage'));
const ServicesPage = lazy(() => import('./pages/Tharuka/ServicesPage'));
const NutritionPage = lazy(() => import('./pages/Tharuka/NutritionPage'));

// Pages — Imasha (Auth) (Lazy Loaded)
const LoginPage = lazy(() => import('./pages/Imasha/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Imasha/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/Imasha/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/Imasha/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/Imasha/VerifyEmailPage'));
const OnboardingPage = lazy(() => import('./pages/Imasha/OnboardingPage'));
const ProfilePage = lazy(() => import('./pages/Imasha/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/Imasha/Admin/AdminDashboard'));

// Pages — Priya (Lazy Loaded)
const ExercisePage = lazy(() => import('./pages/Priya/Exercise'));
const FindSpecialistPage = lazy(() => import('./pages/Priya/FindSpecialist'));
const AppointmentPage = lazy(() => import('./pages/Priya/Appointment'));

// Pages — Tharindu (Lazy Loaded)
const CaregiverDashboard = lazy(() => import('./pages/Tharindu/careGiverDashboard'));

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
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

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
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Optional Onboarding Route */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

              {/* Protected Priya Routes */}
              <Route path="/exercise" element={<ProtectedRoute><ExercisePage /></ProtectedRoute>} />
              <Route path="/find-specialist" element={<ProtectedRoute><FindSpecialistPage /></ProtectedRoute>} />
              <Route path="/appointment" element={<ProtectedRoute><AppointmentPage /></ProtectedRoute>} />

              {/* Protected Nutrition Routes */}
              <Route path="/health-data" element={<ProtectedRoute><HealthDataPage /></ProtectedRoute>} />
              <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
              <Route path="/meal-plan" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
              {/* Protected Tharindu Routes */}
              <Route path="/caregiver-dashboard" element={<ProtectedRoute><CaregiverDashboard /></ProtectedRoute>} />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Suspense >
    </>
  );
}

export default AppWrapper;
