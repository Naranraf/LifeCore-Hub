/**
 * TransactionModal Component — Data entry for financial records.
 * 
 * Purpose: Provides a secure, validated form to log income and expenses.
 * UI: Uses Framer Motion for glass-panel animations and Zod for schema validation.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { transactionSchema, CATEGORIES } from '../schemas';
import './TransactionModal.css';

export default function TransactionModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: CATEGORIES.expense[0], // default to first valid
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCategoryText = (str) => {
    return str.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: CATEGORIES[newType][0], // Auto-switch to valid category
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    const result = transactionSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave(result.data);
      setFormData({
        type: 'expense',
        amount: '',
        category: CATEGORIES.expense[0],
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="txn-modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            id="modal-transaction"
            className="txn-modal glass-panel"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="txn-modal__header">
              <h2>Add Transaction</h2>
              <button onClick={onClose} className="txn-modal__close">
                <X size={20} />
              </button>
            </div>

            {errors.form && <div className="txn-modal__error">{errors.form}</div>}

            <form onSubmit={handleSubmit} className="txn-modal__form">
              {/* Type Toggle */}
              <div className="txn-modal__type-toggle">
                <button
                  type="button"
                  className={`txn-modal__type-btn ${formData.type === 'expense' ? 'txn-modal__type-btn--expense' : ''}`}
                  onClick={() => handleTypeChange('expense')}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={`txn-modal__type-btn ${formData.type === 'income' ? 'txn-modal__type-btn--income' : ''}`}
                  onClick={() => handleTypeChange('income')}
                >
                  Income
                </button>
              </div>

              {/* Amount */}
              <div className="txn-modal__field">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  className={errors.amount ? 'error-input' : ''}
                />
                {errors.amount && <span className="field-error">{errors.amount}</span>}
              </div>

              <div className="txn-modal__row">
                {/* Category */}
                <div className="txn-modal__field">
                  <label>Category</label>
                  <select
                    className="lyfe-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES[formData.type].map(cat => (
                      <option key={cat} value={cat}>
                        {formatCategoryText(cat)}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="field-error">{errors.category}</span>}
                </div>

                {/* Date */}
                <div className="txn-modal__field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                  {errors.date && <span className="field-error">{errors.date}</span>}
                </div>
              </div>

              {/* Description */}
              <div className="txn-modal__field">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={255}
                />
              </div>

              <button type="submit" className="txn-modal__submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
