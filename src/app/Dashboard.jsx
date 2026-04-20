/**
 * Dashboard Page — Core hub showing all module summaries.
 * 
 * Each widget card previews data from its respective feature module.
 * Cards use glassmorphism and micro-animations for premium UX.
 */
import React from 'react';
import {
  Wallet,
  HeartPulse,
  CalendarCheck,
  Timer,
  TrendingUp,
  Activity,
  Target,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../hooks/useAuth';
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
 * Keeps each card < 30 lines for maintainability.
 */
function StatCard({ icon: Icon, iconColor, title, value, subtitle, index }) {
  return (
    <motion.div
      className="dashboard__card glass-panel"
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <div className="dashboard__card-header">
        <div className="dashboard__card-icon" style={{ background: 'var(--glass-border)', color: iconColor }}>
          <Icon size={22} />
        </div>
        <span className="dashboard__card-title">{title}</span>
      </div>
      <p className="dashboard__card-value">{value}</p>
      <p className="dashboard__card-subtitle">{subtitle}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { profile } = useAuthStore();
  const greeting = getGreeting();

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
          {new Date().toLocaleDateString('en-US', {
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
          value="—"
          subtitle="No transactions yet"
          index={0}
        />
        <StatCard
          icon={HeartPulse}
          iconColor="var(--success)"
          title="Health"
          value="—"
          subtitle="Start tracking calories"
          index={1}
        />
        <StatCard
          icon={CalendarCheck}
          iconColor="var(--warning)"
          title="Tasks"
          value="—"
          subtitle="No pending tasks"
          index={2}
        />
        <StatCard
          icon={Timer}
          iconColor="var(--accent-secondary)"
          title="Focus Time"
          value="—"
          subtitle="Start a Pomodoro session"
          index={3}
        />
      </div>

      {/* Quick Actions */}
      <section className="dashboard__quick">
        <h2 className="dashboard__section-title">Quick Actions</h2>
        <div className="dashboard__actions">
          <QuickAction icon={TrendingUp} label="Add Expense" color="var(--accent)" />
          <QuickAction icon={Activity} label="Log Meal" color="var(--success)" />
          <QuickAction icon={Target} label="New Task" color="var(--warning)" />
          <QuickAction icon={Clock} label="Start Timer" color="var(--accent-secondary)" />
        </div>
      </section>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color }) {
  return (
    <motion.button
      className="dashboard__action-btn"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      style={{ '--action-color': color }}
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
