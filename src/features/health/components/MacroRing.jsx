/**
 * MacroRing — Pure CSS/SVG donut chart showing macro breakdown.
 * Zero external dependencies.
 */
import React from 'react';

export default function MacroRing({ protein, carbs, fat }) {
  const total = protein + carbs + fat;
  if (total === 0) return null;

  const pPct = (protein / total) * 100;
  const cPct = (carbs / total) * 100;
  const fPct = (fat / total) * 100;

  // SVG donut chart
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  
  const pLen = (pPct / 100) * circumference;
  const cLen = (cPct / 100) * circumference;
  const fLen = (fPct / 100) * circumference;

  return (
    <div style={{ padding: '20px 24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>
        Macros Today
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="var(--glass-border)" strokeWidth="14" />
          {/* Protein */}
          <circle
            cx="65" cy="65" r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="14"
            strokeDasharray={`${pLen} ${circumference - pLen}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          {/* Carbs */}
          <circle
            cx="65" cy="65" r={radius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="14"
            strokeDasharray={`${cLen} ${circumference - cLen}`}
            strokeDashoffset={-pLen}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          {/* Fat */}
          <circle
            cx="65" cy="65" r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth="14"
            strokeDasharray={`${fLen} ${circumference - fLen}`}
            strokeDashoffset={-(pLen + cLen)}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          <text x="65" y="62" textAnchor="middle" fill="var(--text-main)" fontSize="20" fontWeight="700">{total}g</text>
          <text x="65" y="78" textAnchor="middle" fill="var(--text-muted)" fontSize="11">total</text>
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <MacroLabel color="#3b82f6" label="Protein" value={`${protein}g`} pct={Math.round(pPct)} />
          <MacroLabel color="#f59e0b" label="Carbs" value={`${carbs}g`} pct={Math.round(cPct)} />
          <MacroLabel color="#ef4444" label="Fat" value={`${fat}g`} pct={Math.round(fPct)} />
        </div>
      </div>
    </div>
  );
}

function MacroLabel({ color, label, value, pct }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '55px' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{value}</span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({pct}%)</span>
    </div>
  );
}
