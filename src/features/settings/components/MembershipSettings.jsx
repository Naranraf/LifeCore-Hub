import React, { useState } from 'react';
import { Crown, Zap, ShieldCheck, ArrowRight, Loader2, Star } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import useAuthStore from '../../../hooks/useAuth';
import Card from '../../../components/ui/Card';

const MembershipSettings = () => {
  const { user, profile } = useAuthStore();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const isPremium = profile?.isPremium || false;
  const usageCount = profile?.geminiUsageCount || 0;
  const maxFree = 100;

  const handleUpgrade = async () => {
    if (!user) return;
    setIsUpgrading(true);
    
    try {
      const { httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../../../lib/firebase');
      
      // CALL SECURE SERVER-SIDE FUNCTION
      const fulfillUpgrade = httpsCallable(functions, 'fulfillUpgrade');
      const result = await fulfillUpgrade();
      
      if (result.data.success) {
        console.log('User elevated via secure server-side link.');
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
      alert('Security Protocol: Upgrade failed. Tactical link error.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Card className="settings-section glass-panel">
      <div className="settings-section__header">
        <Crown size={20} className={isPremium ? 'text-warning' : 'text-muted'} />
        <div>
          <h3 className="stats-number">Tactical Membership</h3>
          <p className="settings-section__desc">Manage your AI intelligence quota and operational tier.</p>
        </div>
      </div>

      <div className="membership-status">
        <div className="membership-status__tier">
          <span className="label">Current Tier:</span>
          <span className={`tier-badge ${isPremium ? 'premium' : 'free'}`}>
            {isPremium ? 'ELITE OPERATOR' : 'FIELD AGENT (FREE)'}
          </span>
        </div>

        {!isPremium && (
          <div className="membership-usage">
            <div className="usage-header">
              <span>Gemini Tactical Quota</span>
              <span>{usageCount} / {maxFree} messages</span>
            </div>
            <div className="usage-bar">
              <div 
                className="usage-fill" 
                style={{ width: `${Math.min((usageCount / maxFree) * 100, 100)}%` }}
              ></div>
            </div>
            {usageCount >= maxFree && (
              <p className="usage-warning">
                <Zap size={12} /> Intelligence quota exhausted. Upgrade required for neural link.
              </p>
            )}
          </div>
        )}

        {isPremium ? (
          <div className="membership-premium-info">
            <ShieldCheck size={32} className="text-success" />
            <div>
              <h4 className="stats-number">Elite Status Active</h4>
              <p>Unlimited neural-link access enabled. All AI modules operational.</p>
            </div>
          </div>
        ) : (
          <div className="membership-upgrade-card">
            <div className="upgrade-features">
              <div className="feature-item"><Star size={14} /> Unlimited AI Queries</div>
              <div className="feature-item"><Star size={14} /> Priority Neural Processing</div>
              <div className="feature-item"><Star size={14} /> Advanced Financial Analytics</div>
            </div>
            
            <button 
              className="upgrade-btn" 
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? (
                <><Loader2 size={16} className="spin" /> Syncing with Stripe... Capitalizing Hub...</>
              ) : (
                <>Upgrade to Elite <ArrowRight size={16} /></>
              )}
            </button>
            <p className="upgrade-note">Testing Mode: Upgrade is currently simulated (free).</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MembershipSettings;
