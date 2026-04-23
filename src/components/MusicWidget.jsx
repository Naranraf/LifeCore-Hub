import React, { useState, useEffect } from 'react';
import { Music, X, Play, MonitorPlay, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import Card from './ui/Card';
import Button from './ui/Button';
import './MusicWidget.css';

/**
 * MusicWidget Component — Persistent background music player.
 * 
 * V3 ARCHITECTURE: 
 * - Never unmounts to keep audio session alive.
 * - Uses global state (activeMusicId) to sync with FloatingToolbar.
 * - Smooth CSS-based transitions instead of teleporting.
 */
export default function MusicWidget() {
  const isOpen = useAppStore((state) => state.ui.isMusicOpen);
  const setIsOpen = useAppStore((state) => state.toggleMusic);
  const activeMusicId = useAppStore((state) => state.ui.activeMusicId);
  const setActiveMusicId = useAppStore((state) => state.setActiveMusicId);
  
  const [inputUrl, setInputUrl] = useState('');

  const extractVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
      if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.searchParams.has('v')) return urlObj.searchParams.get('v');
        const pathSegments = urlObj.pathname.split('/');
        if (pathSegments.includes('live') || pathSegments.includes('embed')) return pathSegments[pathSegments.length - 1];
      }
      return '';
    } catch { return ''; }
  };

  const handlePlay = (e) => {
    e.preventDefault();
    const id = extractVideoId(inputUrl);
    if (id) {
      setActiveMusicId(id);
      setInputUrl('');
    }
  };

  const stopMusic = () => {
    setActiveMusicId(null);
    setIsOpen(); // Toggle off
  };

  return (
    <motion.div
      id="container-music-player"
      className="music-widget__root"
      initial={false}
      animate={{ 
        opacity: isOpen ? 1 : 0, 
        scale: isOpen ? 1 : 0.95,
        y: isOpen ? 0 : 20,
        pointerEvents: isOpen ? 'all' : 'none'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '40px',
        zIndex: 1000,
        width: '320px'
      }}
    >
      <Card className="music-widget__panel">
        <div className="music-widget__header">
          <div className="music-widget__title">
            <MonitorPlay size={16} color="#ef4444" />
            <span>Music Hub</span>
          </div>
          <div className="music-widget__actions">
            <button className="music-widget__minimize" onClick={() => setIsOpen(false)} title="Minimize (Keep Playing)">
              <Minus size={16} />
            </button>
            <button className="music-widget__close" onClick={stopMusic} title="Stop & Close">
              <X size={16} />
            </button>
          </div>
        </div>

        <form className="music-widget__form" onSubmit={handlePlay}>
          <input
            type="url"
            placeholder="Paste YouTube URL..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          <Button type="submit" disabled={!inputUrl} variant="glass" size="small">
            <Play size={14} />
          </Button>
        </form>

        <div className="music-widget__content-area">
          {activeMusicId ? (
            <div className="music-widget__player-container">
              <iframe
                width="100%"
                height="180"
                src={`https://www.youtube.com/embed/${activeMusicId}?autoplay=1`}
                title="YouTube player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="music-widget__empty">
              <p className="music-widget__empty-text">Select a preset to focus:</p>
              <div className="music-widget__presets">
                <button onClick={() => setActiveMusicId('jfKfPfyJRdk')} className="music-widget__preset-btn">
                  <Play size={14} style={{ color: 'var(--accent)' }}/> Lofi Focus Radio
                </button>
                <button onClick={() => setActiveMusicId('4xDzrJKXOOY')} className="music-widget__preset-btn">
                  <Play size={14} style={{ color: 'var(--accent-secondary)' }}/> Synthwave Focus
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
