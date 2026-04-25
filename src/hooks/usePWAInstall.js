import { useState, useEffect } from 'react';

/**
 * usePWAInstall — Hook to manage PWA installation across platforms.
 * 
 * - Chrome/Edge/Android: Uses the native `beforeinstallprompt` event.
 * - Safari/iOS: Detects the platform and shows manual instructions.
 */
export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState('unknown'); // 'chromium', 'ios', 'unknown'

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    if (isIOS) {
      setPlatform('ios');
    } else {
      setPlatform('chromium');
    }

    // Listen for the native install prompt (Chrome/Edge/Android)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect if app was installed after prompt
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    return outcome === 'accepted';
  };

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    platform,
    installApp
  };
}
