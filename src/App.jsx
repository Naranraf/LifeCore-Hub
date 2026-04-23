/**
 * App.jsx — Root Application Component
 * 
 * Architecture:
 * 1. Auth gate: unauthenticated users see Login page.
 * 2. Authenticated users see Sidebar + routed content.
 * 3. Auth listener initializes once on mount via useAuth.init().
 */
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useAuthStore from './hooks/useAuth';
import { useAppStore } from './store/useAppStore';
import Sidebar from './components/Sidebar';
import Login from './app/Login';
import Dashboard from './app/Dashboard';
import Finance from './features/finance/Finance';
import Health from './features/health/Health';
import Productivity from './features/productivity/Productivity';
import Timing from './features/timing/Timing';
import AiChat from './features/ai/components/AiChat';
import Journal from './features/journal/Journal';
import MusicWidget from './components/MusicWidget';
import TimingWidget from './features/timing/components/TimingWidget';
import FloatingToolbar from './components/FloatingToolbar';
import './app/FeaturePages.css';

export default function App() {
  const { user, loading, init } = useAuthStore();
  const sidebarCollapsed = useAppStore((state) => state.ui.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  useEffect(() => {
    const unsubscribe = init();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [init]);

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
    return (
      <Router>
        <Login />
      </Router>
    );
  }

  // Authenticated layout
  return (
    <Router id="app-root">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <main
        id="main-content-area"
        className="main-content"
        style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
          height: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/health" element={<Health />} />
          <Route path="/productivity" element={<Productivity />} />
          <Route path="/timing" element={<Timing />} />
          <Route path="/ai" element={<AiChat />} />
          <Route path="/ai-chat" element={<AiChat />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </main>
      <MusicWidget />
      <TimingWidget />
      <FloatingToolbar />
    </Router>
  );
}
