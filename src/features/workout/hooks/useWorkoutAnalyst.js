import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';
import useWorkoutStore from './useWorkout';

/**
 * useWorkoutAnalyst — Hook to analyze training progress using AI.
 */
export default function useWorkoutAnalyst() {
  const [analysis, setAnalysis] = useState(localStorage.getItem('lyfecore_workout_analysis') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { recentSessions } = useWorkoutStore();

  const analyzeProgress = useCallback(async () => {
    if (!recentSessions || recentSessions.length < 2) {
      setError('Insufficient data. Track at least 2 sessions for analysis.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Extract exercise progress data
      const exerciseData = {};
      
      recentSessions.forEach(session => {
        session.exercises.forEach(ex => {
          if (!exerciseData[ex.name]) exerciseData[ex.name] = [];
          
          // Get max weight for this exercise in this session
          const maxWeight = Math.max(...ex.sets.map(s => s.weight || 0));
          exerciseData[ex.name].push({
            date: session.startTime,
            weight: maxWeight,
            reps: ex.sets[0]?.reps || 0 // Representative reps
          });
        });
      });

      const prompt = `
        Eres un Analista de Rendimiento Deportivo de alto nivel.
        Analiza los siguientes datos de entrenamiento del usuario y detecta progresos o estancamientos (plateaus).
        
        DATOS DE EJERCICIOS:
        ${JSON.stringify(exerciseData, null, 2)}
        
        INSTRUCCIONES:
        1. Identifica al menos 2 ejercicios donde haya progreso real o estancamiento.
        2. Proporciona una recomendación táctica (ej. "Aumenta 2kg", "Cambia el rango de reps", "Aumenta el descanso").
        3. Mantén un tono profesional, técnico y motivador.
        4. Sé conciso (máximo 2 párrafos cortos).
        5. Habla en español.
      `;

      const chatWithGemini = httpsCallable(functions, 'chatWithGemini');
      const result = await chatWithGemini({ prompt });
      
      const newAnalysis = result.data.text;
      setAnalysis(newAnalysis);
      localStorage.setItem('lyfecore_workout_analysis', newAnalysis);
    } catch (err) {
      console.error('Failed to analyze workout:', err);
      setError('Biometric analysis link failed. Check local node.');
    } finally {
      setLoading(false);
    }
  }, [recentSessions]);

  return { analysis, loading, error, analyzeProgress };
}
