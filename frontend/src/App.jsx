import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/Tharuka/ThemeContext';
import { FontSizeProvider } from './context/Tharuka/FontSizeContext';
import './utils/Tharuka/i18n';
import './styles/Tharuka/variables.css';
import './styles/Tharuka/global.css';

// Pages — Tharuka
import HomePage from './pages/Tharuka/HomePage';
import AboutPage from './pages/Tharuka/AboutPage';
import TermsPage from './pages/Tharuka/TermsPage';
import PrivacyPolicyPage from './pages/Tharuka/PrivacyPolicyPage';
import ContactPage from './pages/Tharuka/ContactPage';
import FaqPage from './pages/Tharuka/FaqPage';
import ServicesPage from './pages/Tharuka/ServicesPage';

// Pages — Imasha (Auth)
import LoginPage from './pages/Imasha/LoginPage';
import RegisterPage from './pages/Imasha/RegisterPage';
import ForgotPasswordPage from './pages/Imasha/ForgotPasswordPage';
import ResetPasswordPage from './pages/Imasha/ResetPasswordPage';
import VerifyEmailPage from './pages/Imasha/VerifyEmailPage';
import { AuthProvider } from './context/Imasha/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <FontSizeProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#0a140f', color: '#fff', border: '1px solid rgba(0, 200, 151, 0.2)' } }} />
        <BrowserRouter>
          {/* AuthProvider must be inside BrowserRouter (uses useNavigate) */}
          <AuthProvider>
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
          </AuthProvider>
        </BrowserRouter>
      </FontSizeProvider>
    </ThemeProvider>
  );
}

export default App;
