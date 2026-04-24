import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

/**
 * DangerZone — Critical system operations.
 */
const DangerZone = () => {
  const hardResetApp = useAppStore((state) => state.hardResetApp);

  const handleHardReset = () => {
    const confirmed = window.confirm(
      "CRITICAL ACTION: This will clear all local settings and reload the application. Are you sure you want to perform a Hard Reset?"
    );
    if (confirmed) {
      hardResetApp();
    }
  };

  return (
    <Card className="settings-section settings-section--danger">
      <div className="settings-section__header">
        <div className="settings-section__title">
          <AlertTriangle size={20} color="#ef4444" />
          <span>Danger Zone</span>
        </div>
      </div>
      <div className="settings-section__content">
        <p className="settings-description">
          Restricted actions that can affect application stability or data persistence.
        </p>
        
        <div className="danger-action-row">
          <div className="danger-action-info">
            <span className="action-name">Hard Reset Application</span>
            <span className="action-desc">Clears all local storage and reloads to factory state.</span>
          </div>
          <Button 
            variant="glass" 
            onClick={handleHardReset}
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            <RefreshCcw size={16} /> Reset System
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DangerZone;
