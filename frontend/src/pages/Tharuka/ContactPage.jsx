import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import './ContactPage.css';

const CONTACT_INFO = [
  { icon: Mail,    label: 'Email Us',      value: 'support@pulsanova.com', href: 'mailto:support@pulsanova.com' },
  { icon: Phone,   label: 'Call Us',       value: '+94 11 234 5678',        href: 'tel:+9411234578' },
  { icon: MapPin,  label: 'Visit Us',      value: 'No. 1 Health Street, Colombo 03, Sri Lanka', href: '#' },
  { icon: Clock,   label: 'Support Hours', value: 'Mon–Fri: 8:00 AM – 6:00 PM (IST)', href: null },
  { icon: MessageCircle, label: 'Live Chat', value: 'Available inside the app dashboard', href: null },
];

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name = 'Name is required';
    if (!form.email.trim())   e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <>
      <BackgroundEffect />
      <Header />
      <main className="page-wrapper pn-contact section-pad">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Get In Touch</span>
            <h1 className="section-title">{t('contact_title')}</h1>
            <p className="section-subtitle">Have questions, feedback, or need support? We'd love to hear from you. Our team responds within 24 hours.</p>
          </div>

          <div className="pn-contact__grid">
            {/* Info Panel */}
            <motion.div className="pn-contact__info" initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
              <h3>{t('contact_info')}</h3>
              <ul className="pn-contact__info-list">
                {CONTACT_INFO.map(info => {
                  const Icon = info.icon;
                  return (
                    <li key={info.label} className="pn-contact__info-item">
                      <div className="pn-contact__info-icon"><Icon size={18} /></div>
                      <div>
                        <span className="pn-contact__info-label">{info.label}</span>
                        {info.href
                          ? <a href={info.href} className="pn-contact__info-value">{info.value}</a>
                          : <p className="pn-contact__info-value">{info.value}</p>
                        }
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Form Panel */}
            <motion.div className="pn-contact__form-wrap" initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.15 }}>
              {submitted ? (
                <div className="pn-contact__success">
                  <CheckCircle2 size={48} />
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ name:'', email:'', subject:'', message:'' }); }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <form className="pn-contact__form" onSubmit={handleSubmit} noValidate>
                  <div className="pn-contact__row">
                    <div className={`pn-contact__field ${errors.name ? 'error' : ''}`}>
                      <label>{t('contact_name')} *</label>
                      <input type="text" value={form.name} onChange={handleChange('name')} placeholder="John Doe" />
                      {errors.name && <span className="pn-contact__error">{errors.name}</span>}
                    </div>
                    <div className={`pn-contact__field ${errors.email ? 'error' : ''}`}>
                      <label>{t('contact_email')} *</label>
                      <input type="email" value={form.email} onChange={handleChange('email')} placeholder="john@example.com" />
                      {errors.email && <span className="pn-contact__error">{errors.email}</span>}
                    </div>
                  </div>
                  <div className={`pn-contact__field ${errors.subject ? 'error' : ''}`}>
                    <label>{t('contact_subject')} *</label>
                    <input type="text" value={form.subject} onChange={handleChange('subject')} placeholder="How can we help?" />
                    {errors.subject && <span className="pn-contact__error">{errors.subject}</span>}
                  </div>
                  <div className={`pn-contact__field ${errors.message ? 'error' : ''}`}>
                    <label>{t('contact_message')} *</label>
                    <textarea value={form.message} onChange={handleChange('message')} rows={5} placeholder="Tell us more about your inquiry..." />
                    {errors.message && <span className="pn-contact__error">{errors.message}</span>}
                  </div>
                  <button type="submit" className={`btn-primary pn-contact__submit ${loading ? 'loading' : ''}`} disabled={loading}>
                    {loading ? <><span className="pn-contact__spinner" /> Sending...</> : <><Send size={16} /> {t('contact_send')}</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
