import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import './FaqPage.css';

const FAQS = [
  { q: 'What is PulseNova?', a: 'PulseNova is an intelligent health tracking platform that helps you monitor nutrition, exercise, sleep, and overall wellness — all in one beautifully designed app accessible in English, Sinhala, and Tamil.' },
  { q: 'Is PulseNova free to use?', a: 'Yes! PulseNova offers a comprehensive free plan with core health tracking features. Premium upgrades are available for advanced analytics, unlimited meal history, and priority specialist access.' },
  { q: 'How does nutrition tracking work?', a: 'Our AI-powered nutrition engine lets you log meals by searching our database of 500,000+ foods, scanning barcodes, or describing your meal. It automatically calculates macros, calories, vitamins, and more.' },
  { q: 'Can I connect with a health specialist?', a: 'Absolutely. The "Find Specialist" feature lets you search certified doctors, dietitians, and fitness coaches. You can view profiles, read reviews, and book consultations directly through your dashboard.' },
  { q: 'How does the Caregiver feature work?', a: 'Caregivers can be linked to patient accounts via the Dashboard. Once connected, caregivers can monitor health metrics in real-time, schedule appointments, track medications, and communicate securely through the platform.' },
  { q: 'Is my health data private and secure?', a: 'Absolutely. We use AES-256 encryption for all stored data and TLS 1.3 for data in transit. We are fully GDPR-compliant and never sell your personal health data to third parties.' },
  { q: 'Does the app work in Sinhala and Tamil?', a: 'Yes! PulseNova fully supports English, Sinhala (සිංහල), and Tamil (தமிழ்). You can switch languages at any time using the language selector in the header — it takes effect instantly across the entire app.' },
  { q: 'Can I change the text size for easier reading?', a: 'Yes, we designed PulseNova with accessibility in mind. Use the A- / A / A+ buttons in the top navigation bar to adjust the font size to small, medium, or large at any time.' },
  { q: 'Which devices does PulseNova support?', a: 'PulseNova is a fully responsive web application that works seamlessly on desktop, tablet, and mobile devices. A native mobile app is on our roadmap for 2025.' },
  { q: 'How do I reset my password?', a: 'Click "Login" in the header, then "Forgot Password?". Enter your registered email and you\'ll receive a secure password reset link within 2 minutes. Check your spam folder if you don\'t see it.' },
];

function FaqItem({ question, answer, isOpen, toggle }) {
  return (
    <div className={`pn-faq__item ${isOpen ? 'open' : ''}`}>
      <button className="pn-faq__question" onClick={toggle}>
        <span>{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="pn-faq__answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <>
      <BackgroundEffect />
      <Header />
      <main className="page-wrapper pn-faq-page section-pad">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Support</span>
            <h1 className="section-title">{t('faq_title')}</h1>
            <p className="section-subtitle">{t('faq_subtitle')}</p>
          </div>
          <div className="pn-faq__list">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openIndex === i}
                toggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
