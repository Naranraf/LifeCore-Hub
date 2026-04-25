import React, { useMemo, useEffect, useState } from 'react';
import { Target, TrendingUp, DollarSign, Edit2, Check, X } from 'lucide-react';
import useFinanceStore from '../hooks/useFinance';
import Card from '../../../components/ui/Card';
import './GoalTracker.css';

/**
 * GoalTracker Widget — TIER 3 Financial Telemetry.
 * 
 * Features:
 * - Dynamic calculation of progress based on total balance.
 * - Editable master goal (Master Saving Goal).
 * - Premium circular-style progress visualization.
 */
const GoalTracker = () => {
  const { transactions, goals, currency, setGoal } = useFinanceStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goals.savingGoal);

  // Sync tempGoal with store value when it changes (e.g. after cloud fetch)
  useEffect(() => {
    setTempGoal(goals.savingGoal);
  }, [goals.savingGoal]);

  // --- LOGIC: Calculate Liquid Progress ---
  const { totalBalance, percentage } = useMemo(() => {
    const balance = transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount);
    }, 0);

    const goal = goals.savingGoal || 1; // Prevent division by zero
    const rawPercentage = (balance / goal) * 100;
    
    return {
      totalBalance: balance,
      percentage: Math.min(Math.max(rawPercentage, 0), 100).toFixed(1)
    };
  }, [transactions, goals.savingGoal]);

  const handleSaveGoal = () => {
    const numericGoal = Number(tempGoal);
    if (!isNaN(numericGoal) && numericGoal >= 0) {
      setGoal(numericGoal);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempGoal(goals.savingGoal);
    setIsEditing(false);
  };

  return (
    <Card className="goal-tracker glass-panel">
      <div className="goal-tracker__header">
        <div className="goal-tracker__title">
          <Target size={18} className="goal-tracker__icon" />
          <h4 className="stats-number">Financial Mastery Goal</h4>
        </div>
        <div className="goal-tracker__actions">
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="goal-tracker__btn cancel" onClick={handleCancel} title="Cancel">
                <X size={14} />
              </button>
              <button className="goal-tracker__btn save" onClick={handleSaveGoal} title="Save Goal">
                <Check size={14} />
              </button>
            </div>
          ) : (
            <button className="goal-tracker__btn edit" onClick={() => setIsEditing(true)} title="Edit Goal">
              <Edit2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="goal-tracker__content">
        <div className="goal-tracker__viz">
          <svg viewBox="0 0 100 100" className="goal-tracker__svg">
            <circle className="goal-tracker__bg" cx="50" cy="50" r="45" />
            <circle 
              className="goal-tracker__progress" 
              cx="50" cy="50" r="45" 
              style={{ 
                strokeDashoffset: 283 - (283 * Number(percentage)) / 100,
                stroke: percentage >= 100 ? 'var(--accent-success)' : 'var(--primary)'
              }}
            />
          </svg>
          <div className="goal-tracker__percentage">
            <span className="percent-val stats-number">{percentage}%</span>
            <span className="percent-label">COMPLETE</span>
          </div>
        </div>

        <div className="goal-tracker__info">
          <div className="goal-tracker__stat">
            <span className="stat-label">Current Balance</span>
            <span className="stat-val stats-number" style={{ color: totalBalance >= 0 ? 'var(--accent-success)' : 'var(--error)' }}>
              {currency} {totalBalance.toLocaleString()}
            </span>
          </div>
          
          <div className="goal-tracker__stat">
            <span className="stat-label">Master Saving Goal</span>
            {isEditing ? (
              <div className="goal-input-container">
                <span className="currency-prefix">{currency}</span>
                <input 
                  type="number" 
                  className="goal-tracker__input stats-number"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                  autoFocus
                />
              </div>
            ) : (
              <span className="stat-val goal-val stats-number" onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
                {currency} {goals.savingGoal.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="goal-tracker__footer">
        <TrendingUp size={12} />
        <span>Liquidity tracked via Dynamic Ledger V2</span>
      </div>
    </Card>
  );
};

export default GoalTracker;
