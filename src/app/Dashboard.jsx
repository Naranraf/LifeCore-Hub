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
  Apple,
  Dumbbell,
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
import useNutritionStore from '../features/nutrition/hooks/useNutrition';
import useWorkoutStore from '../features/workout/hooks/useWorkout';
import useTimerStore from '../features/timing/hooks/useTimer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GoalTracker from '../features/finance/components/GoalTracker';
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
function StatCard({ icon: Icon, iconColor, title, value, subtitle, index, onClick }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <Card className="dashboard__card" style={{ cursor: 'pointer' }}>
        <div className="dashboard__card-header">
          <div className="dashboard__card-icon" style={{ color: iconColor }}>
            <Icon size={20} />
          </div>
          <span className="dashboard__card-title">{title}</span>
        </div>
        <div className="dashboard__card-value mono">{value}</div>
        <div className="dashboard__card-subtitle">{subtitle}</div>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { profile, googleAccessToken } = useAuthStore();
  const { transactions, initListener: initFinance, currency, loading: loadingFinance } = useFinanceStore();
  const { logs, initListener: initNutrition, loading: loadingNutrition } = useNutritionStore();
  const { recentSessions, initListener: initWorkout } = useWorkoutStore();
  const { sessionCount, totalFocusMs } = useTimerStore();
  const navigate = useNavigate();
  
  const greeting = getGreeting();

  useEffect(() => {
    initFinance();
    initNutrition();
    initWorkout();

    return () => {
      // We don't necessarily want to wipe the store data, 
      // but we could detach listeners if needed for strict memory management.
      // For now, keeping data fresh is preferred, but we ensure no race conditions exist.
    };
  }, [initFinance, initNutrition, initWorkout]);

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
            {greeting}, <span className="dashboard__name">{profile?.displayName?.split(' ')[0] || 'Operator'}</span>
            <span className="dashboard__alpha-badge">Bunker v1.1</span>
          </h1>
          <p className="dashboard__tagline">Life Optimization Engine // Tactical Status</p>
        </div>
        <div className="dashboard__date">
          {new Date().toLocaleDateString(navigator.language, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </header>

      <div className="dashboard__grid">
        <StatCard
          icon={Wallet}
          iconColor="var(--primary)"
          title="Finance Hub"
          value={!loadingFinance && transactions.length > 0 ? formattedBalance : "0.00"}
          subtitle={transactions.length > 0 ? `${transactions.length} active logs` : "Standby"}
          index={0}
          onClick={() => navigate('/finance')}
        />
        <StatCard
          icon={Apple}
          iconColor="var(--accent-success)"
          title="Bio Metrics"
          value={!loadingNutrition && logs.length > 0 ? `${todayCalories} kcal` : "0 kcal"}
          subtitle={logs.length > 0 ? "Fueling active" : "Await log"}
          index={1}
          onClick={() => navigate('/nutrition')}
        />
        <StatCard
          icon={CalendarCheck}
          iconColor="var(--primary)"
          title="Mission Control"
          value="Native"
          subtitle="Sovereign Tasks Active"
          index={2}
          onClick={() => navigate('/productivity')}
        />
        <StatCard
          icon={Timer}
          iconColor="var(--primary)"
          title="Focus Engine"
          value={sessionCount > 0 ? `${Math.floor(totalFocusMs / 60000)}m` : '0m'}
          subtitle={sessionCount > 0 ? `${sessionCount} cycles complete` : 'Idle'}
          index={3}
          onClick={() => navigate('/timing')}
        />
      </div>

      {/* Performance Mastery — Data Insights */}
      <section className="dashboard__insights" style={{ marginTop: '32px' }}>
        <h2 className="dashboard__section-title">Performance Mastery</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <GoalTracker />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard__quick">
        <h2 className="dashboard__section-title">Quick Actions</h2>
        <div className="dashboard__actions">
          <QuickAction icon={TrendingUp} label="Add Expense" color="var(--accent)" onClick={() => navigate('/finance')} />
          <QuickAction icon={Apple} label="Log Meal" color="var(--success)" onClick={() => navigate('/nutrition')} />
          <QuickAction icon={Target} label="New Task" color="var(--warning)" onClick={() => navigate('/productivity')} />
          <QuickAction icon={Clock} label="Start Timer" color="var(--accent-secondary)" onClick={() => navigate('/timing')} />
        </div>
      </section>

      {/* Streaks — Gamification */}
      <section className="dashboard__quick" style={{ marginTop: '32px', marginBottom: '64px' }}>
        <h2 className="dashboard__section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} style={{ color: 'var(--warning)' }} /> Activity Streaks
        </h2>
        <div className="dashboard__grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <StreakCard label="Finance Logs" count={transactions.length} icon="💰" onClick={() => navigate('/finance')} />
          <StreakCard label="Nutrition Logs" count={logs.length} icon="🍎" onClick={() => navigate('/nutrition')} />
          <StreakCard label="Workouts" count={recentSessions.length} icon="🏋️" onClick={() => navigate('/workout')} />
        </div>
      </section>

      {/* INSTITUTIONAL FOOTER */}
      <footer className="dashboard__footer">
        <div className="footer__content">
          <div className="footer__brand">
            <h3 className="footer__logo">LyfeCore Hub</h3>
            <p>© 2026 LyfeCore Systems. <a href="https://lyfecore-hub.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>lyfecore-hub.com</a></p>
          </div>
          <div className="footer__meta">
            <p>Architected by Antigravity Agent & Naranraf</p>
            <p className="footer__disclaimer">
              Disclaimer: Finance and health data provided for informational purposes only. 
              Consult professionals for financial or medical advice. 
            </p>
          </div>
        </div>
      </footer>
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
function StreakCard({ label, count, icon, onClick }) {
  const milestone = count >= 50 ? '🔥' : count >= 25 ? '⭐' : count >= 10 ? '✨' : '';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3, scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
    >
      <Card 
        className="dashboard__card" 
        style={{ 
          padding: '20px', 
          textAlign: 'center',
          borderColor: count >= 10 ? 'var(--warning)' : undefined,
          boxShadow: count >= 25 ? '0 0 20px rgba(245, 158, 11, 0.15)' : undefined,
          cursor: 'pointer'
        }}
      >
        <div style={{ fontSize: '28px', marginBottom: '4px' }}>{icon}</div>
        <p style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{count} {milestone}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</p>
      </Card>
    </motion.div>
  );
}
