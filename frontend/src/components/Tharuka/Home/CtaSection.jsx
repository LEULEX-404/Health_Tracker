import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CtaSection.css';

export default function CtaSection() {
  const { t } = useTranslation();
  return (
    <section className="pn-cta">
      <div className="pn-cta__bg">
        <div className="pn-cta__blob pn-cta__blob--1" />
        <div className="pn-cta__blob pn-cta__blob--2" />
        <div className="pn-cta__blob pn-cta__blob--3" />
      </div>
      <div className="container pn-cta__inner">
        <motion.div
          className="pn-cta__content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label" style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
            Get Started
          </span>
          <h2 className="pn-cta__title">{t('cta_title')}</h2>
          <p className="pn-cta__desc">{t('cta_desc')}</p>
          <div className="pn-cta__actions">
            <Link to="/signup" className="pn-cta__btn">
              {t('cta_button')} <ArrowRight size={18} />
            </Link>
            <p className="pn-cta__sub">{t('cta_sub')}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
