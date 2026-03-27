import React, { useState, useEffect } from 'react';
import { X, Save, Clock, LayoutList, Plus, Trash2 } from 'lucide-react';
import './NutritionComponents.css';

const UNITS = ['g', 'ml', 'cup(s)', 'slice(s)', 'bowl(s)', 'item(s)', 'tbsp', 'tsp'];

export default function MealFormModal({ isOpen, onClose, onSubmit, initialData, isSimple = false }) {
  const blank = { mealType: 'breakfast', mealName: '', items: [{ name: '', quantity: '', unit: 'g' }], notes: '', recordedAt: new Date().toISOString().slice(0, 16) };

  const [form, setForm]       = useState(blank);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setForm({
        mealType:    initialData.mealType    || 'breakfast',
        mealName:    initialData.mealName    || '',
        items:       initialData.items?.length
          ? initialData.items.map(i => ({ name: i.name || '', quantity: i.quantity || '', unit: i.unit || 'g' }))
          : [{ name: '', quantity: '', unit: 'g' }],
        notes:       initialData.notes       || '',
        mealReminderId: initialData.mealReminderId || null,
        recordedAt:  initialData.recordedAt
          ? new Date(initialData.recordedAt).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
      });
    } else {
      setForm(blank);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setItem = (i, key, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [key]: val };
    set('items', items);
  };
  const addItem    = () => set('items', [...form.items, { name: '', quantity: '', unit: 'g' }]);
  const removeItem = (i) => set('items', form.items.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      ...form,
      mealName: form.mealName || (isSimple ? 'Standalone Log' : ''),
      useApiForNutrition: true, // Force backend to calculate calories and macros for these items
      items: form.items
        .filter(it => it.name.trim())
        .map(it => ({ ...it, quantity: parseFloat(it.quantity) || 0 })),
    });
    setLoading(false);
  };

  return (
    <div className="n-overlay">
      <div className="n-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="n-modal-head">
          <div>
            <h2>{initialData ? 'Edit Meal Log' : (isSimple ? '+ Quick Standalone Log' : '+ Add Meal Log')}</h2>
            <p>{isSimple ? 'Log items and quantities for standalone tracking.' : 'Our AI will automatically fetch the nutrition values for each item you enter.'}</p>
          </div>
          <button className="n-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Form */}
        <form className="n-form" onSubmit={handleSubmit}>
          {/* Row: type + time (Time hidden in simple mode) */}
          <div className="n-row-fields">
            <div className={`n-field ${isSimple ? '' : 'wide'}`}>
              <label><LayoutList size={14} /> Meal Type</label>
              <select className="n-input" value={form.mealType} onChange={e => set('mealType', e.target.value)} required>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            {!isSimple && (
              <div className="n-field wide">
                <label><Clock size={14} /> Date &amp; Time</label>
                <input type="datetime-local" className="n-input" value={form.recordedAt} onChange={e => set('recordedAt', e.target.value)} required />
              </div>
            )}
          </div>

          {/* Meal name - Always shown now */}
          <div className="n-field">
            <label>Meal Name / Description</label>
            <input
              type="text" className="n-input"
              placeholder="e.g. Healthy Chicken Salad"
              value={form.mealName}
              onChange={e => set('mealName', e.target.value)}
              required
            />
          </div>

          {/* Food items */}
          <div className="n-field">
            <label>Food Items</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.items.map((it, i) => (
                <div key={i} className="n-item-row">
                  <input
                    type="text" className="n-input name"
                    placeholder="Food Name (e.g. Rice)"
                    value={it.name}
                    onChange={e => setItem(i, 'name', e.target.value)}
                  />
                  <input
                    type="number" className="n-input qty"
                    placeholder="Qty"
                    value={it.quantity}
                    min="0" step="0.1"
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

          {/* Notes */}
          {!isSimple && (
            <div className="n-field">
              <label>Notes (Optional)</label>
              <input
                type="text" className="n-input"
                placeholder="e.g. Felt very energetic after this meal"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>
          )}

          {/* Footer */}
          <div className="n-modal-foot">
            <button type="button" className="n-btn n-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="n-btn n-btn-primary" disabled={loading}>
              {loading ? <><div className="n-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : <><Save size={15} /> Save Log</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
