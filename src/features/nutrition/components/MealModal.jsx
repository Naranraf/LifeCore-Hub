/**
 * MealModal Component — Health data entry interface.
 * 
 * Purpose: Allows users to log meals, exercises, and water intake.
 * Features:
 * - Dynamic form fields based on log type (e.g., macros for meals).
 * - Animated glass-panel overlay via Framer Motion.
 */
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MealModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'meal', // meal, exercise, water
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
    });
    setFormData({
      name: '', type: 'meal', calories: '', protein: '', carbs: '', fat: '', date: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div
            id="modal-health-log"
            className="modal-content glass-panel"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="modal-header">
              <h3>Log Health Data</h3>
              <button onClick={onClose} className="modal-close"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Type</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="lyfe-select"
                >
                  <option value="meal">Meal</option>
                  <option value="exercise">Exercise</option>
                  <option value="water">Water</option>
                </select>
              </div>

              <div className="form-group">
                <label>Name / Description</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="modal-input" 
                  placeholder="e.g. Chicken Salad"
                  required
                />
              </div>

              <div className="form-group">
                <label>{formData.type === 'exercise' ? 'Calories Burned' : 'Calories'}</label>
                <input 
                  type="number" 
                  value={formData.calories} 
                  onChange={e => setFormData({...formData, calories: e.target.value})}
                  onFocus={(e) => e.target.select()}
                  className="modal-input" 
                  required
                />
              </div>

              {formData.type === 'meal' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input type="number" value={formData.protein} onChange={e => setFormData({...formData, protein: e.target.value})} onFocus={(e) => e.target.select()} className="modal-input" />
                  </div>
                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input type="number" value={formData.carbs} onChange={e => setFormData({...formData, carbs: e.target.value})} onFocus={(e) => e.target.select()} className="modal-input" />
                  </div>
                  <div className="form-group">
                    <label>Fat (g)</label>
                    <input type="number" value={formData.fat} onChange={e => setFormData({...formData, fat: e.target.value})} onFocus={(e) => e.target.select()} className="modal-input" />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="modal-input" 
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Log</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
