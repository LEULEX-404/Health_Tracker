import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/Imasha/AuthContext';
import { getUserMealPlans, deleteMealPlan, suggestMealPlans } from '../../../services/Tharuka/mealPlanService';
import { Calendar, Trash2, CheckCircle, Wand2, Clock, Flame, Target, Activity, X, ChevronDown, Info, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './NutritionComponents.css';
import HealthyBanner from '../../../assets/healthy_meal_banner.png';

export default function MealPlanDashboard() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [plans,      setPlans]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadPlans = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getUserMealPlans(userId, { limit: 20 });
      setPlans(res.data || []);
    } catch {
      toast.error('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleDelete = async (e, planId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this meal plan?')) return;
    try {
      await deleteMealPlan(planId, userId);
      toast.success('Deleted');
      if (selectedId === planId) setSelectedId(null);
      loadPlans();
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const res = await suggestMealPlans(userId);
      if (res.data?.length > 0) {
        toast.success(`✨ Generated ${res.data.length} AI plan${res.data.length > 1 ? 's' : ''}!`);
        loadPlans();
      } else {
        toast('Update your health profile for personalised plans.', { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate plans');
    } finally {
      setSuggesting(false);
    }
  };

  if (loading) {
    return (
      <div className="n-loader" style={{ minHeight: 280 }}>
        <div className="n-spinner" />
        <span>Loading AI Meal Plans…</span>
      </div>
    );
  }

  const selected = plans.find(p => p._id === selectedId) || null;

  const gridItems = [];
  plans.forEach(plan => {
    gridItems.push({ type: 'card', plan });
    if (selectedId === plan._id) {
      gridItems.push({ type: 'detail', plan });
    }
  });

  return (
    <div className="n-mp-dash">
      {/* Header */}
      <div className="n-mp-header">
        <div>
          <h3 className="n-mp-title">AI Tailored Meal Plans</h3>
          <p className="n-mp-sub">Click a card to expand its recipe breakdown</p>
        </div>
        <button
          className={`n-ai-btn ${suggesting ? 'loading' : ''}`}
          onClick={handleSuggest}
          disabled={suggesting}
        >
          <Wand2 size={18} />
          {suggesting ? 'Generating…' : 'Generate AI Plan'}
        </button>
      </div>

      {/* Redesigned Info Banner */}
      <motion.div 
        className="n-info-banner"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="n-ib-icon"><Info size={22} /></div>
        <div className="n-ib-text">
          <strong>AI Plans prescribe what to eat.</strong> Switch to the <strong>Analysis tab</strong> and use <span className="n-ib-hlight"><UtensilsCrossed size={14}/> Add Log</span> to record what you actually consumed. 
        </div>
      </motion.div>

      {/* Empty state */}
      {plans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="n-card n-empty"
          style={{ padding: '56px 24px' }}
        >
          <div className="n-empty-icon"><Calendar size={60} /></div>
          <strong style={{ fontSize: '1.05rem', color: '#1e293b' }}>No Meal Plans Yet</strong>
          <p style={{ marginTop: 8, maxWidth: 340, textAlign: 'center' }}>
            Click <strong>Generate AI Plan</strong> to get personalised meal regimens based on your health profile.
          </p>
        </motion.div>
      ) : (
        /* Grid containing cards and detail rows */
        <div className="n-plans-grid">
          {gridItems.map((item, idx) => {
            if (item.type === 'card') {
              const plan = item.plan;
              const isActive = selectedId === plan._id;
              return (
                <motion.div
                  key={`card-${plan._id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 280, damping: 26 }}
                  className={`n-plan-card ${isActive ? 'n-plan-card--active' : ''}`}
                  onClick={() => setSelectedId(isActive ? null : plan._id)}
                >
                  <div className="n-plan-banner" style={{ backgroundImage: `url(${HealthyBanner})` }}>
                    <div className="n-plan-overlay">
                      <p className="n-plan-name">{plan.planName}</p>
                    </div>
                  </div>

                  <div className="n-plan-body">
                    <div className="n-plan-tags">
                      <span className="n-plan-type">{plan.mealType}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {plan.isActive && <span className="n-plan-active"><CheckCircle size={12} /> Active</span>}
                        <button className="n-plan-delete" onClick={(e) => handleDelete(e, plan._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="n-plan-macros">
                      <span className="n-plan-chip kcal"><Flame size={12} /> {plan.targetCalories || 0} kcal</span>
                      <span className="n-plan-chip pro"><Target size={12} /> {plan.targetProtein || 0}g</span>
                      <span className="n-plan-chip carb"><Activity size={12} /> {plan.targetCarbohydrates || 0}g</span>
                    </div>

                    {plan.scheduledTime && (
                      <div className="n-plan-time"><Clock size={12} /> {plan.scheduledTime}</div>
                    )}

                    <div className="n-plan-expand-hint">
                      <ChevronDown size={15} style={{ transform: isActive ? 'rotate(180deg)' : 'none', transition: '0.25s' }} />
                      <span>{isActive ? 'Hide details' : 'View recipe'}</span>
                    </div>
                  </div>
                </motion.div>
              );
            }

            if (item.type === 'detail') {
              const plan = item.plan;
              return (
                <AnimatePresence key={`detail-${plan._id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="n-detail-panel"
                    style={{ gridColumn: '1 / -1' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{plan.planName}</h4>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.83rem' }}>Recipe &amp; Nutrition Breakdown</p>
                      </div>
                      <button
                        className="n-modal-close"
                        style={{ position: 'static', margin: 0 }}
                        onClick={() => setSelectedId(null)}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {plan.items?.length > 0 ? (
                      <div className="n-detail-items">
                        {plan.items.map((it, i) => (
                          <div key={i} className="n-detail-item">
                            <span className="n-detail-food">
                              {it.quantity}{it.unit} <strong style={{ textTransform: 'capitalize' }}>{it.name}</strong>
                            </span>
                            <div className="n-result-chips" style={{ marginTop: 5 }}>
                              <span className="n-result-chip kcal">{it.calories || 0} kcal</span>
                              <span className="n-result-chip pro">P {it.protein || 0}g</span>
                              <span className="n-result-chip carb">C {it.carbohydrates || 0}g</span>
                              <span className="n-result-chip fat">F {it.fat || 0}g</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No recipe items available.</p>
                    )}

                    {plan.notes && (
                      <div className="n-plan-note" style={{ marginTop: 14 }}>{plan.notes}</div>
                    )}
                  </motion.div>
                </AnimatePresence>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
