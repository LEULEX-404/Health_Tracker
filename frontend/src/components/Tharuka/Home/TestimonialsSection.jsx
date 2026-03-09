import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import './TestimonialsSection.css';

const TESTIMONIALS = [
  { name: 'Amara Perera', role: 'Fitness Enthusiast', location: 'Colombo, Sri Lanka', rating: 5, text: 'PulseNova completely transformed how I track my health. The nutrition insights are incredibly accurate, and the exercise logging makes my workouts so much more productive.' },
  { name: 'Kavitha Nair', role: 'Diabetes Patient', location: 'Kandy, Sri Lanka', rating: 5, text: 'As someone managing diabetes, PulseNova gives me the peace of mind I need. The meal reminders and health reports have been life-changing for my daily routine.' },
  { name: 'Roshan Fernando', role: 'Caregiver', location: 'Galle, Sri Lanka', rating: 5, text: 'Managing my mother\'s care has become so much easier with PulseNova. The caregiver connect feature lets me coordinate appointments and monitor her health in real-time.' },
  { name: 'Sinthuja Murugan', role: 'Yoga Instructor', location: 'Jaffna, Sri Lanka', rating: 5, text: 'I recommend PulseNova to all my students. The multilingual support is fantastic — many of my Tamil-speaking clients love that they can use the app in their language.' },
];

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const prev = () => setCurrent(c => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent(c => (c + 1) % TESTIMONIALS.length);

  const visible = [
    TESTIMONIALS[current],
    TESTIMONIALS[(current + 1) % TESTIMONIALS.length],
    TESTIMONIALS[(current + 2) % TESTIMONIALS.length],
  ];

  return (
    <section className="pn-test section-pad" ref={ref}>
      <div className="container">
        <div className="section-header">
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">{t('test_title')}</h2>
          <p className="section-subtitle">{t('test_subtitle')}</p>
        </div>
        <div className="pn-test__grid">
          {visible.map((t2, i) => (
            <motion.div
              key={`${t2.name}-${current}`}
              className="pn-test__card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
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
            </motion.div>
          ))}
        </div>
        <div className="pn-test__controls">
          <button className="pn-test__nav" onClick={prev} aria-label="Previous"><ChevronLeft size={20} /></button>
          <div className="pn-test__dots">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} className={`pn-test__dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
            ))}
          </div>
          <button className="pn-test__nav" onClick={next} aria-label="Next"><ChevronRight size={20} /></button>
        </div>
      </div>
    </section>
  );
}
