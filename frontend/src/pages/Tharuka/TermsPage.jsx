import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import './LegalPage.css';

const TERMS = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using PulseNova, you accept and agree to be bound by the terms and conditions outlined in this agreement. If you do not agree to these terms, please do not use our service. These terms apply to all visitors, users, and others who access or use the service.',
  },
  {
    title: '2. User Accounts',
    content: 'To use certain features of PulseNova, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security.',
  },
  {
    title: '3. Health Information Disclaimer',
    content: 'PulseNova is a health tracking tool and is NOT a medical device or service. The information provided through our platform is for informational and educational purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider.',
  },
  {
    title: '4. Data and Privacy',
    content: 'Your health data belongs to you. We collect, store, and process your data as described in our Privacy Policy. We use industry-standard encryption and security practices to protect your information. We do not sell your personal health data to third parties under any circumstances.',
  },
  {
    title: '5. Acceptable Use',
    content: 'You agree to use PulseNova only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the service. Prohibited activities include attempting to hack or disrupt service, uploading malicious content, impersonating others, or misusing caregiver access.',
  },
  {
    title: '6. Intellectual Property',
    content: 'PulseNova and its original content, features, and functionality are owned by PulseNova Ltd and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Our trademarks may not be used in connection with any product or service without prior written consent.',
  },
  {
    title: '7. Limitation of Liability',
    content: 'To the maximum extent permitted by law, PulseNova shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the service.',
  },
  {
    title: '8. Modifications to Terms',
    content: 'We reserve the right to modify these terms at any time. We will provide notice of significant changes by updating the date at the top of this page and, where appropriate, sending a notification to your registered email. Your continued use of the service after changes constitutes acceptance of the new terms.',
  },
  {
    title: '9. Governing Law',
    content: 'These terms shall be governed and construed in accordance with the laws of Sri Lanka, without regard to its conflict of law provisions. Any disputes arising from these terms or your use of PulseNova shall be subject to the exclusive jurisdiction of the courts of Colombo, Sri Lanka.',
  },
  {
    title: '10. Contact',
    content: 'If you have any questions about these Terms, please contact us at legal@pulsanova.com or by post at: PulseNova Ltd, No. 1, Health Street, Colombo 03, Sri Lanka.',
  },
];

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <>
      <BackgroundEffect />
      <Header />
      <main className="page-wrapper pn-legal-page section-pad">
        <div className="container pn-legal-page__inner">
          <motion.div className="pn-legal-page__content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="section-label">Legal</span>
            <h1 className="pn-legal-page__title">{t('terms_title')}</h1>
            <p className="pn-legal-page__updated">{t('terms_updated')}</p>
            <p className="pn-legal-page__intro">
              Welcome to PulseNova. Please read these Terms and Conditions carefully before using our platform. These terms form a legal agreement between you and PulseNova Ltd.
            </p>
            <div className="pn-legal-page__sections">
              {TERMS.map((section, i) => (
                <motion.div
                  key={i}
                  className="pn-legal-page__section"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <aside className="pn-legal-page__sidebar">
            <div className="pn-legal-page__nav glass">
              <h5>Contents</h5>
              {TERMS.map((s, i) => (
                <button key={i} className="pn-legal-page__nav-link" onClick={() => {}}>{s.title.split('.')[0] + '. ' + s.title.split('.')[1].trim()}</button>
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
