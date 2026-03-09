import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/Tharuka/ThemeContext';
import { FontSizeProvider } from './context/Tharuka/FontSizeContext';
import './utils/Tharuka/i18n';
import './styles/Tharuka/variables.css';
import './styles/Tharuka/global.css';

// Pages — Tharuka
import HomePage            from './pages/Tharuka/HomePage';
import AboutPage           from './pages/Tharuka/AboutPage';
import TermsPage           from './pages/Tharuka/TermsPage';
import PrivacyPolicyPage   from './pages/Tharuka/PrivacyPolicyPage';
import ContactPage         from './pages/Tharuka/ContactPage';
import FaqPage             from './pages/Tharuka/FaqPage';
import ServicesPage        from './pages/Tharuka/ServicesPage';

function App() {
  return (
    <ThemeProvider>
      <FontSizeProvider>
        <BrowserRouter>
          <Routes>
            {/* Tharuka — Public Routes */}
            <Route path="/"         element={<HomePage />} />
            <Route path="/about"    element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/terms"    element={<TermsPage />} />
            <Route path="/privacy"  element={<PrivacyPolicyPage />} />
            <Route path="/contact"  element={<ContactPage />} />
            <Route path="/faq"      element={<FaqPage />} />
          </Routes>
        </BrowserRouter>
      </FontSizeProvider>
    </ThemeProvider>
  );
}

export default App;
