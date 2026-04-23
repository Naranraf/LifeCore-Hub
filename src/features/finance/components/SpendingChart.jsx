/**
 * SpendingChart — Visual summary of fiscal activity.
 * 
 * Purpose: Provides a pure CSS bar chart showing the last 7 days of income and expenses.
 * Responsibilities:
 * - Calculate daily aggregates from transaction history.
 * - Render responsive, reactive bar components representing cash flow.
 */
import React, { useMemo } from 'react';

export default function SpendingChart({ transactions, currency }) {
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString(navigator.language, { weekday: 'short' });
      days.push({ key, label, income: 0, expense: 0 });
    }

    transactions.forEach(t => {
      const day = days.find(d => d.key === t.date);
      if (day) {
        if (t.type === 'income') day.income += t.amount;
        if (t.type === 'expense') day.expense += t.amount;
      }
    });

    const maxVal = Math.max(...days.map(d => Math.max(d.income, d.expense)), 1);
    return { days, maxVal };
  }, [transactions]);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  return (
    <div id="chart-finance-weekly" style={{ padding: '20px 24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>
        Weekly Overview
      </h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px' }}>
        {chartData.days.map((day) => {
          const expH = (day.expense / chartData.maxVal) * 100;
          const incH = (day.income / chartData.maxVal) * 100;
          return (
            <div key={day.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', flex: 1, width: '100%', justifyContent: 'center' }}>
                <div
                  title={`Income: ${fmt(day.income)}`}
                  style={{
                    width: '40%',
                    height: `${Math.max(incH, 2)}%`,
                    background: 'var(--success)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease',
                    opacity: day.income > 0 ? 1 : 0.15,
                  }}
                />
                <div
                  title={`Expense: ${fmt(day.expense)}`}
                  style={{
                    width: '40%',
                    height: `${Math.max(expH, 2)}%`,
                    background: 'var(--error)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease',
                    opacity: day.expense > 0 ? 1 : 0.15,
                  }}
                />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{day.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--success)' }} /> Income
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--error)' }} /> Expense
        </div>
      </div>
    </div>
  );
}
