import React from 'react';
import { Target, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import useFinanceStore from '../hooks/useFinance';
import Card from '../../../components/ui/Card';
import './WealthTracker.css';

const WealthTracker = () => {
  const { getTelemetry, currency } = useFinanceStore();
  const telemetry = getTelemetry();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency || 'USD' 
    }).format(amount);
  };

  return (
    <Card className="wealth-tracker glass-panel">
      <div className="wealth-tracker__header">
        <div className="wealth-tracker__title">
          <Activity size={18} className="wealth-tracker__icon" />
          <h4>Financial Telemetry</h4>
        </div>
        <span className="wealth-tracker__status">Sovereign Active</span>
      </div>

      <div className="wealth-tracker__content">
        <div className="wealth-tracker__goal-section">
          <div className="wealth-tracker__goal-info">
            <span className="wealth-tracker__label">Master Saving Goal</span>
            {telemetry.savingGoal > 0 ? (
              <span className="wealth-tracker__value stats-number">
                {formatCurrency(telemetry.savingGoal)}
              </span>
            ) : (
              <div className="wealth-tracker__no-goal">
                <AlertCircle size={14} />
                <span>Goal not configured</span>
              </div>
            )}
          </div>
          
          <div className="wealth-tracker__progress-container">
            <div className="wealth-tracker__progress-bar">
              <div 
                className="wealth-tracker__progress-fill" 
                style={{ width: `${telemetry.progress}%` }}
              />
            </div>
            <div className="wealth-tracker__progress-meta">
              <span className="wealth-tracker__progress-text stats-number">
                {telemetry.progress.toFixed(1)}%
              </span>
              <span className="wealth-tracker__progress-label">TOWARDS GOAL</span>
            </div>
          </div>
        </div>

        <div className="wealth-tracker__stats-grid">
          <div className="wealth-tracker__stat">
            <div className="wealth-tracker__stat-header">
              <TrendingUp size={14} className="text-success" />
              <span className="wealth-tracker__label">Net Balance</span>
            </div>
            <span className={`wealth-tracker__stat-value stats-number ${telemetry.netBalance >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(telemetry.netBalance)}
            </span>
          </div>

          <div className="wealth-tracker__stat">
            <div className="wealth-tracker__stat-header">
              <Activity size={14} style={{ color: 'var(--primary)' }} />
              <span className="wealth-tracker__label">Monthly Cashflow</span>
            </div>
            <span className={`wealth-tracker__stat-value stats-number ${telemetry.monthlyCashflow >= 0 ? 'text-success' : 'text-error'}`}>
              {telemetry.monthlyCashflow >= 0 ? '+' : ''}{formatCurrency(telemetry.monthlyCashflow)}
            </span>
          </div>
        </div>
      </div>

      <div className="wealth-tracker__footer">
        <Target size={12} />
        <span>Telemetry precision: High-Fidelity Ledger</span>
      </div>
    </Card>
  );
};

export default WealthTracker;
