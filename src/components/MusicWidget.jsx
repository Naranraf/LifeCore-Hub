import React, { useState } from 'react';
import { Music, X, Play, MonitorPlay } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './MusicWidget.css';

export default function MusicWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [videoId, setVideoId] = useState(''); // Default could be some lofi radio?

  const extractVideoId = (url) => {
    try {
      // Handles both youtu.be and youtube.com
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.searchParams.has('v')) {
          return urlObj.searchParams.get('v');
        }
        // Handle /live/ or /embed/
        const pathSegments = urlObj.pathname.split('/');
        if (pathSegments.includes('live') || pathSegments.includes('embed')) {
            return pathSegments[pathSegments.length - 1];
        }
      }
      return '';
    } catch {
      return '';
    }
  };

  const handlePlay = (e) => {
    e.preventDefault();
    const id = extractVideoId(inputUrl);
    if (id) {
      setVideoId(id);
      setInputUrl('');
    } else {
      alert("Please enter a valid YouTube URL.");
    }
  };

  return (
    <>
      <button 
        className="music-widget__toggle glass-panel" 
        onClick={() => setIsOpen(!isOpen)}
        title="Background Music Player"
      >
        <Music size={20} className={videoId ? "music-widget__icon--playing" : ""} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="music-widget__panel glass-panel"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="music-widget__header">
              <div className="music-widget__title">
                <MonitorPlay size={16} color="#ef4444" />
                <span>YouTube Player</span>
              </div>
              <button className="music-widget__close" onClick={() => setIsOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form className="music-widget__form" onSubmit={handlePlay}>
              <input
                type="url"
                placeholder="Paste YouTube URL..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                autoFocus
              />
              <button type="submit" disabled={!inputUrl}>
                <Play size={14} />
              </button>
            </form>

            {videoId ? (
              <div className="music-widget__player-container">
                <iframe
                  width="100%"
                  height="160"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="music-widget__empty">
                <p>Paste a YouTube video or live stream to listen while you work.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
