import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import './LegalPage.css';

const PRIVACY_SECTIONS = [
  {
    title: '1. Information We Collect',
    content: 'We collect information you provide directly to us, including: account information (name, email, password), health data you enter (meals, workouts, body metrics, health goals), usage data (features accessed, time spent, interactions), device information (browser type, OS, IP address), and communications (support messages, feedback). We only collect what is necessary to provide our services.',
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use the information we collect to: provide, maintain, and improve PulseNova services; personalize your health recommendations and dashboard; process transactions and send related notices; respond to your comments and support requests; send health tips, reminders, and product updates (with your consent); monitor and analyze usage patterns to enhance security; and comply with legal obligations.',
  },
  {
    title: '3. Health Data Special Protections',
    content: 'Your health data receives the highest level of protection. We treat all health information as sensitive personal data under applicable law. Health data is stored with AES-256 encryption. It is never used for advertising purposes, never sold to insurance companies, employers, or data brokers, and de-identified before any statistical analysis. You can delete your health data at any time from Account Settings.',
  },
  {
    title: '4. Data Sharing',
    content: 'We do not sell your personal data. We may share your data with: service providers who help us operate PulseNova (hosting, analytics, email — all bound by strict data processing agreements); health specialists you choose to consult with through our platform (only information you explicitly authorize); legal authorities when required by law or to protect rights and safety.',
  },
  {
    title: '5. Data Retention',
    content: 'We retain your personal data for as long as your account is active or as needed to provide services. After account deletion, we retain anonymized aggregate data indefinitely for research purposes. You may request complete data deletion at any time through Account Settings or by contacting privacy@pulsanova.com. We will process deletion requests within 30 days.',
  },
  {
    title: '6. Your Rights',
    content: 'You have the right to: access your personal data and receive a copy; correct inaccurate data; delete your data ("right to be forgotten"); restrict or object to processing; data portability (receive data in machine-readable format); withdraw consent at any time; lodge a complaint with your local data protection authority. To exercise these rights, contact us at privacy@pulsanova.com.',
  },
  {
    title: '7. Cookies and Tracking',
    content: 'We use essential cookies necessary for the app to function (authentication tokens, language/theme preferences). We use analytics cookies to understand usage patterns — these can be disabled in your account settings. We do not use advertising cookies or share cookie data with ad networks. You can manage cookie preferences through your browser settings at any time.',
  },
  {
    title: '8. Security',
    content: 'We implement industry-leading security measures: TLS 1.3 encryption for all data in transit; AES-256 encryption for all data at rest; regular penetration testing and security audits; strict access controls — only authorized engineers can access production data with full audit logging; and automatic session expiry with re-authentication for sensitive operations.',
  },
  {
    title: '9. Children\'s Privacy',
    content: 'PulseNova is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at privacy@pulsanova.com and we will delete that data promptly.',
  },
  {
    title: '10. Contact Us',
    content: 'For privacy concerns, data requests, or questions about this policy, please contact our Privacy Team: Email: privacy@pulsanova.com | Address: PulseNova Ltd, Data Protection Officer, No. 1 Health Street, Colombo 03, Sri Lanka. We respond to all privacy inquiries within 72 hours.',
  },
];

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  return (
    <>
      <BackgroundEffect />
      <Header />
      <main className="page-wrapper pn-legal-page section-pad">
        <div className="container pn-legal-page__inner">
          <motion.div className="pn-legal-page__content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="section-label">Legal</span>
            <h1 className="pn-legal-page__title">{t('privacy_title')}</h1>
            <p className="pn-legal-page__updated">{t('privacy_updated')}</p>
            <p className="pn-legal-page__intro">
              Your privacy matters. This policy explains what data PulseNova collects, how it's used, and your rights. We are committed to keeping your health data safe, private, and always under your control.
            </p>
            <div className="pn-legal-page__sections">
              {PRIVACY_SECTIONS.map((section, i) => (
                <motion.div key={i} className="pn-legal-page__section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <aside className="pn-legal-page__sidebar">
            <div className="pn-legal-page__nav glass">
              <h5>Contents</h5>
              {PRIVACY_SECTIONS.map((s, i) => (
                <button key={i} className="pn-legal-page__nav-link">{s.title.split('.')[0] + '. ' + s.title.split('.')[1].trim()}</button>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
