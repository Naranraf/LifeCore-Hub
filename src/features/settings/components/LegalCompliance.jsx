import React from 'react';
import { ShieldCheck, Info, Database } from 'lucide-react';
import Card from '../../../components/ui/Card';

/**
 * LegalCompliance — Formalizes data sovereignty and informational nature of the app.
 */
const LegalCompliance = () => {
  return (
    <Card className="settings-section legal-compliance-card">
      <div className="settings-section__header">
        <div className="settings-section__title">
          <ShieldCheck size={20} />
          <span>Legal & Compliance</span>
        </div>
      </div>
      
      <div className="settings-section__content">
        <div className="legal-section">
          <div className="legal-section__header">
            <Info size={14} className="legal-icon" />
            <span className="legal-label">Disclaimer</span>
          </div>
          <p className="legal-text">
            LyfeCore Hub is a self-management and tracking tool. The financial calculations, workout logs, 
            and nutrition data provided are for informational purposes only. We do NOT provide 
            professional medical, nutritional, or financial advice. Use this tool at your own risk.
          </p>
        </div>

        <div className="settings-divider" />

        <div className="legal-section">
          <div className="legal-section__header">
            <Database size={14} className="legal-icon" />
            <span className="legal-label">Data Sovereignty</span>
          </div>
          <p className="legal-text">
            Your data belongs to you. LyfeCore Hub uses local storage and your private Firebase session 
            to store information. We do not track, sell, or monitor your personal or biometric data.
          </p>
        </div>

        <div className="legal-version-footer">
          <span className="version-label">System Version:</span>
          <span className="version-tag">v1.0.0-Alpha (Bunker Edition)</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .legal-compliance-card {
          border-color: var(--border-subtle);
        }
        .legal-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .legal-section__header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-main);
        }
        .legal-label {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .legal-text {
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-muted);
          font-family: var(--font-sans);
          margin: 0;
        }
        .legal-icon {
          color: var(--primary);
        }
        .legal-version-footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px dashed var(--border-subtle);
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0.7;
        }
        .version-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
        }
        .version-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--primary);
          font-weight: 800;
        }
      `}} />
    </Card>
  );
};

export default LegalCompliance;
