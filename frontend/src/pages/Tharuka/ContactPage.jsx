import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Send, CheckCircle2, Clock, 
  MessageCircle, Shield, Users, Star, 
  AlertTriangle, ArrowRight, User, List, Edit2, Plus, Bell, Leaf, ChevronDown
} from 'lucide-react';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import './ContactPage.css';

const STATS = [
  { icon: Mail, value: '< 24h', label: 'Email Response' },
  { icon: MessageCircle, value: 'Live', label: 'Chat Support' },
  { icon: Clock, value: '6 Days', label: 'Week Support' },
  { icon: Star, value: '4.9★', label: 'Satisfaction Score' }
];

const CHANNELS = [
  { 
    title: 'Email Support', badge: '< 24H REPLY', icon: Mail, 
    value: 'support@pulsanova.com', desc: 'Send us a detailed message and our team will respond within 24 hours.',
    action: 'Send Email', href: 'mailto:support@pulsanova.com'
  },
  { 
    title: 'Phone Support', badge: 'MON-SAT', icon: Phone, 
    value: '+94 11 234 5678', desc: 'Speak directly with a PulseNova health support specialist Monday-Saturday.',
    action: 'Call Now', href: 'tel:+94112345678'
  },
  { 
    title: 'Office Location', badge: 'HQ OFFICE', icon: MapPin, 
    value: 'Colombo 03, Sri Lanka', desc: 'No. 1 Health Street, Colombo 03. Visit us during business hours.',
    action: 'Get Directions', href: '#'
  },
  { 
    title: 'Live Chat', badge: 'ONLINE NOW', icon: MessageCircle, 
    value: 'In-App Dashboard', desc: 'Access real-time chat support directly from your PulseNova dashboard.',
    action: 'Open Dashboard', href: '#'
  },
  { 
    title: 'Support Hours', badge: '6 DAYS/WEEK', icon: Clock, 
    value: 'Mon-Sat, 8AM-6PM', desc: 'Our support team is available 6 days a week to answer your health questions.',
    action: 'Book a Call', href: '#'
  }
];

