import React from 'react';
import { BrainCircuit, Zap, BarChart3, RefreshCw, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import useWorkoutAnalyst from '../hooks/useWorkoutAnalyst';
import Card from '../../../components/ui/Card';
import './WorkoutAnalyst.css';

/**
 * WorkoutAnalyst — AI-driven performance insights.
 */
const WorkoutAnalyst = () => {
  const { analysis, loading, error, analyzeProgress } = useWorkoutAnalyst();

  return (
    <Card className="workout-analyst glass-panel">
      <div className="workout-analyst__header">
        <div className="workout-analyst__title">
          <BrainCircuit size={20} className="analyst-icon" />
          <h3 className="stats-number">Biometric Health Analyst</h3>
        </div>
        <button 
          className={`workout-analyst__refresh ${loading ? 'spinning' : ''}`} 
          onClick={analyzeProgress}
          disabled={loading}
          title="Run Performance Analysis"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="workout-analyst__content">
        {loading ? (
          <div className="workout-analyst__loading">
            <Zap size={28} className="pulse-icon" />
            <div className="loading-text">
              <span className="stats-number">Analyzing Load Distributions...</span>
              <p>Scanning session history for delta changes.</p>
            </div>
          </div>
        ) : error ? (
          <div className="workout-analyst__error">
            <BarChart3 size={24} />
            <p>{error}</p>
            <button className="retry-btn" onClick={analyzeProgress}>Initialize Scan</button>
          </div>
        ) : analysis ? (
          <motion.div 
            className="workout-analyst__text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={analysis}
          >
            <p>{analysis}</p>
          </motion.div>
        ) : (
          <div className="workout-analyst__empty">
            <Activity size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <p>System ready. Run analysis to detect performance deltas.</p>
            <button className="primary-scan-btn" onClick={analyzeProgress}>
              Start AI Analysis
            </button>
          </div>
        )}
      </div>

      <div className="workout-analyst__footer">
        <span>Precision Level: High-Fidelity // Cortex v2.4</span>
      </div>
    </Card>
  );
};

export default WorkoutAnalyst;
