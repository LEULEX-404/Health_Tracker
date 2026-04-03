import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Calendar, Clock, LayoutList, Plus, Trash2 } from 'lucide-react';
import './NutritionComponents.css';

const UNITS = ['g', 'ml', 'cup(s)', 'slice(s)', 'bowl(s)', 'item(s)', 'tbsp', 'tsp'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ManualMealPlanModal({ isOpen, onClose, onSubmit }) {
  const blank = {
    planName: '',
    mealType: 'breakfast',
    mealName: '',
    items: [{ name: '', quantity: '', unit: 'g' }],
    scheduledDays: [0,1,2,3,4,5,6],
    scheduledTime: '08:00',
    notes: ''
  };

  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setItem = (i, key, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [key]: val };
    set('items', items);
  };
  const addItem = () => set('items', [...form.items, { name: '', quantity: '', unit: 'g' }]);
  const removeItem = (i) => set('items', form.items.filter((_, idx) => idx !== i));
  const toggleDay = (dayIdx) => {
    const days = form.scheduledDays.includes(dayIdx)
      ? form.scheduledDays.filter(d => d !== dayIdx)
      : [...form.scheduledDays, dayIdx];
    set('scheduledDays', days);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.scheduledDays.length === 0) {
      alert('Please select at least one day.');
      return;
    }
    setLoading(true);
    await onSubmit({
      ...form,
      items: form.items.filter(it => it.name.trim()).map(it => ({
        ...it,
        quantity: parseFloat(it.quantity) || 0
      }))
    });
    setLoading(false);
    onClose();
    setForm(blank);
  };

  const modalContent = (
    <div className="n-overlay" onClick={onClose}>
      <div className="n-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="n-modal-head">
          <div>
            <h2>+ Create Custom Meal Plan</h2>
            <p>Set up a recurring meal schedule to receive daily reminders.</p>
          </div>
          <button className="n-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="n-form" onSubmit={handleSubmit}>
          <div className="n-field">
            <label>Plan Name</label>
            <input 
              type="text" className="n-input" placeholder="e.g. My Morning Protein Shake"
              value={form.planName} onChange={e => set('planName', e.target.value)} required 
            />
          </div>

          <div className="n-row-fields">
            <div className="n-field wide">
              <label><LayoutList size={14} /> Meal Type</label>
              <select className="n-input" value={form.mealType} onChange={e => set('mealType', e.target.value)} required>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div className="n-field wide">
              <label><Clock size={14} /> Scheduled Time</label>
              <input type="time" className="n-input" value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)} required />
            </div>
          </div>

          <div className="n-field">
            <label><Calendar size={14} /> Active Days</label>
            <div className="n-days-selector">
              {DAYS.map((day, i) => (
                <button
                  key={day} type="button"
                  className={`n-day-btn ${form.scheduledDays.includes(i) ? 'active' : ''}`}
                  onClick={() => toggleDay(i)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="n-field">
            <label>Food Items</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.items.map((it, i) => (
                <div key={i} className="n-item-row">
                  <input
                    type="text" className="n-input name" placeholder="Food Name"
                    value={it.name} onChange={e => setItem(i, 'name', e.target.value)}
                  />
                  <input
                    type="number" className="n-input qty" placeholder="Qty"
                    value={it.quantity} min="0" step="0.1"
                    onChange={e => setItem(i, 'quantity', e.target.value)}
                  />
                  <select className="n-input unit" value={it.unit} onChange={e => setItem(i, 'unit', e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  {form.items.length > 1 && (
                    <button type="button" className="n-item-remove" onClick={() => removeItem(i)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="n-add-item-btn" onClick={addItem}>
                <Plus size={14} /> Add another item
              </button>
            </div>
          </div>

          <div className="n-modal-foot">
            <button type="button" className="n-btn n-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="n-btn n-btn-primary" disabled={loading}>
              <Save size={15} /> Save Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
