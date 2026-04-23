/**
 * Dashboard Page — Core hub showing all module summaries.
 * 
 * Each widget card previews data from its respective feature module.
 * Cards use glassmorphism and micro-animations for premium UX.
 */
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  HeartPulse,
  CalendarCheck,
  Timer,
  TrendingUp,
  Activity,
  Target,
  Clock,
  Flame,
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../hooks/useAuth';
import useFinanceStore from '../features/finance/hooks/useFinance';
import useHealthStore from '../features/health/hooks/useHealth';
import useTimerStore from '../features/timing/hooks/useTimer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './Dashboard.css';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

/**
 * StatCard — Reusable widget for dashboard summaries.
 */
function StatCard({ icon: Icon, iconColor, title, value, subtitle, index }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className="dashboard__card">
        <div className="dashboard__card-header">
          <div className="dashboard__card-icon" style={{ background: 'var(--glass-border)', color: iconColor }}>
            <Icon size={22} />
          </div>
          <span className="dashboard__card-title">{title}</span>
        </div>
        <p className="dashboard__card-value" style={{ fontWeight: 'bold' }}>{value}</p>
        <p className="dashboard__card-subtitle">{subtitle}</p>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { profile, googleAccessToken } = useAuthStore();
  const { transactions, initListener: initFinance, currency } = useFinanceStore();
  const { logs, initListener: initHealth } = useHealthStore();
  const { sessionCount, totalFocusMs } = useTimerStore();
  const navigate = useNavigate();
  
  const greeting = getGreeting();

  useEffect(() => {
    initFinance();
    initHealth();
  }, [initFinance, initHealth]);

  // Calculate Finance Balance
  const balance = useMemo(() => {
    let inc = 0, exp = 0;
    transactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
    });
    return inc - exp;
  }, [transactions]);

  // Calculate Health Calories today
  const todayCalories = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let cal = 0;
    logs.forEach(log => {
      if (log.type === 'meal' && log.date === today) {
        cal += log.calories || 0;
      }
    });
    return cal;
  }, [logs]);

  const formattedBalance = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency || 'USD' 
  }).format(balance || 0);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__greeting">
            {greeting}, <span className="dashboard__name">{profile?.displayName?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="dashboard__tagline">Here's your life optimization overview.</p>
        </div>
        <div className="dashboard__date">
          {new Date().toLocaleDateString(navigator.language, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </header>

      <div className="dashboard__grid">
        <StatCard
          icon={Wallet}
          iconColor="var(--accent)"
          title="Finance"
          value={transactions.length > 0 ? formattedBalance : '—'}
          subtitle={transactions.length > 0 ? `${transactions.length} recent logs` : "No transactions yet"}
          index={0}
        />
        <StatCard
          icon={HeartPulse}
          iconColor="var(--success)"
          title="Health"
          value={logs.length > 0 ? `${todayCalories} kcal` : '—'}
          subtitle={logs.length > 0 ? "Consumed today" : "Start tracking calories"}
          index={1}
        />
        <StatCard
          icon={CalendarCheck}
          iconColor="var(--warning)"
          title="Tasks"
          value={googleAccessToken ? "Synced" : '—'}
          subtitle={googleAccessToken ? "Live with Google Tasks" : "Log in to sync"}
          index={2}
        />
        <StatCard
          icon={Timer}
          iconColor="var(--accent-secondary)"
          title="Focus Time"
          value={sessionCount > 0 ? `${Math.floor(totalFocusMs / 60000)}m` : 'Ready'}
          subtitle={sessionCount > 0 ? `${sessionCount} sessions` : 'Start a Pomodoro session'}
          index={3}
        />
      </div>

      {/* Quick Actions */}
      <section className="dashboard__quick">
        <h2 className="dashboard__section-title">Quick Actions</h2>
        <div className="dashboard__actions">
          <QuickAction icon={TrendingUp} label="Add Expense" color="var(--accent)" onClick={() => navigate('/finance')} />
          <QuickAction icon={Activity} label="Log Meal" color="var(--success)" onClick={() => navigate('/health')} />
          <QuickAction icon={Target} label="New Task" color="var(--warning)" onClick={() => navigate('/productivity')} />
          <QuickAction icon={Clock} label="Start Timer" color="var(--accent-secondary)" onClick={() => navigate('/timing')} />
        </div>
      </section>

      {/* Streaks — Gamification */}
      <section className="dashboard__quick" style={{ marginTop: '32px' }}>
        <h2 className="dashboard__section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} style={{ color: 'var(--warning)' }} /> Activity Streaks
        </h2>
        <div className="dashboard__grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <StreakCard label="Finance Logs" count={transactions.length} icon="💰" />
          <StreakCard label="Health Logs" count={logs.length} icon="🍎" />
          <StreakCard label="Focus Sessions" count={sessionCount} icon="🎯" />
        </div>
      </section>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <motion.button
      className="dashboard__action-btn"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      style={{ '--action-color': color }}
      onClick={onClick}
    >
      <Icon size={20} />
      <span>{label}</span>
    </motion.button>
  );
}

/** Returns time-of-day greeting. */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Streak badge with milestone glow effect. */
function StreakCard({ label, count, icon }) {
  const milestone = count >= 50 ? '🔥' : count >= 25 ? '⭐' : count >= 10 ? '✨' : '';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card 
        className="dashboard__card" 
        style={{ 
          padding: '20px', 
          textAlign: 'center',
          borderColor: count >= 10 ? 'var(--warning)' : undefined,
          boxShadow: count >= 25 ? '0 0 20px rgba(245, 158, 11, 0.15)' : undefined,
        }}
      >
        <div style={{ fontSize: '28px', marginBottom: '4px' }}>{icon}</div>
        <p style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{count} {milestone}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</p>
      </Card>
    </motion.div>
  );
}
