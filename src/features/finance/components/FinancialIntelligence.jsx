import React, { useMemo } from 'react';
import { 
  Zap, 
  Shield, 
  Activity, 
  TrendingDown, 
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import useFinanceStore from '../hooks/useFinance';
import Card from '../../../components/ui/Card';
import './FinancialIntelligence.css';

/**
 * FinancialIntelligence — TIER 3 Strategic Analytics.
 * 
 * Features:
 * - Runway Calculator (Survival months).
 * - Leak Visualization (Survival vs Lifestyle).
 * - Risk Assessment based on cashflow.
 */
const FinancialIntelligence = () => {
  const { getIntelligence, currency } = useFinanceStore();
  const intel = getIntelligence() || {
    runway: 0,
    avgMonthlySpend: 0,
    survivalRatio: 0,
    lifestyleRatio: 0,
    survivalSpend: 0,
    lifestyleSpend: 0,
    monthlyIncome: 0
  };

  const pieData = [
    { name: 'Survival', value: intel.survivalSpend || 0, color: 'var(--primary)' },
    { name: 'Lifestyle', value: intel.lifestyleSpend || 0, color: 'var(--accent-secondary)' }
  ].filter(d => d.value > 0);

  const runwayStatus = useMemo(() => {
    const r = intel.runway || 0;
    if (r >= 12) return { label: 'SECURE', color: 'var(--accent-success)' };
    if (r >= 6) return { label: 'STABLE', color: 'var(--primary)' };
    if (r >= 3) return { label: 'WARNING', color: 'var(--warning)' };
    return { label: 'CRITICAL', color: 'var(--error)' };
  }, [intel.runway]);

  return (
    <div className="finance-intel">
      {/* Runway Card */}
      <Card className="intel-card runway-card glass-panel">
        <div className="intel-card__header">
          <div className="intel-card__title">
            <Clock size={18} className="intel-icon" />
            <h4 className="stats-number">Runway (Survivability)</h4>
          </div>
          <span className="status-badge" style={{ backgroundColor: `${runwayStatus.color}20`, color: runwayStatus.color }}>
            {runwayStatus.label}
          </span>
        </div>
        
        <div className="runway-display">
          <div className="runway-value-group">
            <span className="runway-number stats-number">{intel.runway || 0}</span>
            <span className="runway-unit">MONTHS</span>
          </div>
          <p className="runway-desc">
            Estimated endurance at current burn rate of <span className="stats-number">{currency} {(intel.avgMonthlySpend || 0).toLocaleString()}</span>/mo.
          </p>
        </div>

        <div className="runway-gauge">
          <div className="gauge-track">
            <div 
              className="gauge-fill" 
              style={{ 
                width: `${Math.min(((intel.runway || 0) / 12) * 100, 100)}%`,
                backgroundColor: runwayStatus.color
              }}
            ></div>
          </div>
          <div className="gauge-labels">
            <span>0m</span>
            <span>6m</span>
            <span>12m+</span>
          </div>
        </div>
      </Card>

      {/* Leak Visualization Card */}
      <Card className="intel-card leak-card glass-panel">
        <div className="intel-card__header">
          <div className="intel-card__title">
            <Activity size={18} className="intel-icon" />
            <h4 className="stats-number">Spending Architecture</h4>
          </div>
          <div className="leak-legend">
            <div className="legend-item"><span className="dot survival"></span> Survival</div>
            <div className="legend-item"><span className="dot lifestyle"></span> Lifestyle</div>
          </div>
        </div>

        <div className="leak-content">
          <div className="leak-chart">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="leak-center-text">
              <span className="stats-number">{(intel.survivalRatio || 0) + (intel.lifestyleRatio || 0)}%</span>
              <span className="label">OF INCOME</span>
            </div>
          </div>

          <div className="leak-stats">
            <div className="leak-stat-row">
              <span className="label">Survival Burn</span>
              <span className="value stats-number">{intel.survivalRatio || 0}%</span>
            </div>
            <div className="leak-stat-row">
              <span className="label">Lifestyle Leak</span>
              <span className="value stats-number" style={{ color: 'var(--accent-secondary)' }}>{intel.lifestyleRatio || 0}%</span>
            </div>
            <div className="leak-assessment">
              <Shield size={14} />
              <span>{(intel.survivalRatio || 0) > 50 ? 'High Fixed Costs Detected' : 'Operational Efficiency Optimal'}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinancialIntelligence;
