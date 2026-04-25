import React, { useEffect, useRef } from 'react';
import { ShieldCheck, Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import useExecutiveSummary from '../hooks/useExecutiveSummary';
import Card from '../../../components/ui/Card';
import './ExecutiveSummary.css';

/**
 * ExecutiveSummary — Tactical Daily Brief Widget.
 */
const ExecutiveSummary = () => {
  const { summary, loading, error, generateSummary } = useExecutiveSummary();
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Only attempt auto-generation ONCE on mount
    if (!hasAttempted.current) {
      hasAttempted.current = true;
      generateSummary();
    }
  }, []); // Empty deps = mount only, no retries

  return (
    <Card className="exec-summary glass-panel">
      <div className="exec-summary__header">
        <div className="exec-summary__title">
          <ShieldCheck size={18} className="exec-icon" />
          <h4 className="stats-number">Tactical Executive Brief</h4>
        </div>
        <button 
          className={`exec-summary__refresh ${loading ? 'spinning' : ''}`} 
          onClick={() => generateSummary(true)}
          disabled={loading}
          title="Refresh Intelligence"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="exec-summary__content">
        {loading && !summary ? (
          <div className="exec-summary__loading">
            <Zap size={24} className="pulse-icon" />
            <span>Analyzing tactical data streams...</span>
          </div>
        ) : error ? (
          <div className="exec-summary__error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <motion.p 
            className="exec-summary__text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={summary}
          >
            {summary || "No tactical brief available. Click refresh to initialize."}
          </motion.p>
        )}
      </div>

      <div className="exec-summary__footer">
        <div className="status-dot pulse"></div>
        <span>Neural Link: Active // Gemini 2.0 Flash</span>
      </div>
    </Card>
  );
};

export default ExecutiveSummary;
