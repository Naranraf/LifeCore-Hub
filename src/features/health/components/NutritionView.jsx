import React, { useState } from 'react';
import { Apple, Scale, Plus, Info, Trash2, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { calculateMacros, FOOD_DATABASE } from '../utils/nutritionUtils';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

/**
 * NutritionView — TIER 2 Nutrition Engine.
 * Features:
 * - Edge Calculation (instant macro math).
 * - Food selector from local DB.
 * - Real-time macro summary syncing with Zustand.
 */
const NutritionView = () => {
  const { nutrition, addNutritionLog, clearNutrition } = useAppStore();
  const [selectedFood, setSelectedFood] = useState('pollo');
  const [weight, setWeight] = useState(100);

  const handleAddLog = () => {
    const macros = calculateMacros(selectedFood, weight);
    const foodName = FOOD_DATABASE[selectedFood].name;
    
    addNutritionLog({
      id: crypto.randomUUID(),
      name: foodName,
      weight,
      ...macros,
      timestamp: Date.now()
    });
  };

  const { currentMacros, dailyLogs } = nutrition;

  return (
    <div className="tier1-marker" style={{ border: '2px solid var(--warning)', borderRadius: '16px', padding: '4px', background: 'rgba(245, 158, 11, 0.05)', marginTop: '24px' }}>
      <div style={{ background: 'var(--warning)', color: 'white', fontSize: '10px', fontWeight: '900', padding: '2px 10px', borderRadius: '12px 12px 0 0', display: 'inline-block' }}>NUTRITION ENGINE (TIER 2)</div>
      
      <div className="nutrition-view" style={{ padding: '20px' }}>
        <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Nutrition Engine</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Precision edge-computed macro tracking.</p>
          </div>
          <Button variant="glass" size="small" onClick={clearNutrition} disabled={dailyLogs.length === 0}>
            Reset Daily
          </Button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Input Panel */}
          <Card style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Apple size={14} /> Select Food</label>
                <select 
                  className="lyfe-select" 
                  value={selectedFood}
                  onChange={(e) => setSelectedFood(e.target.value)}
                >
                  {Object.keys(FOOD_DATABASE).map(id => (
                    <option key={id} value={id}>{FOOD_DATABASE[id].name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Scale size={14} /> Weight (grams)</label>
                <input 
                  type="number" 
                  className="modal-input" 
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>

              <div style={{ background: 'var(--glass-border)', padding: '12px', borderRadius: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Est. Calories:</span>
                  <span style={{ color: 'var(--warning)', fontWeight: '700' }}>{calculateMacros(selectedFood, weight).calories} kcal</span>
                </div>
                <p style={{ fontSize: '11px', opacity: 0.8 }}>*Calculated locally via Nutrition Engine V2.</p>
              </div>

              <Button variant="primary" onClick={handleAddLog}>
                <Plus size={18} /> Add to Daily Intake
              </Button>
            </div>
          </Card>

          {/* Results & Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Card style={{ padding: '20px', background: 'var(--accent-gradient)', color: 'white' }}>
              <h3 style={{ fontSize: '12px', opacity: 0.9, textTransform: 'uppercase', marginBottom: '12px' }}>Daily Total Macros</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{currentMacros.calories}</div>
                  <div style={{ fontSize: '9px', opacity: 0.8 }}>KCAL</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{currentMacros.protein}g</div>
                  <div style={{ fontSize: '9px', opacity: 0.8 }}>PROT</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{currentMacros.carbs}g</div>
                  <div style={{ fontSize: '9px', opacity: 0.8 }}>CARB</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{currentMacros.fat}g</div>
                  <div style={{ fontSize: '9px', opacity: 0.8 }}>FAT</div>
                </div>
              </div>
            </Card>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '250px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={14} /> Log History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dailyLogs.map(log => (
                  <Card key={log.id} style={{ padding: '10px 14px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{log.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.weight}g · {log.calories} kcal</div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '700' }}>
                      P:{log.protein} / C:{log.carbs} / F:{log.fat}
                    </div>
                  </Card>
                ))}
                {dailyLogs.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px' }}>No logs yet today.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionView;
