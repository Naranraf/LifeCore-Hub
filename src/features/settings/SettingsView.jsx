import React from 'react';
import { Settings, Shield, User, Crown } from 'lucide-react';
import AppearanceSettings from './AppearanceSettings';
import WorkoutPreferences from './WorkoutPreferences';
import MembershipSettings from './components/MembershipSettings';
import InstallApp from './components/InstallApp';
import DangerZone from './DangerZone';
import LegalCompliance from './components/LegalCompliance';
import './Settings.css';

/**
 * SettingsView — Central Hub for Application Configuration.
 */
const SettingsView = () => {
  return (
    <div className="settings-page">
      <header className="feature-page__header">
        <div className="feature-page__icon">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="feature-page__title">System Settings</h1>
          <p className="feature-page__desc">Configure your operational environment and security preferences.</p>
        </div>
      </header>

      <div className="settings-grid">
        <div className="settings-sidebar">
          <div className="settings-nav-item active">
            <Shield size={18} />
            <span>General & Appearance</span>
          </div>
          <div className="settings-nav-item disabled">
            <User size={18} />
            <span>User Profile (Locked)</span>
          </div>
        </div>

        <div className="settings-content">
          <MembershipSettings />
          <InstallApp />
          <AppearanceSettings />
          <WorkoutPreferences />
          <DangerZone />
          <LegalCompliance />
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
