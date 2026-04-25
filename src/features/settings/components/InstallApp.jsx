import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2, Share, Plus, X } from 'lucide-react';
import usePWAInstall from '../../../hooks/usePWAInstall';
import Card from '../../../components/ui/Card';
import './InstallApp.css';

/**
 * InstallApp — PWA Installation Widget for Settings.
 * Supports Chrome/Edge/Android native prompt and iOS Safari instructions.
 */
const InstallApp = () => {
  const { canInstall, isInstalled, platform, installApp } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    await installApp();
    setInstalling(false);
  };

  if (isInstalled) {
    return (
      <Card className="settings-section glass-panel">
        <div className="settings-section__header">
          <CheckCircle2 size={20} className="text-success" />
          <div>
            <h3 className="stats-number">App Installed</h3>
            <p className="settings-section__desc">LyfeCore Hub is running as a standalone application.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="settings-section glass-panel">
      <div className="settings-section__header">
        <Smartphone size={20} />
        <div>
          <h3 className="stats-number">Install App</h3>
          <p className="settings-section__desc">Install LyfeCore Hub on your device for a native-like experience.</p>
        </div>
      </div>

      <div className="install-app-content">
        <div className="install-app-benefits">
          <div className="install-benefit">
            <span className="benefit-dot"></span>
            Launch instantly from home screen
          </div>
          <div className="install-benefit">
            <span className="benefit-dot"></span>
            Works offline with cached data
          </div>
          <div className="install-benefit">
            <span className="benefit-dot"></span>
            Full-screen immersive experience
          </div>
          <div className="install-benefit">
            <span className="benefit-dot"></span>
            Faster load times & no browser UI
          </div>
        </div>

        {platform === 'ios' ? (
          <>
            <button 
              className="install-app-btn ios-guide-btn" 
              onClick={() => setShowIOSGuide(!showIOSGuide)}
            >
              <Share size={16} />
              How to Install on iOS
            </button>

            {showIOSGuide && (
              <div className="ios-install-guide">
                <button className="ios-guide-close" onClick={() => setShowIOSGuide(false)}>
                  <X size={14} />
                </button>
                <div className="ios-step">
                  <div className="ios-step-number">1</div>
                  <p>Tap the <strong>Share</strong> button <Share size={14} style={{ verticalAlign: 'middle' }} /> in Safari's toolbar</p>
                </div>
                <div className="ios-step">
                  <div className="ios-step-number">2</div>
                  <p>Scroll down and tap <strong>"Add to Home Screen"</strong> <Plus size={14} style={{ verticalAlign: 'middle' }} /></p>
                </div>
                <div className="ios-step">
                  <div className="ios-step-number">3</div>
                  <p>Tap <strong>"Add"</strong> to confirm</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <button 
            className="install-app-btn" 
            onClick={handleInstall}
            disabled={!canInstall || installing}
          >
            <Download size={16} />
            {installing ? 'Installing...' : canInstall ? 'Install LyfeCore Hub' : 'Open in browser to install'}
          </button>
        )}

        {!canInstall && platform !== 'ios' && (
          <p className="install-note">
            Tip: If the button is disabled, the app may already be installed or your browser doesn't support PWA installation. Try opening in Chrome or Edge.
          </p>
        )}
      </div>
    </Card>
  );
};

export default InstallApp;
