/**
 * Health Page — Nutrition and Physical Activity Tracker
 * 
 * Purpose: Centralizes meal logging, macro calculation, and exercise tracking.
 * Features:
 * - Real-time macro visualization (Donut Chart).
 * - Calorie intake vs. expenditure tracking.
 * - Integration with Firestore for persistent health logs.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { HeartPulse, Plus, Apple, Dumbbell, Droplets, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useHealthStore from './hooks/useHealth';
import MealModal from './components/MealModal';
import MacroRing from './components/MacroRing';
import './Health.css';

export default function Health() {
  const { logs, loading, initListener, addLog, deleteLog, cleanup } = useHealthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    initListener();
    return () => cleanup();
  }, [initListener, cleanup]);

  const { totalCalories, totalProtein, totalCarbs, totalFat } = useMemo(() => {
    let cal = 0, p = 0, c = 0, f = 0;
    logs.forEach(log => {
      if (log.type === 'meal') {
        cal += log.calories || 0;
        p += log.protein || 0;
        c += log.carbs || 0;
        f += log.fat || 0;
      }
      if (log.type === 'exercise') {
        // Typically subtracts from net calories or tracked separately, we'll keep simple total intake vs burned
        // For this summary, we'll just sum consumed. We could separate burned.
      }
    });
    return { totalCalories: cal, totalProtein: p, totalCarbs: c, totalFat: f };
  }, [logs]);

  const handleAddLog = async (data) => {
    await addLog(data);
  };

  const currentDisplayDate = new Intl.DateTimeFormat(navigator.language, { dateStyle: 'medium' }).format(new Date());

  return (
    <div id="page-health" className="feature-page health-page">
      <header className="feature-page__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="feature-page__icon" style={{ background: 'var(--glass-border)', color: 'var(--success)' }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="feature-page__title">Health & Diet</h1>
            <p className="feature-page__desc">Track calories, meals, and workout routines. ({currentDisplayDate})</p>
          </div>
        </div>
        <button
          className="health-page__add-btn"
          onClick={() => setIsModalOpen(true)}
          id="btn-add-healthlog"
        >
          <Plus size={18} />
          <span>Log Activity</span>
        </button>
      </header>

      {/* Summary Cards */}
      <div className="health-page__summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="finance-page__stat glass-panel">
          <span className="finance-page__stat-label">Consumed Calories</span>
          <span className="finance-page__stat-value" style={{ color: 'var(--warning)' }}>
            {totalCalories} kcal
          </span>
        </div>
        <div className="finance-page__stat glass-panel">
          <span className="finance-page__stat-label">Macros (P/C/F)</span>
          <span className="finance-page__stat-value" style={{ color: 'var(--text-main)', fontSize: '18px' }}>
            {totalProtein}g / {totalCarbs}g / {totalFat}g
          </span>
        </div>
      </div>

      {/* Macro Donut Chart */}
      {(totalProtein > 0 || totalCarbs > 0 || totalFat > 0) && (
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <MacroRing protein={totalProtein} carbs={totalCarbs} fat={totalFat} />
        </div>
      )}

      {loading && logs.length === 0 ? (
        <div className="loading-screen" style={{ minHeight: '300px' }}>
          <div className="loading-spinner" />
        </div>
      ) : logs.length === 0 ? (
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
            <button className="feature-page__cta" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>Log a Meal</span>
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="health-page__list glass-panel">
          <div className="finance-page__list-header">
            <h3>Recent Logs</h3>
          </div>
          <div className="finance-page__items">
            {logs.map(log => {
              const dateDisplay = new Intl.DateTimeFormat(navigator.language, { dateStyle: 'medium' }).format(new Date(log.date || log.createdAt));
              return (
                <div key={log.id} className="finance-page__item">
                  <div className="finance-page__item-icon" style={{
                    background: 'var(--glass-border)',
                    color: log.type === 'exercise' ? 'var(--accent-secondary)' : log.type === 'water' ? 'var(--info)' : 'var(--success)',
                  }}>
                    {log.type === 'exercise' ? <Dumbbell size={18} /> : log.type === 'water' ? <Droplets size={18} /> : <Apple size={18} />}
                  </div>
                  <div className="finance-page__item-info">
                    <span className="finance-page__item-cat">{log.name}</span>
                    <span className="finance-page__item-date">{dateDisplay} · {log.type.toUpperCase()}</span>
                  </div>
                  <div className="finance-page__item-amount" style={{ color: log.type === 'exercise' ? 'var(--accent-secondary)' : 'var(--warning)' }}>
                    {log.type === 'exercise' ? '-' : '+'}{log.calories} kcal
                  </div>
                  <button
                    className="finance-page__item-del"
                    onClick={() => deleteLog(log.id)}
                    title="Delete Log"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <MealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddLog}
      />
    </div>
  );
}
