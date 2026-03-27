import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, X } from 'lucide-react';
import './NutritionComponents.css';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="n-overlay" onClick={onClose}>
        <motion.div 
          className="n-modal n-confirm-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="n-confirm-head">
            <div className="n-confirm-icon"><AlertCircle size={32} /></div>
            <button className="n-modal-close" onClick={onClose}><X size={20} /></button>
          </div>
          
          <div className="n-confirm-body">
            <h3>{title || 'Are you sure?'}</h3>
            <p>{message || 'This action cannot be undone.'}</p>
          </div>

          <div className="n-confirm-actions">
            <button 
              className="n-btn n-btn-ghost" 
              onClick={onClose}
              disabled={loading}
            >
              No, Keep it
            </button>
            <button 
              className="n-btn n-btn-danger" 
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <div className="n-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              ) : (
                <><Trash2 size={16} /> Yes, Delete</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
