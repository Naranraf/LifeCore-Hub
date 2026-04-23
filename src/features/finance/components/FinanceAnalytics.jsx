import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend, Bar, Cell
} from 'recharts';
import { TrendingUp, Calendar, Filter, Table, Edit3, Save } from 'lucide-react';
import useFinanceStore from '../hooks/useFinance';
import Card from '../../../components/ui/Card';
import './FinanceAnalytics.css';

/**
 * FinanceAnalytics Component — TIER 2 Dynamic Ledger.
 * 
 * Features:
 * - Technical Charting (SMA).
 * - Excel-style Dynamic Ledger with contentEditable.
 * - Auto-summation and Debounced Cloud Sync.
 */
const FinanceAnalytics = () => {
  const { transactions, currency, updateTransaction } = useFinanceStore();
  const [timeframe, setTimeframe] = useState('day');
  const [smaWindow, setSmaWindow] = useState(5);
  
  // Local state for debounced updates to prevent excessive Firestore writes
  const [localAmounts, setLocalAmounts] = useState({});
  const debounceTimer = useRef(null);

  // --- LOGIC: Technical Chart Data (SMA + MACD) ---
  const chartData = useMemo(() => {
    if (!transactions.length) return [];
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const groups = {};
    expenses.forEach(t => {
      const date = new Date(t.date);
      let key;
      if (timeframe === 'day') key = date.toISOString().split('T')[0];
      else if (timeframe === 'week') {
        const firstDay = new Date(date.setDate(date.getDate() - date.getDay()));
        key = `W${firstDay.toISOString().split('T')[0]}`;
      } else key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const amount = localAmounts[t.id] !== undefined ? localAmounts[t.id] : Number(t.amount);
      groups[key] = (groups[key] || 0) + amount;
    });

    const sortedGroups = Object.entries(groups).map(([date, amount]) => ({ date, amount }));
    
    // Helper: Calculate EMA with safety check
    const calculateEMA = (data, period) => {
      if (!data || data.length === 0) return [];
      const k = 2 / (period + 1);
      let emaArr = [];
      let prevEma = data[0]?.amount || 0;
      
      data.forEach((d, i) => {
        const currentEma = i === 0 ? prevEma : (d.amount * k) + (prevEma * (1 - k));
        emaArr.push(currentEma);
        prevEma = currentEma;
      });
      return emaArr;
    };

    const ema12 = calculateEMA(sortedGroups, 12);
    const ema26 = calculateEMA(sortedGroups, 26);

    // Final mapping with SMA and MACD
    const result = sortedGroups.map((entry, idx, arr) => {
      // SMA
      let sma = null;
      if (idx >= smaWindow - 1) {
        const windowSlice = arr.slice(idx - smaWindow + 1, idx + 1);
        const sum = windowSlice.reduce((acc, curr) => acc + curr.amount, 0);
        sma = Number((sum / smaWindow).toFixed(2));
      }

      // MACD Line: EMA(12) - EMA(26)
      const macd12 = ema12[idx] || 0;
      const macd26 = ema26[idx] || 0;
      const macdLine = Number((macd12 - macd26).toFixed(2));
      return { ...entry, sma, macdLine };
    });

    // Signal Line: EMA(9) of MACD Line with safety check
    if (result.length === 0) return [];
    const k9 = 2 / (9 + 1);
    let prevSignal = result[0]?.macdLine || 0;
    return result.map((entry, idx) => {
      const signalLine = idx === 0 ? prevSignal : Number(((entry.macdLine * k9) + (prevSignal * (1 - k9))).toFixed(2));
      prevSignal = signalLine;
      const histogram = Number((entry.macdLine - signalLine).toFixed(2));
      return { ...entry, signalLine, histogram };
    });
  }, [transactions, timeframe, smaWindow, localAmounts]);

  // --- LOGIC: Dynamic Ledger Actions ---
  const handleEditAmount = (id, newVal) => {
    const amount = parseFloat(newVal);
    if (isNaN(amount)) return;

    // 1. Update local state for instant UI feedback (Autosuma)
    setLocalAmounts(prev => ({ ...prev, [id]: amount }));

    // 2. Debounce Firestore update
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateTransaction(id, { amount });
      console.log(`[Ledger] Debounced sync for transaction ${id}`);
    }, 1500);
  };

  const totalLedgerAmount = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + (localAmounts[t.id] !== undefined ? localAmounts[t.id] : Number(t.amount)), 0);
  }, [transactions, localAmounts]);

  return (
    <Card className="finance-analytics">
      <div className="analytics__header">
        <div className="analytics__title">
          <TrendingUp size={20} className="analytics__icon" />
          <h3>Technical Spend Analysis</h3>
        </div>
        <div className="analytics__controls">
          <div className="analytics__timeframe-btns">
            {['day', 'week', 'month'].map(tf => (
              <button key={tf} className={`analytics__tf-btn ${timeframe === tf ? 'active' : ''}`} onClick={() => setTimeframe(tf)}>
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics__chart-container">
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'white' }} />
                
                <Area name="Trend Fill" type="monotone" dataKey="amount" stroke="none" fillOpacity={1} fill="url(#colorAmount)" />
                <Bar name="Actual Spend" dataKey="amount" barSize={20} fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Line name={`SMA (${smaWindow})`} type="monotone" dataKey="sma" stroke="var(--accent-secondary)" strokeWidth={3} dot={false} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>

            {/* --- MACD INDICATOR PANE --- */}
            <div style={{ height: '120px', marginTop: '10px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                <ComposedChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} hide />
                  <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'white' }} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={20} 
                    iconSize={8} 
                    wrapperStyle={{ fontSize: '10px' }} 
                    formatter={(value) => <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{value}</span>}
                  />
                  
                  <Bar name="MACD Histogram" dataKey="histogram" barSize={8}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.histogram >= 0 ? 'var(--success)' : 'var(--error)'} opacity={0.6} />
                    ))}
                  </Bar>
                  <Line name="MACD" type="monotone" dataKey="macdLine" stroke="var(--accent)" strokeWidth={1.5} dot={false} />
                  <Line name="Signal" type="monotone" dataKey="signalLine" stroke="var(--warning)" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="analytics__empty"><p>Add more expenses for technical analysis.</p></div>
        )}
      </div>

      {/* --- TIER 2: DYNAMIC LEDGER TABLE --- */}
      <div className="analytics__ledger" style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700' }}>
            <Table size={16} /> Dynamic Ledger (Excel Style)
          </h4>
          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent)' }}>
            Autosuma Total: {currency} {totalLedgerAmount.toFixed(2)}
          </div>
        </div>
        
        <div className="ledger__table-wrapper" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Amount ({currency})</th>
              </tr>
            </thead>
            <tbody>
              {transactions.filter(t => t.type === 'expense').slice(0, 10).map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--glass-border)', fontSize: '11px' }}>{t.category}</span></td>
                  <td style={{ padding: '12px' }}>{t.description || '-'}</td>
                  <td 
                    style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: 'var(--accent)', cursor: 'cell', outline: 'none' }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleEditAmount(t.id, e.target.innerText)}
                    onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                  >
                    {localAmounts[t.id] !== undefined ? localAmounts[t.id] : t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Edit3 size={10} /> Click on amount to edit. Changes sync automatically via Debounced Edge Sync.
        </p>
      </div>

      <div className="analytics__footer" style={{ marginTop: '20px' }}>
        <p><Filter size={12} /> SMA Window: {smaWindow} periods | Dynamic Calculation Active</p>
      </div>
    </Card>
  );
};

export default FinanceAnalytics;
