import React, { useState, useEffect } from 'react';
import { Apple, Scale, Plus, Trash2, TrendingUp, Loader2, PieChart } from 'lucide-react';
import useNutritionStore from '../hooks/useNutrition';
import { calculateMacros, FOOD_DATABASE } from '../utils/nutritionUtils';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import MacroRing from './MacroRing';
import MealModal from './MealModal';
import './Nutrition.css';

/**
 * Nutrition — Dedicated Nutrition Management Module.
 */
const Nutrition = () => {
  const { 
    logs, currentMacros, loading, initListener, addLog, deleteLog, cleanup 
  } = useNutritionStore();

  const [selectedFood, setSelectedFood] = useState('pollo');
  const [weight, setWeight] = useState(100);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    initListener();
    return () => cleanup();
  }, []);

  const handleQuickAdd = async () => {
    const macros = calculateMacros(selectedFood, weight);
    const foodName = FOOD_DATABASE[selectedFood].name;
    
    await addLog({
      name: foodName,
      weight,
      type: 'meal',
      ...macros
    });
  };

  const handleModalSave = async (data) => {
    await addLog({
      ...data,
      type: 'meal'
    });
  };

  return (
    <div className="nutrition-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em' }}>Nutrition</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Track your fuel and optimize your health.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Custom Meal
        </Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Quick Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Apple size={18} color="var(--accent)" /> Quick Add
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Food Template</label>
                <select 
                  className="lyfe-select" 
                  value={selectedFood}
                  onChange={(e) => setSelectedFood(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--glass-border)', border: '1px solid var(--border-color)', color: 'white' }}
                >
                  {Object.keys(FOOD_DATABASE).map(id => (
                    <option key={id} value={id}>{FOOD_DATABASE[id].name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Portion (grams)</label>
                <input 
                  type="number" 
                  className="modal-input" 
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--glass-border)', border: '1px solid var(--border-color)', color: 'white' }}
                />
              </div>

              <Button variant="glass" onClick={handleQuickAdd} disabled={loading} style={{ width: '100%' }}>
                {loading ? <Loader2 className="spin" size={18} /> : 'Quick Log'}
              </Button>
            </div>
          </Card>

          {/* Macro Chart */}
          {(currentMacros.protein > 0 || currentMacros.carbs > 0 || currentMacros.fat > 0) && (
            <Card className="glass-panel" style={{ padding: '0' }}>
              <MacroRing 
                protein={currentMacros.protein} 
                carbs={currentMacros.carbs} 
                fat={currentMacros.fat} 
              />
            </Card>
          )}
        </div>

        {/* Totals & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card className="glass-panel" style={{ padding: '24px', background: 'var(--accent-gradient)', border: 'none' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', color: 'rgba(255,255,255,0.8)' }}>Daily Intake Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '900' }}>{currentMacros.calories}</div>
                <div style={{ fontSize: '10px', fontWeight: '700', opacity: 0.8 }}>KCAL</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900' }}>{currentMacros.protein}g</div>
                <div style={{ fontSize: '10px', fontWeight: '700', opacity: 0.8 }}>PROT</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900' }}>{currentMacros.carbs}g</div>
                <div style={{ fontSize: '10px', fontWeight: '700', opacity: 0.8 }}>CARB</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '900' }}>{currentMacros.fat}g</div>
                <div style={{ fontSize: '10px', fontWeight: '700', opacity: 0.8 }}>FAT</div>
              </div>
            </div>
          </Card>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--accent)" /> Intake History
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
              {logs.filter(l => l.type === 'meal').map(log => (
                <Card key={log.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{log.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.weight ? `${log.weight}g · ` : ''}{log.calories} kcal</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '800', background: 'var(--glass-border)', padding: '4px 8px', borderRadius: '6px' }}>
                      P:{log.protein} / C:{log.carbs} / F:{log.fat}
                    </div>
                    <button onClick={() => deleteLog(log.id)} style={{ color: 'var(--error)', opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Card>
              ))}
              {logs.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                  No nutrition logs recorded today.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MealModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default Nutrition;
