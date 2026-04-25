import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';
import useFinanceStore from '../../finance/hooks/useFinance';
import useWorkoutStore from '../../workout/hooks/useWorkout';
import useTasksStore from '../../productivity/hooks/useTasks';
import useAuthStore from '../../../hooks/useAuth';

/**
 * useExecutiveSummary — Hook to generate tactical daily briefs.
 */
export default function useExecutiveSummary() {
  const [summary, setSummary] = useState(localStorage.getItem('lyfecore_exec_summary') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { profile } = useAuthStore();
  const { getTelemetry, currency } = useFinanceStore();
  const { recentSessions } = useWorkoutStore();
  const { tasks } = useTasksStore();

  const generateSummary = useCallback(async (force = false) => {
    // Basic rate limiting/caching: only generate once per hour unless forced
    const lastGen = localStorage.getItem('lyfecore_exec_summary_ts');
    const now = Date.now();
    
    if (!force && lastGen && (now - parseInt(lastGen)) < 3600000 && summary) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const finance = getTelemetry();
      const pendingTasks = (tasks || []).filter(t => t.status === 'pending').slice(0, 5);
      
      const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
      
      const context = {
        userName: profile?.displayName || 'Operator',
        weekday,
        finance: {
          balance: finance.netBalance,
          goal: finance.savingGoal,
          currency,
          cashflow: finance.monthlyCashflow
        },
        tasks: pendingTasks.map(t => t.title),
        workout: {
          recentCount: recentSessions.length,
          lastSession: recentSessions[0]?.templateName || 'None'
        }
      };

      const prompt = `
        Eres el Sistema de Inteligencia Táctica de LyfeCore Hub. 
        Genera un "Resumen Ejecutivo" de UN SOLO PÁRRAFO para el usuario.
        
        DATOS DEL USUARIO:
        - Nombre: ${context.userName}
        - Día: ${context.weekday}
        - Finanzas: Balance ${context.currency} ${context.finance.balance}, Meta ${context.finance.goal}, Cashflow mensual ${context.finance.cashflow}
        - Tareas Pendientes: ${context.tasks.join(', ') || 'Ninguna'}
        - Entrenamiento: Último fue ${context.workout.lastSession}.
        
        INSTRUCCIONES:
        1. Sé directo, motivador y usa un tono militar/táctico (ej. "General", "Comandante", "Operativo").
        2. Menciona cuánto dinero le queda para la semana/mes de forma inteligente basado en su balance.
        3. Si tiene tareas, dile en qué enfocarse (prioriza 1 o 2).
        4. Menciona algo sobre su salud/entrenamiento (ej. "Hoy es día de X" o "Buen progreso en Y").
        5. Máximo 3-4 oraciones.
      `;

      const chatWithGemini = httpsCallable(functions, 'chatWithGemini');
      const result = await chatWithGemini({ prompt });
      
      const newSummary = result.data.text;
      setSummary(newSummary);
      localStorage.setItem('lyfecore_exec_summary', newSummary);
      localStorage.setItem('lyfecore_exec_summary_ts', now.toString());
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError('Intelligence systems offline. Retrying link...');
    } finally {
      setLoading(false);
    }
    // We intentionally exclude 'summary' and 'loading' from deps to avoid loops.
    // They are read from the closure or are not needed for the logic itself.
  }, [profile, getTelemetry, currency, recentSessions, tasks]);

  return { summary, loading, error, generateSummary };
}
