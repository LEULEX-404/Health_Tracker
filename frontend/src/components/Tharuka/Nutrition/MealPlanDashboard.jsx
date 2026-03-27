import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/Imasha/AuthContext';
import { getUserMealPlans, deleteMealPlan, suggestMealPlans, createMealPlan } from '../../../services/Tharuka/mealPlanService';
import { getUserReminders, markReminderCompleted, markReminderSkipped } from '../../../services/Tharuka/mealReminderService';
import ManualMealPlanModal from './ManualMealPlanModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Calendar, Trash2, CheckCircle, Wand2, Clock, Flame, Target, Activity, X, ChevronDown, Info, UtensilsCrossed, Bell, Check, Navigation, Plus, Sunrise, Sun, Sunset, Coffee, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './NutritionComponents.css';
import HealthyBanner from '../../../assets/healthy_meal_banner.png';

export default function MealPlanDashboard({ onLogMeal, onRefresh }) {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [plans,      setPlans]      = useState([]);
  const [reminders,  setReminders]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('breakfast');
  const [isAISelectOpen, setIsAISelectOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Set default tab based on current time
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 9 && hours < 14) setActiveTab('lunch');
    else if (hours >= 14 && hours < 21) setActiveTab('dinner');
    else setActiveTab('breakfast');
  }, []);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const [plansRes, remindersRes] = await Promise.all([
        getUserMealPlans(userId, { limit: 20 }),
        getUserReminders(userId, { startDate: today.toISOString(), endDate: end.toISOString() })
      ]);
      setPlans(plansRes.data || []);
      setReminders(remindersRes.data || []);
    } catch {
      toast.error('Failed to load meal data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = (e, planId) => {
    e.stopPropagation();
    setDeletingId(planId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await deleteMealPlan(deletingId, userId);
      toast.success('Meal plan removed successfully');
      if (selectedId === deletingId) setSelectedId(null);
      setIsDeleteModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to delete plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = () => {
    setIsAISelectOpen(true);
  };

  const handleAISelect = async (mealType) => {
    setIsAISelectOpen(false);
    setSuggesting(true);
    try {
      const res = await suggestMealPlans(userId, mealType);
      if (res.data?.length > 0) {
        toast.success(`✨ Generated AI ${mealType} plan!`);
        setActiveTab(mealType);
        loadData();
      } else {
        toast('Update your health profile for personalised plans.', { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate plans');
    } finally {
      setSuggesting(false);
    }
  };

  const handleReminderAction = async (reminderId, action, mealData = null) => {
    try {
      if (action === 'complete') {
        await markReminderCompleted(reminderId, userId, mealData);
        toast.success(mealData ? 'Meal logged & reminder completed!' : 'Reminder completed!');
      } else if (action === 'skip') {
        await markReminderSkipped(reminderId, userId);
        toast.success('Reminder skipped');
      }
      loadData();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleManualPlanSubmit = async (planData) => {
    try {
      await createMealPlan(userId, planData);
      toast.success('Custom meal plan created!');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to create plan');
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
  const filteredPlans = plans.filter(p => p.mealType === activeTab);

  const gridItems = [];
  filteredPlans.forEach(plan => {
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
          <h2 className="n-mp-title">Meal Planner</h2>
          <p className="n-mp-sub">Schedule your meals and track your daily consistency</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="n-btn n-btn-outline" 
            onClick={() => setIsManualModalOpen(true)}
            style={{ padding: '12px 20px' }}
          >
            <Plus size={18} /> Add Custom Plan
          </button>
          <button 
            className={`n-ai-btn ${suggesting ? 'loading' : ''}`}
            onClick={handleSuggest}
            disabled={suggesting}
          >
            <Wand2 size={18} /> {suggesting ? 'Generating...' : 'Generate AI Plan'}
          </button>
        </div>
      </div>

      {/* Daily Reminders Section */}
      <div className="n-reminders-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Bell size={20} className="text-amber-500" />
          <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Daily Meal Reminders</h4>
        </div>

        {reminders.length === 0 ? (
          <div className="n-reminder-empty">
            <CheckCircle size={32} style={{ color: '#00C897', opacity: 0.6 }} />
            <p>All caught up! No pending reminders for today.</p>
          </div>
        ) : (
          <div className="n-reminder-list">
            {reminders.map((rem) => {
              const TYPE_ICONS = {
  breakfast: Sunrise,
  lunch:     Sun,
  dinner:    Moon,
  snack:     Coffee
};
const TYPE_COLORS = {
  breakfast: '#f59e0b',
  lunch:     '#10b981',
  dinner:    '#8b5cf6',
  snack:     '#f97316'
};
              const isCompleted = rem.status === 'completed';
              const isSkipped = rem.status === 'skipped';
              const time = new Date(rem.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <motion.div 
                  key={rem._id} 
                  className={`n-reminder-item ${isCompleted ? 'completed' : ''} ${isSkipped ? 'skipped' : ''}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="n-rem-time">{time}</div>
                  <div className="n-rem-content">
                    <div className="n-rem-type">{rem.mealType}</div>
                    <div className="n-rem-name">{rem.mealName || rem.mealPlanId?.planName}</div>
                  </div>
                  
                  <div className="n-rem-actions">
                    {!isCompleted && !isSkipped && (
                      <>
                        <button 
                          className="n-rem-btn log"
                          onClick={() => onLogMeal({
                            mealType: rem.mealType,
                            mealName: rem.mealName || rem.mealPlanId?.planName,
                            items: rem.mealPlanId?.items || [],
                            mealReminderId: rem._id
                          })}
                        >
                          <UtensilsCrossed size={14} /> Log Meal
                        </button>
                        <button 
                          className="n-rem-btn check"
                          onClick={() => handleReminderAction(rem._id, 'complete')}
                        >
                          <Check size={14} /> Done
                        </button>
                        <button 
                          className="n-rem-btn skip"
                          onClick={() => handleReminderAction(rem._id, 'skip')}
                        >
                          <X size={14} /> Skip
                        </button>
                      </>
                    )}
                    {isCompleted && <span className="n-rem-status done"><CheckCircle size={14} /> Logged</span>}
                    {isSkipped && <span className="n-rem-status skipped"><X size={14} /> Skipped</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
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

      {/* Active Plans Section */}
      <div style={{ marginTop: 40, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Explore Your Meal Plans</h4>
            <p style={{ color: 'var(--n-muted)', fontSize: '0.95rem', marginTop: 4 }}>Premium nutritional templates categorized by time</p>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="n-mp-tabs">
          {[
            { id: 'breakfast', label: 'Breakfast', icon: Sunrise },
            { id: 'lunch', label: 'Lunch', icon: Sun },
            { id: 'dinner', label: 'Dinner', icon: Sunset },
            { id: 'snack', label: 'Snacks', icon: Coffee },
          ].map((t) => (
            <button
              key={t.id}
              className={`n-mp-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(t.id); setSelectedId(null); }}
            >
              <t.icon size={16} />
              <span>{t.label}</span>
              {activeTab === t.id && <motion.div layoutId="activeTabLine" className="n-mp-tab-line" />}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredPlans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="n-card n-empty"
          style={{ padding: '64px 24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--n-border)' }}
        >
          <div className="n-empty-icon" style={{ opacity: 0.3 }}><UtensilsCrossed size={60} /></div>
          <strong style={{ fontSize: '1.1rem', color: 'var(--n-text)', marginTop: 16 }}>No {activeTab} plans found</strong>
          <p style={{ marginTop: 8, maxWidth: 340, textAlign: 'center', color: 'var(--n-muted)' }}>
            There are no active plans for this category. Click <strong>Generate AI Plan</strong> to create one or add a custom one manually.
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
                    <button 
                      className="n-plan-delete" 
                      onClick={(e) => handleDelete(e, plan._id)}
                      style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}
                    >
                      <Trash2 size={14} />
                    </button>
                    {plan.isActive && (
                      <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(34,197,94,0.9)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={12} /> ACTIVE
                      </div>
                    )}
                  </div>

                  <div className="n-plan-body">
                    <div className="n-plan-macros">
                      <div className="n-plan-chip kcal"><Flame size={14} /> {plan.targetCalories || 0} kcal</div>
                      <div className="n-plan-chip pro"><Target size={14} /> {plan.targetProtein || 0}g</div>
                      <div className="n-plan-chip carb"><Activity size={14} /> {plan.targetCarbohydrates || 0}g</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="n-plan-type">{plan.mealType}</span>
                      {plan.scheduledTime && (
                        <div className="n-plan-time"><Clock size={14} /> {plan.scheduledTime}</div>
                      )}
                    </div>

                    <div className="n-plan-expand-hint">
                      <ChevronDown size={18} style={{ transform: isActive ? 'rotate(180deg)' : 'none', transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
                      <span>{isActive ? 'Close Details' : 'View Recipe Details'}</span>
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
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className="n-icon-btn del-premium"
                          onClick={(e) => handleDelete(e, plan._id)}
                          title="Delete Plan"
                          style={{ margin: 0 }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="n-modal-close"
                          style={{ position: 'static', margin: 0 }}
                          onClick={() => setSelectedId(null)}
                        >
                          <X size={16} />
                        </button>
                      </div>
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
      <ManualMealPlanModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
        onSubmit={handleManualPlanSubmit}
      />

      {/* AI Suggestion Type Selector */}
      <AnimatePresence>
        {isAISelectOpen && (
          <div className="n-overlay" onClick={() => setIsAISelectOpen(false)}>
            <motion.div 
              className="n-modal n-ai-select-modal" 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 400 }}
            >
              <div className="n-modal-head">
                <div>
                  <h2 style={{ fontSize: '1.4rem' }}>Generate AI Plan</h2>
                  <p>Choose a category for your new AI-tailored plan</p>
                </div>
                <button className="n-modal-close" onClick={() => setIsAISelectOpen(false)}><X size={20} /></button>
              </div>
              <div className="n-ai-options">
                {[
                  { id: 'breakfast', label: 'Breakfast', icon: Sunrise, desc: 'Energizing morning starts' },
                  { id: 'lunch', label: 'Lunch', icon: Sun, desc: 'Balanced afternoon fuel' },
                  { id: 'dinner', label: 'Dinner', icon: Sunset, desc: 'Nourishing end-of-day meals' },
                  { id: 'snack', label: 'Snacks', icon: Coffee, desc: 'Healthy quick bites' }
                ].map(opt => (
                  <button key={opt.id} className="n-ai-opt-btn" onClick={() => handleAISelect(opt.id)}>
                    <div className="n-ai-opt-icon"><opt.icon size={22} /></div>
                    <div className="n-ai-opt-text">
                      <strong>{opt.label}</strong>
                      <span>{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        loading={loading}
        title="Delete AI Meal Plan?"
        message="This will remove this template from your planner. You can always regenerate it later."
      />
    </div>
  );
}
