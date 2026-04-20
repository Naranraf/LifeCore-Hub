/**
 * Health Page — Stub for the Health & Diet module.
 * Will include calorie tracker and exercise routines
 * based on standardized food/exercise databases.
 */
import React from 'react';
import { HeartPulse, Plus, Apple, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Health() {
  return (
    <div className="feature-page">
      <header className="feature-page__header">
        <div className="feature-page__icon" style={{ background: 'var(--glass-border)', color: 'var(--success)' }}>
          <HeartPulse size={24} />
        </div>
        <div>
          <h1 className="feature-page__title">Health & Diet</h1>
          <p className="feature-page__desc">Track calories, meals, and workout routines.</p>
        </div>
      </header>

      <div className="feature-page__empty glass-panel">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', padding: '60px 20px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            <Apple size={32} style={{ color: 'var(--success)' }} />
            <Dumbbell size={32} style={{ color: 'var(--accent-secondary)' }} />
          </div>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>No health data yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Log your meals and exercises to start optimizing.
          </p>
          <button className="feature-page__cta" id="btn-add-healthlog">
            <Plus size={18} />
            <span>Log a Meal</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
