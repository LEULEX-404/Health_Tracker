import React, { useState } from 'react';
import { X, Search, Trash2, Plus, Flame } from 'lucide-react';
import { checkNutrition } from '../../../services/Tharuka/nutritionService';
import toast from 'react-hot-toast';
import './NutritionComponents.css';

const UNITS = ['g', 'ml', 'cup(s)', 'slice(s)', 'bowl(s)', 'item(s)', 'tbsp', 'tsp'];

export default function NutritionCheckModal({ isOpen, onClose }) {
  const [items,   setItems]   = useState([{ name: '', quantity: '', unit: 'g' }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const setItem = (i, key, val) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [key]: val };
    setItems(copy);
  };
  const addItem    = () => setItems(p => [...p, { name: '', quantity: '', unit: 'g' }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));

  const handleCheck = async (e) => {
    e.preventDefault();
    const valid = items.filter(it => it.name.trim() && it.quantity > 0);
    if (!valid.length) { toast.error('Add at least one food item with a quantity.'); return; }

    setLoading(true);
    setResults(null);
    try {
      const res = await checkNutrition(valid.map(it => ({
        name:     it.name.trim(),
        quantity: parseFloat(it.quantity) || 0,
        unit:     it.unit,
      })));
      setResults(res.data);
    } catch (err) {
      toast.error(err.message || 'Could not fetch nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const totals = results?.reduce((acc, r) => {
    acc.calories      += r.calories      || 0;
    acc.protein       += r.protein       || 0;
    acc.carbohydrates += r.carbohydrates || 0;
    acc.fat           += r.fat           || 0;
    return acc;
  }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0 });

  return (
    <div className="n-overlay" onClick={onClose}>
      <div className="n-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="n-modal-head">
          <div>
            <h2><Search size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />Check Food Nutrition</h2>
            <p>Enter any food items below to instantly get a nutritional breakdown — no logging required.</p>
          </div>
          <button className="n-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="n-form" onSubmit={handleCheck}>
          {/* Items */}
          <div className="n-field">
            <label>Food Items</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((it, i) => (
                <div key={i} className="n-item-row">
                  <input
                    type="text" className="n-input name"
                    placeholder="Food name (e.g. Chicken)"
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
                  {items.length > 1 && (
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

          {/* Results */}
          {results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="n-result-list">
                {results.map((r, i) => (
                  <div key={i} className="n-result-item">
                    <div className="n-result-name">{r.name || items[i]?.name}</div>
                    <div className="n-result-chips">
                      <span className="n-result-chip kcal"><Flame size={11} /> {Math.round(r.calories || 0)} kcal</span>
                      <span className="n-result-chip pro">P: {Math.round(r.protein || 0)}g</span>
                      <span className="n-result-chip carb">C: {Math.round(r.carbohydrates || 0)}g</span>
                      <span className="n-result-chip fat">F: {Math.round(r.fat || 0)}g</span>
                    </div>
                  </div>
                ))}
              </div>
              {totals && (
                <div className="n-result-total">
                  <h5>Total Nutritional Summary</h5>
                  <div className="n-result-total-chips">
                    <div className="n-result-total-chip"><span>Calories</span>{Math.round(totals.calories)} kcal</div>
                    <div className="n-result-total-chip"><span>Protein</span>{Math.round(totals.protein)}g</div>
                    <div className="n-result-total-chip"><span>Carbs</span>{Math.round(totals.carbohydrates)}g</div>
                    <div className="n-result-total-chip"><span>Fat</span>{Math.round(totals.fat)}g</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="n-modal-foot">
            <button type="button" className="n-btn n-btn-ghost" onClick={onClose}>Close</button>
            <button type="submit" className="n-btn n-btn-primary" disabled={loading}>
              {loading
                ? <><div className="n-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Checking…</>
                : <><Search size={15} /> Check Nutrition</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
