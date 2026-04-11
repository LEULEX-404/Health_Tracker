import React from 'react';
import { Plus, Edit2, Trash2, Coffee, Sunset, Moon, Clock, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import './NutritionComponents.css';

const TYPE_ICONS = {
  breakfast: Coffee,
  lunch:     Sunset,
  dinner:    Moon,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function MealLogTable({ meals, loading, onAddClick, onEditClick, onDeleteClick, onCheckClick }) {
  if (loading) {
    return (
      <div className="n-card">
        <div className="n-loader">
          <div className="n-spinner" />
          <span>Loading your meal logs…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="n-card n-log">
      <div className="n-log-header">
        <div>
          <h3 className="n-log-title">Your Meal Logs</h3>
          <p className="n-log-sub">Records contributing to your nutrition analysis</p>
        </div>
        <div className="n-log-actions">
          {onCheckClick && (
            <button className="n-btn n-btn-outline" onClick={onCheckClick}>
              <Search size={15} /> Check Foods
            </button>
          )}
          <button className="n-btn n-btn-primary" onClick={onAddClick}>
            <Plus size={15} /> Add Standalone Log
          </button>
        </div>
      </div>

      {!meals?.length ? (
        <div className="n-empty">
          <div className="n-empty-icon"><Clock size={52} /></div>
          <p>No meals logged yet. Add your first meal to begin tracking!</p>
        </div>
      ) : (
        <div className="n-table-wrap">
          {/* Desktop Table View */}
          <table className="n-table">
            <thead>
              <tr>
                <th>Meal</th>
                <th>Type</th>
                <th>Calories</th>
                <th>Macros (P / C / F)</th>
                <th>Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {meals.map(meal => {
                const Icon = TYPE_ICONS[meal.mealType] || Clock;
                const p = Math.round(meal.totalProtein || 0);
                const c = Math.round(meal.totalCarbohydrates || 0);
                const f = Math.round(meal.totalFat || 0);
                const total = (p + c + f) || 1;

                return (
                  <motion.tr key={meal._id} variants={itemVariants}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="n-meal-name">{meal.mealName}</div>
                        {meal.mealReminderId && <Bell size={12} title="From Reminder" style={{ color: '#F59E0B', opacity: 0.8 }} />}
                      </div>
                      {meal.notes && <div className="n-meal-note">{meal.notes}</div>}
                    </td>
                    <td>
                      <span className="n-type-chip">
                        <Icon size={13} /> {meal.mealType}
                      </span>
                    </td>
                    <td>
                      <span className="n-kcal-chip">{Math.round(meal.totalCalories || 0)} kcal</span>
                    </td>
                    <td>
                      <div className="n-macro-bars">
                        <div className="n-macro-line"><div className="n-macro-fill n-mf-p" style={{ '--percent': `${(p/total)*100}%` }} /></div>
                        <div className="n-macro-line"><div className="n-macro-fill n-mf-c" style={{ '--percent': `${(c/total)*100}%` }} /></div>
                        <div className="n-macro-line"><div className="n-macro-fill n-mf-f" style={{ '--percent': `${(f/total)*100}%` }} /></div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--n-muted)', fontSize: '0.85rem' }}>
                      {new Date(meal.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div className="n-row-actions">
                        <button className="n-icon-btn" onClick={() => onEditClick(meal)} title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button className="n-icon-btn del-premium" onClick={() => onDeleteClick(meal._id)} title="Delete Log">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>

          {/* Mobile Card View */}
          <motion.div 
            className="n-mobile-cards"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {meals.map(meal => {
              const Icon = TYPE_ICONS[meal.mealType] || Clock;
              return (
                <motion.div key={meal._id} className="n-m-card" variants={itemVariants}>
                  <div className="n-m-card-header">
                    <div>
                      <div className="n-m-card-title">{meal.mealName}</div>
                      <span className="n-type-chip" style={{ marginTop: 6 }}>
                        <Icon size={12} /> {meal.mealType}
                      </span>
                    </div>
                    <div className="n-m-card-time">
                      {new Date(meal.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div className="n-m-card-body">
                    <div className="n-m-card-macros">
                      <div className="n-m-macro-item">
                        <span className="n-m-macro-val" style={{ color: 'var(--n-blue)' }}>{Math.round(meal.totalProtein || 0)}g</span>
                        <span className="n-m-macro-label">P</span>
                      </div>
                      <div className="n-m-macro-item">
                        <span className="n-m-macro-val" style={{ color: 'var(--n-green)' }}>{Math.round(meal.totalCarbohydrates || 0)}g</span>
                        <span className="n-m-macro-label">C</span>
                      </div>
                      <div className="n-m-macro-item">
                        <span className="n-m-macro-val" style={{ color: 'var(--n-orange)' }}>{Math.round(meal.totalFat || 0)}g</span>
                        <span className="n-m-macro-label">F</span>
                      </div>
                    </div>
                    <div className="n-m-card-actions">
                      <button className="n-icon-btn" onClick={() => onEditClick(meal)}><Edit2 size={14}/></button>
                      <button className="n-icon-btn del-premium" onClick={() => onDeleteClick(meal._id)}><Trash2 size={15}/></button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
}
