import React from 'react';
import { Sun, Moon, Check, Palette, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/ui/Card';

/**
 * AppearanceSettings — Visual theme management.
 */
const AppearanceSettings = () => {
  const theme = useAppStore((state) => state.ui.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const accentColor = useAppStore((state) => state.ui.accentColor);
  const setAccentColor = useAppStore((state) => state.setAccentColor);

  const THEMES = [
    { id: 'dark', name: 'Bunker Matte', desc: 'High-stealth dark mode', class: 'bunker' },
    { id: 'light', name: 'Field Operative', desc: 'High-contrast light mode', class: 'field' },
    { id: 'cyber', name: 'Cyber Matrix', desc: 'Stealth Neon Protocol', class: 'cyber' },
    { id: 'mono', name: 'Monochrome', desc: 'Pure Minimalist Arch', class: 'mono' },
  ];

  const PRESET_COLORS = [
    { name: 'Command Orange', color: '#F97316' },
    { name: 'Stealth Green', color: '#10b981' },
    { name: 'Plasma Blue', color: '#3b82f6' },
    { name: 'Alert Crimson', color: '#ef4444' },
    { name: 'Cyber Violet', color: '#8b5cf6' },
    { name: 'Matrix Lime', color: '#84cc16' },
  ];

  return (
    <div className="appearance-settings-container">
      <Card className="settings-section">
        <div className="settings-section__header">
          <div className="settings-section__title">
            <Palette size={20} />
            <span>Interface Appearance</span>
          </div>
        </div>
        <div className="settings-section__content">
          <p className="settings-description">
            Choose the visual operational environment that best fits your current mission.
          </p>
          
          <div className="theme-selector-grid">
            {THEMES.map((t) => (
              <button 
                key={t.id}
                className={`theme-option ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                <div className={`theme-preview ${t.class}`}>
                  <div className="preview-accent" />
                </div>
                <div className="theme-info">
                  <span className="theme-name">{t.name}</span>
                  <span className="theme-desc">{t.desc}</span>
                  {theme === t.id && <Check size={14} className="active-check" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="settings-section" style={{ marginTop: '24px' }}>
        <div className="settings-section__header">
          <div className="settings-section__title">
            <Sparkles size={20} />
            <span>Tactical Accent Color</span>
          </div>
        </div>
        <div className="settings-section__content">
          <p className="settings-description">
            Define your operational brand. This color will be applied across all interactive elements.
          </p>

          <div className="accent-picker-grid">
            <div className="accent-presets">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.color}
                  className={`accent-preset-btn ${accentColor === preset.color ? 'active' : ''}`}
                  onClick={() => setAccentColor(preset.color)}
                  title={preset.name}
                  style={{ backgroundColor: preset.color }}
                >
                  {accentColor === preset.color && <Check size={16} color="white" />}
                </button>
              ))}
            </div>

            <div className="accent-custom">
              <label className="settings-row__label">Custom Signature</label>
              <div className="color-input-wrapper">
                <input 
                  type="color" 
                  value={accentColor || '#F97316'} 
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="color-input-native"
                />
                <input 
                  type="text" 
                  value={(accentColor || '#F97316').toUpperCase()}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="color-input-text"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
