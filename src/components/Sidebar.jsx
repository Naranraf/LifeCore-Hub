/**
 * Sidebar Component — Primary navigation for LyfeCore Hub.
 * 
 * Design: Glassmorphism panel with animated nav items.
 * Uses lucide-react for consistent iconography.
 * Active route is highlighted via react-router-dom's useLocation.
 */
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  HeartPulse,
  CalendarCheck,
  Timer,
  Book,
  Bot,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import useAuthStore from '../hooks/useAuth';
import useThemeStore from '../hooks/useTheme';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/finance', label: 'Finance', icon: Wallet },
  { path: '/health', label: 'Health', icon: HeartPulse },
  { path: '/productivity', label: 'Productivity', icon: CalendarCheck },
  { path: '/timing', label: 'Timing', icon: Timer },
  { path: '/journal', label: 'Journal', icon: Book },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { user, profile, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <aside className={`sidebar glass-panel ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar__brand">
        {!collapsed && (
          <h1 className="sidebar__logo">
            Lyfe<span className="sidebar__logo-accent">Core</span>
          </h1>
        )}
        <button
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          id="sidebar-toggle"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
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

      {/* AI Button (special) */}
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
            className="sidebar__theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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
