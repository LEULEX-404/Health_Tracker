import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import './TestimonialsSection.css';

const TESTIMONIALS = [
  { name: 'Amara Perera', role: 'Fitness Enthusiast', location: 'Colombo, Sri Lanka', rating: 5, text: 'PulseNova completely transformed how I track my health. The nutrition insights are incredibly accurate, and the exercise logging makes my workouts so much more productive.' },
  { name: 'Kavitha Nair', role: 'Diabetes Patient', location: 'Kandy, Sri Lanka', rating: 5, text: 'As someone managing diabetes, PulseNova gives me the peace of mind I need. The meal reminders and health reports have been life-changing for my daily routine.' },
  { name: 'Roshan Fernando', role: 'Caregiver', location: 'Galle, Sri Lanka', rating: 5, text: 'Managing my mother\'s care has become so much easier with PulseNova. The caregiver connect feature lets me coordinate appointments and monitor her health in real-time.' },
  { name: 'Sinthuja Murugan', role: 'Yoga Instructor', location: 'Jaffna, Sri Lanka', rating: 5, text: 'I recommend PulseNova to all my students. The multilingual support is fantastic — many of my Tamil-speaking clients love that they can use the app in their language.' },
];

const TestimonialCard = memo(({ t2, i }) => (
  <div className="pn-test__card">
    <div className="pn-test__stars">
      {[...Array(t2.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
    </div>
    <p className="pn-test__text">"{t2.text}"</p>
    <div className="pn-test__author">
      <div className="pn-test__avatar">{t2.name[0]}</div>
      <div>
        <strong className="pn-test__name">{t2.name}</strong>
        <span className="pn-test__meta">{t2.role} · {t2.location}</span>
      </div>
    </div>
  </div>
));

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // Double array for seamless loop
  const loopedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="pn-test section-pad" ref={ref}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="section-header">
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">{t('test_title')}</h2>
          <p className="section-subtitle">{t('test_subtitle')}</p>
        </div>
      </div>

      <motion.div 
        className="pn-test__carousel"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="pn-test__track" style={{ willChange: 'transform' }}>
          {loopedTestimonials.map((t2, i) => (
            <TestimonialCard key={`${t2.name}-${i}`} t2={t2} i={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
