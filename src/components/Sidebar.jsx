/**
 * Sidebar Component — Primary navigation structure for LyfeCore Hub.
 * 
 * Purpose: Provides access to all active features and modules.
 * Features:
 * - Glassmorphism design and responsive collapsed state.
 * - Dynamic navigation item rendering.
 * - Integrated user profile, theme toggle, and logout actions.
 */
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Apple,
  Dumbbell,
  CalendarCheck,
  Timer,
  Book,
  Bot,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';
import useAuthStore from '../hooks/useAuth';
import ThemeSwitcher from './ui/ThemeSwitcher';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/finance', label: 'Finance', icon: Wallet },
  { path: '/nutrition', label: 'Nutrition', icon: Apple },
  { path: '/workout', label: 'Workout', icon: Dumbbell },
  { path: '/productivity', label: 'Productivity', icon: CalendarCheck },
  { path: '/timing', label: 'Timing', icon: Timer },
  { path: '/journal', label: 'Journal', icon: Book },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { user, profile, signOut } = useAuthStore();

  return (
    <aside id="sidebar-navigation" className={`sidebar glass-panel ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar__brand">
        {!collapsed && (
          <h1 className="sidebar__logo">
            Lyfe<span className="sidebar__logo-accent">Core</span>
          </h1>
        )}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!collapsed && <ThemeSwitcher />}
          <button
            className="sidebar__toggle"
            onClick={onToggle}
            aria-label="Toggle sidebar"
            id="sidebar-toggle"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            title={label}
            id={`nav-${label.toLowerCase()}`}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* AI Button (Special FAB on Mobile, Bottom section on Desktop) */}
      <div className="sidebar__ai-container">
        <NavLink
          to="/ai"
          className={({ isActive }) =>
            `sidebar__ai-btn ${isActive ? 'sidebar__ai-btn--active' : ''}`
          }
          title="Gemini AI"
          id="nav-ai"
        >
          <Bot size={20} />
          {!collapsed && <span>Gemini AI</span>}
        </NavLink>
      </div>

      {/* User + Logout */}
      {user && (
        <div className="sidebar__user">
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=3b82f6&color=fff&size=80`}
            alt="Avatar"
            className="sidebar__avatar"
          />
          {!collapsed && (
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{profile?.displayName || user.displayName}</span>
              <span className="sidebar__user-email">{user.email}</span>
            </div>
          )}
          <button
            className="sidebar__logout"
            onClick={signOut}
            title="Sign Out"
            id="btn-signout"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}
