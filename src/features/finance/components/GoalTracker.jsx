import React, { useMemo } from 'react';
import { Target, TrendingUp, DollarSign, Edit2, Check } from 'lucide-react';
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
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempGoal, setTempGoal] = React.useState(goals.savingGoal);

  // --- LOGIC: Calculate Liquid Progress ---
  const { totalBalance, percentage } = useMemo(() => {
    const balance = transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount);
    }, 0);

    const rawPercentage = (balance / goals.savingGoal) * 100;
    return {
      totalBalance: balance,
      percentage: Math.min(Math.max(rawPercentage, 0), 100).toFixed(1)
    };
  }, [transactions, goals.savingGoal]);

  const handleSaveGoal = () => {
    setGoal(Number(tempGoal));
    setIsEditing(false);
  };

  return (
    <Card className="goal-tracker glass-panel">
      <div className="goal-tracker__header">
        <div className="goal-tracker__title">
          <Target size={18} className="goal-tracker__icon" />
          <h4>Financial Mastery Goal</h4>
        </div>
        <button className="goal-tracker__edit" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <Check size={14} onClick={handleSaveGoal} /> : <Edit2 size={14} />}
        </button>
      </div>

      <div className="goal-tracker__content">
        <div className="goal-tracker__viz">
          <svg viewBox="0 0 100 100" className="goal-tracker__svg">
            <circle className="goal-tracker__bg" cx="50" cy="50" r="45" />
            <circle 
              className="goal-tracker__progress" 
              cx="50" cy="50" r="45" 
              style={{ strokeDashoffset: 283 - (283 * percentage) / 100 }}
            />
          </svg>
          <div className="goal-tracker__percentage">
            <span className="percent-val">{percentage}%</span>
            <span className="percent-label">COMPLETE</span>
          </div>
        </div>

        <div className="goal-tracker__info">
          <div className="goal-tracker__stat">
            <span className="stat-label">Current Balance</span>
            <span className="stat-val">{currency} {totalBalance.toLocaleString()}</span>
          </div>
          
          <div className="goal-tracker__stat">
            <span className="stat-label">Master Goal</span>
            {isEditing ? (
              <input 
                type="number" 
                className="goal-tracker__input"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                autoFocus
              />
            ) : (
              <span className="stat-val goal-val">{currency} {goals.savingGoal.toLocaleString()}</span>
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
