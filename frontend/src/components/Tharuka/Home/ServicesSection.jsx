import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import './ServicesSection.css';

const services = [
  { key: 'nutrition', img: '/images/Tharuka/services_nutrition.png', align: 'right' },
  { key: 'exercise',  img: '/images/Tharuka/services_exercise.png',  align: 'left'  },
  { key: 'health',   img: '/images/Tharuka/hero_dashboard.png',     align: 'right' },
  { key: 'caregiver',img: '/images/Tharuka/about_team.png',         align: 'left'  },
];

const ServiceRow = memo(({ svc, index }) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = svc.align === 'left';

  return (
    <div ref={ref} className={`pn-svc-row ${isLeft ? 'pn-svc-row--left' : ''}`}>
      <motion.div
        className="pn-svc-row__img-wrap"
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <img 
          src={svc.img} 
          alt={t(`serv_${svc.key}_title`)} 
          className="pn-svc-row__img" 
          loading="lazy"
          decoding="async"
        />
        <div className="pn-svc-row__img-glow" />
      </motion.div>
      <motion.div
        className="pn-svc-row__content"
        initial={{ opacity: 0, x: isLeft ? 50 : -50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="section-label">Service 0{index + 1}</span>
        <h3 className="pn-svc-row__title">{t(`serv_${svc.key}_title`)}</h3>
        <p className="pn-svc-row__desc">{t(`serv_${svc.key}_desc`)}</p>
        <ul className="pn-svc-row__bullets">
          {['Personalized & AI-powered', 'Real-time updates', 'Secure & private data', 'Cross-device sync'].map(b => (
            <li key={b}><CheckCircle2 size={15} />{b}</li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
});

export default function ServicesSection() {
  const { t } = useTranslation();

  return (
    <section className="pn-services section-pad" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Services</span>
          <h2 className="section-title">{t('serv_title')}</h2>
          <p className="section-subtitle">{t('serv_subtitle')}</p>
        </div>
        <div className="pn-services__list">
          {services.map((svc, i) => <ServiceRow key={svc.key} svc={svc} index={i} />)}
        </div>
      </div>
    </section>
  );
}
