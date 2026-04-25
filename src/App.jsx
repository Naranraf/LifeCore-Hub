/**
 * App.jsx — Root Application Component
 * 
 * Architecture:
 * 1. Auth gate: unauthenticated users see Login page.
 * 2. Authenticated users see Sidebar + routed content.
 * 3. Auth listener initializes once on mount via useAuth.init().
 */
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import useAuthStore from './hooks/useAuth';
import { useAppStore } from './store/useAppStore';
import useThemeStore from './hooks/useTheme';
import Sidebar from './components/Sidebar';
import Login from './app/Login';
import Dashboard from './app/Dashboard';
import Finance from './features/finance/Finance';
import Nutrition from './features/nutrition/components/Nutrition';
import Workout from './features/workout/components/Workout';
import Productivity from './features/productivity/Productivity';
import Timing from './features/timing/Timing';
import AiChat from './features/ai/components/AiChat';
import Journal from './features/journal/Journal';
import SettingsView from './features/settings/SettingsView';
import MusicWidget from './components/MusicWidget';
import VisualsWidget from './components/ui/VisualsWidget';
import TimingWidget from './features/timing/components/TimingWidget';
import FloatingToolbar from './components/FloatingToolbar';
import MagicCursor from './components/ui/MagicCursor';
import Aurora from './components/ui/Aurora';
import SplashCursor from './components/ui/SplashCursor';
import GlobalRestTimer from './features/workout/components/GlobalRestTimer';
import useNotifications from './hooks/useNotifications';
import './app/FeaturePages.css';

// Aurora Color Stops Map (based on tactical tokens)
const FEATURE_COLORS = {
  dashboard: ['#0D0D0E', '#161618', '#0D0D0E'],
  finance: ['#064e3b', '#059669', '#064e3b'],
  nutrition: ['#365314', '#65a30d', '#365314'],
  workout: ['#450a0a', '#dc2626', '#450a0a'],
  productivity: ['#1e293b', '#2563eb', '#1e293b'],
  timing: ['#431407', '#ea580c', '#431407'],
  journal: ['#1e1b4b', '#4f46e5', '#1e1b4b'],
  ai: ['#1e1b4b', '#8b5cf6', '#1e1b4b'],
  settings: ['#27272a', '#52525b', '#27272a']
};

const RAINBOW_COLORS = ['#ff0000', '#00ff00', '#0000ff'];

export default function App() {
  const { user, loading, init } = useAuthStore();
  const sidebarCollapsed = useAppStore((state) => state.ui.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  // Initialize Global Watchdogs
  useNotifications();

  useEffect(() => {
    const unsubscribe = init();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [init]);

  // Atmospheric Context Controller
  const location = useLocation();
  const [currentFeature, setCurrentFeature] = useState('dashboard');
  const cursorConfig = useAppStore((state) => state.ui.cursor);
  const { showBackground, auroraMode } = useAppStore((state) => state.ui);

  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    setCurrentFeature(path);
    document.body.setAttribute('data-feature', path);
  }, [location]);

  // Global Accent Color Sync
  const accentColor = useAppStore((state) => state.ui.accentColor);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (!accentColor) return;
    
    // Update CSS Variable on documentElement
    // Applying directly to element style ensures it overrides CSS rules with lower specificity.
    document.documentElement.style.setProperty('--primary', accentColor);
    
    // Also update --accent-rgb for rgba colors
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '249, 115, 22';
    };
    
    document.documentElement.style.setProperty('--accent-rgb', hexToRgb(accentColor));
  }, [accentColor, theme]);

  // Loading state while Firebase checks auth
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading LyfeCore Hub…</span>
      </div>
    );
  }

  // Auth gate
  if (!user) {
    return <Login />;
  }

  // Authenticated layout
  const auroraColors = auroraMode === 'rainbow' 
    ? RAINBOW_COLORS 
    : (FEATURE_COLORS[currentFeature] || FEATURE_COLORS.dashboard);

  return (
    <>
      {showBackground && (
        <Aurora 
          colorStops={auroraColors}
          amplitude={1.2}
        />
      )}
      {cursorConfig.enabled && cursorConfig.mode === 'splash' && <SplashCursor COLOR={cursorConfig.color} />}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <main
        id="main-content-area"
        className="main-content"
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/productivity" element={<Productivity />} />
          <Route path="/timing" element={<Timing />} />
          <Route path="/ai" element={<AiChat />} />
          <Route path="/ai-chat" element={<AiChat />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </main>
      <MusicWidget />
      <VisualsWidget />
      <TimingWidget />
      <FloatingToolbar />
      <MagicCursor />
      <GlobalRestTimer />
    </>
  );
}
