import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

export default function RestTimer({ initialSeconds, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } catch (e) {
      console.error('Audio error:', e);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      playBeep();
      setTimeout(() => playBeep(), 400); // Double beep
      if (onFinish) onFinish();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onFinish]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rest-timer-compact">
      <div className="timer-display">
        <Clock size={12} className={isActive ? 'spin-slow' : ''} />
        <span className="time-val">{formatTime(timeLeft)}</span>
      </div>
      <div className="timer-controls">
        <button onClick={() => setIsActive(!isActive)} className="timer-btn">
          {isActive ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button onClick={() => setTimeLeft(initialSeconds)} className="timer-btn">
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
