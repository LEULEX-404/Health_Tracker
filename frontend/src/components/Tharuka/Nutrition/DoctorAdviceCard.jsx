import React from 'react';
import { Calendar, Stethoscope, CheckCircle2, ClipboardList, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import DoctorBg from '../../../assets/doctor_advice_bg.png';
import './NutritionComponents.css';

import SpecialistSeal from './SpecialistSeal';

export default function DoctorAdviceCard({ recommendation }) {
  if (!recommendation) {
    return (
      <div className="n-card n-doc-card empty">
        <div className="n-doc-header">
          <Stethoscope size={24} className="n-doc-icon" />
          <h3 className="n-doc-title">Doctor's Advice</h3>
        </div>
        <div className="n-doc-empty">
          <p>No active medical directives for this period.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="n-card n-doctor-card"
    >
      <div className="n-doctor-hero" style={{ backgroundImage: `url(${DoctorBg})` }}>
        <div className="n-doctor-hero-inner">
          <div className="n-doc-avatar"><Stethoscope size={26} /></div>
          <div style={{ flex: 1 }}>
            <p className="n-doc-title">Medical Directive</p>
            <p className="n-doc-sub" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={12} />
              {new Date(recommendation.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="n-doc-badge"><CheckCircle2 size={13} /> Active</div>
        </div>
      </div>

      <div className="n-doctor-body">
        <div className="n-doc-tags">
          <span className="n-doc-tag"><ClipboardList size={13} /> Specialist Reviewed</span>
          <span className="n-doc-tag"><Activity size={13} /> Targets Adjusted</span>
        </div>

        <blockquote className="n-doc-quote">{recommendation.message}</blockquote>

        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', margin: '0 0 10px' }}>
            Prescribed Daily Macros
          </p>
          <div className="n-doc-targets">
            {recommendation.targetCalories && (
              <div className="n-doc-target-item kcal">
                <span>Calories</span>
                <strong>{recommendation.targetCalories}</strong>
                <em>kcal</em>
              </div>
            )}
            {recommendation.targetProtein && (
              <div className="n-doc-target-item pro">
                <span>Protein</span>
                <strong>{recommendation.targetProtein}</strong>
                <em>g</em>
              </div>
            )}
            {recommendation.targetCarbohydrates && (
              <div className="n-doc-target-item carb">
                <span>Carbs</span>
                <strong>{recommendation.targetCarbohydrates}</strong>
                <em>g</em>
              </div>
            )}
            {recommendation.targetFat && (
              <div className="n-doc-target-item fat">
                <span>Fat</span>
                <strong>{recommendation.targetFat}</strong>
                <em>g</em>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