const FAQS = [
  { id: 1, q: 'Can I talk to a wellness expert directly?', a: 'Yes! Premium members can book 1-on-1 consultations through their dashboard. For general inquiries, our support team can help.' },
  { id: 2, q: 'Is my health data secure when I contact support?', a: 'Absolutely. We use end-to-end encryption for all support communications and are fully HIPAA compliant. Never share passwords, though.' },
  { id: 3, q: 'How quickly will I get a response?', a: 'We guarantee a response within 24 hours for all email inquiries, though typically we reply within 2-4 hours during business days.' }
];

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: '', urgency: 'Low', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [openFaq, setOpenFaq] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name = 'Required';
    if (!form.email.trim())   e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.type)           e.type = 'Required';
    if (!form.subject.trim()) e.subject = 'Required';
    if (!form.message.trim()) e.message = 'Required';
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

  const setUrgency = (level) => {
    setForm(f => ({ ...f, urgency: level }));
  };

  return (
    <>
      <BackgroundEffect />
      <Header />
      <main className="page-wrapper pn-contact">
        <div className="container">
          
          {/* 1. Hero Section */}
          <section className="pn-contact-hero">
            <div className="pn-hero-grid">
              <motion.div className="pn-hero-content" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration: 0.6 }}>
                <span className="section-label"><MessageCircle size={14}/> GET IN TOUCH</span>
                <h1>We're Here <br/><span>to Help You</span></h1>
                <p className="pn-hero-desc">Have questions about your health journey, our platform, or need personalized support? Our expert team is ready to assist you — fast, caring, and always professional.</p>
                <div className="pn-hero-actions">
                  <button className="btn-primary" onClick={() => document.getElementById('contact-form').scrollIntoView()}><Mail size={18}/> Send a Message <ArrowRight size={18}/></button>
                  <a href="tel:+94112345678" className="btn-outline"><Phone size={18}/> Call Us Now</a>
                </div>
                <div className="pn-hero-trust">
                  <div className="trust-badge"><Shield size={16}/> HIPAA Compliant</div>
                  <div className="trust-badge"><Shield size={16}/> Encrypted & Secure</div>
                </div>
              </motion.div>

              <motion.div className="pn-hero-visual" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration: 0.8, delay:0.2 }}>
                <img src="/images/Tharuka/Contactus/contact.png" alt="Contact Support Representative" />
                
                {/* Floating Cards */}
                <motion.div className="floating-card fc-1" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.5 }}>
                  <div className="card-icon outline"><Clock size={20}/></div>
                  <div className="card-text"><p>Response Time</p><h4>&lt; 24 Hours</h4></div>
                </motion.div>
                <motion.div className="floating-card fc-2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.6 }}>
                  <div className="card-icon outline"><MessageCircle size={20}/></div>
                  <div className="card-text"><p>Live Chat</p><h4>Available Now</h4></div>
                </motion.div>
                <motion.div className="floating-card fc-3" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.7 }}>
                  <div className="card-icon outline"><Shield size={20}/></div>
                  <div className="card-text"><p>Trusted By</p><h4>200K+ Users</h4></div>
                </motion.div>
                <motion.div className="floating-card fc-4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.8 }}>
                  <div className="card-icon outline"><Users size={20}/></div>
                  <div className="card-text"><p>Support Team</p><h4>Health Experts</h4></div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* 3. Form & Sidebar */}
          <section className="pn-contact-main" id="contact-form">
            <motion.div className="pn-form-wrap" initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
              <span className="section-label"><Mail size={14}/> SEND A MESSAGE</span>
              <h2>Let's Start a <span>Conversation</span></h2>
              <p>All fields marked with <span>*</span> are required.</p>

              {submitted ? (
                <div className="pn-contact__success">
                  <CheckCircle2 size={64} />
                  <h3>Message Sent Successfully!</h3>
                  <p>Thank you for reaching out. Our support team has received your message and will respond within 24 hours.</p>
                  <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ name:'', email:'', phone:'', type:'', urgency:'Low', subject:'', message:'' }); }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="pn-contact__form" onSubmit={handleSubmit} noValidate>
                  <div className="pn-contact__row">
                    <div className={`pn-contact__field ${errors.name ? 'error' : ''}`}>
                      <label>FULL NAME <span>*</span></label>
                      <div className="input-with-icon">
                        <User size={18} className="input-icon" />
                        <input type="text" value={form.name} onChange={handleChange('name')} placeholder="Jane Doe" />
                      </div>
                      {errors.name && <span className="pn-contact__error">{errors.name}</span>}
                    </div>
                    <div className={`pn-contact__field ${errors.email ? 'error' : ''}`}>
                      <label>EMAIL ADDRESS <span>*</span></label>
                      <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input type="email" value={form.email} onChange={handleChange('email')} placeholder="jane@example.com" />
                      </div>
                      {errors.email && <span className="pn-contact__error">{errors.email}</span>}
                    </div>
                  </div>
                  
                  <div className="pn-contact__row">
                    <div className="pn-contact__field">
                      <label>PHONE (OPTIONAL)</label>
                      <div className="input-with-icon">
                        <Phone size={18} className="input-icon" />
                        <input type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="+1 234 567 8900" />
                      </div>
                    </div>
                    <div className={`pn-contact__field ${errors.type ? 'error' : ''}`}>
                      <label>INQUIRY TYPE <span>*</span></label>
                      <div className="input-with-icon">
                        <List size={18} className="input-icon" />
                        <select value={form.type} onChange={handleChange('type')}>
                          <option value="" disabled>Select category...</option>
                          <option value="General Question">General Question</option>
                          <option value="Technical Support">Technical Support</option>
                          <option value="Billing">Billing & Subscription</option>
                          <option value="Health Expert Advice">Health Expert Advice</option>
                        </select>
                        <ChevronDown size={16} className="select-icon" />
                      </div>
                      {errors.type && <span className="pn-contact__error">{errors.type}</span>}
                    </div>
                  </div>

                  <div className="pn-contact__field">
                    <label>URGENCY LEVEL</label>
                    <div className="urgency-toggles">
                      <button type="button" className={`urgency-btn u-low ${form.urgency === 'Low' ? 'active' : ''}`} onClick={() => setUrgency('Low')}>
                        <Leaf size={16} className="u-icon" color={form.urgency === 'Low' ? undefined : '#22c55e'} /> 
                        Low — No rush
                      </button>
                      <button type="button" className={`urgency-btn u-medium ${form.urgency === 'Medium' ? 'active' : ''}`} onClick={() => setUrgency('Medium')}>
                        <Clock size={16} className="u-icon" color={form.urgency === 'Medium' ? undefined : '#00b386'} /> 
                        Medium — Within a day
                      </button>
                      <button type="button" className={`urgency-btn u-high ${form.urgency === 'High' ? 'active' : ''}`} onClick={() => setUrgency('High')}>
                        <AlertTriangle size={16} className="u-icon" color={form.urgency === 'High' ? undefined : '#f59e0b'} /> 
                        High — Urgent help needed
                      </button>
                    </div>
                  </div>

                  <div className={`pn-contact__field ${errors.subject ? 'error' : ''}`}>
                      <label>SUBJECT <span>*</span></label>
                      <div className="input-with-icon">
                        <Edit2 size={18} className="input-icon" />
                        <input type="text" value={form.subject} onChange={handleChange('subject')} placeholder="How can we help you today?" />
                      </div>
                      {errors.subject && <span className="pn-contact__error">{errors.subject}</span>}
                  </div>

                  <div className={`pn-contact__field ${errors.message ? 'error' : ''}`}>
                    <label>
                      <span>YOUR MESSAGE <span>*</span></span>
                      <span className="pn-contact__char-count">{form.message.length}/500</span>
                    </label>
                    <textarea value={form.message} onChange={(e) => {
                      if(e.target.value.length <= 500) handleChange('message')(e);
                    }} rows={4} placeholder="Please describe your question or request in as much detail as possible..." style={{resize: 'none'}} />
                    {errors.message && <span className="pn-contact__error">{errors.message}</span>}
                  </div>

                  <button type="submit" className={`btn-primary pn-contact-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                    {loading ? 'Sending Message...' : <><Send size={18} /> Send Message <ArrowRight size={18}/></>}
                  </button>
                  <p className="submit-disclaimer">By submitting, you agree to our <a href="/privacy">Privacy Policy</a>. We never share your data.</p>
                </form>
              )}
            </motion.div>

            <motion.div className="pn-sidebar" initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.2 }}>
              
              {/* Response Card */}
              <div className="sb-card green-bg">
                <div className="sb-header"><Clock size={20} color="#fff"/></div>
                <h3>&lt; 24h</h3>
                <p><strong>Average Response Time</strong><br/><br/>Our dedicated support team monitors messages around the clock to ensure fast, accurate replies.</p>
                <div className="expert-team">
                  <div className="avatar-group">
                     <img src="https://i.pravatar.cc/100?img=1" alt="agent" />
                     <img src="https://i.pravatar.cc/100?img=5" alt="agent" />
                     <img src="https://i.pravatar.cc/100?img=8" alt="agent" />
                  </div>
                  <span>Expert team standing by</span>
                </div>
              </div>

              {/* Support Hours Card */}
              <div className="sb-card">
                <div className="sb-header"><Clock size={18}/><h4>Support Hours</h4></div>
                <p style={{fontSize:'var(--fs-xs)', color:'var(--color-primary)', fontWeight:'700', marginTop:'-10px', marginBottom:'1.25rem'}}>We're available 6 days</p>
                <ul className="hours-list">
                  <li><span>Mon — Fri</span> <span>8:00 AM – 6:00 PM</span></li>
                  <li><span>Saturday</span> <span>9:00 AM – 2:00 PM</span></li>
                  <li><span>Sunday</span> <span style={{color:'var(--text-muted)'}}>Closed</span></li>
                </ul>
              </div>

              {/* Testimonial */}
              <div className="sb-card">
                <div className="testimonial">
                  <div className="stars">
                    <Star size={14}/><Star size={14}/><Star size={14}/><Star size={14}/><Star size={14}/>
                  </div>
                  <p className="t-quote">"PulseNova's support team responded in under an hour and helped me set up my nutrition plan perfectly. Absolutely world-class service."</p>
                  <div className="t-author">
                    <img src="https://i.pravatar.cc/100?img=9" alt="Sarah M." />
                    <div><p>Sarah M.</p><span>Premium Member · Sri Lanka</span></div>
                  </div>
                </div>
              </div>

              {/* Quick Answers FAQ */}
              <div className="sb-card" style={{background: 'transparent', border: 'none', padding: 0, boxShadow: 'none'}}>
                <div className="sb-header" style={{background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)'}}><MessageCircle size={18}/><h4>Quick Answers</h4></div>
                <div className="faq-list">
                  {FAQS.map(faq => (
                    <div key={faq.id} className="faq-item">
                      <div className={`faq-header ${openFaq === faq.id ? 'active' : ''}`} onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}>
                        <span>{faq.q}</span>
                        <Plus size={18} className="faq-icon" style={{transform: openFaq === faq.id ? 'rotate(45deg)' : 'rotate(0)'}}/>
                      </div>
                      <AnimatePresence>
                        {openFaq === faq.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{overflow:'hidden'}}>
                            <div className="faq-answer">{faq.a}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Alert Card */}
              <div className="sb-card emergency-card" style={{marginTop: '0.5rem'}}>
                 <div className="sb-header"><AlertTriangle size={18}/><h4>Medical Emergency?</h4></div>
                 <p>PulseNova is not an emergency service. For immediate medical help, please contact your local emergency number or go to the nearest hospital.</p>
              </div>

            </motion.div>
          </section>

        </div> {/* End Container */}

        {/* 4. Contact Channels Grid */}
        <section className="pn-channels section-pad">
           <div className="container">
              <span className="section-label"><Phone size={14}/> CONTACT CHANNELS</span>
              <h2 className="section-title">Reach Us <span>Your Way</span></h2>
              <p className="section-subtitle">Choose the channel that works best for you — we're always just a message, call, or click away.</p>
              
              <div className="channels-grid">
                {CHANNELS.map((ch, i) => {
                  const Icon = ch.icon;
                  return (
                    <motion.div key={i} className="channel-card" initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay: i * 0.1 }}>
                       <span className="channel-badge">{ch.badge}</span>
                       <div className="card-icon"><Icon size={24}/></div>
                       <h3>{ch.title}</h3>
                       <span className="val">{ch.value}</span>
                       <p>{ch.desc}</p>
                       <a href={ch.href} className="btn-link">{ch.action} <ArrowRight size={16}/></a>
                    </motion.div>
                  )
                })}
              </div>
           </div>
        </section>

      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
