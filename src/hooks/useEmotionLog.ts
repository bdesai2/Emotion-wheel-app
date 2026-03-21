import { useState } from 'react';
import { supabase } from '../services/supabase';
import type { EmotionLog } from '../types/emotion.types';

const GUEST_EMOTIONS_KEY = 'guest_emotion_logs';

export const useEmotionLog = (isGuest: boolean = false) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logEmotion = async (data: {
    emotionId: number;
    notes?: string;
  }): Promise<EmotionLog | null> => {
    try {
      setLoading(true);
      setError(null);

      if (isGuest) {
        // Store guest emotion logs in localStorage using app's EmotionLog shape
        const emotionLog: EmotionLog = {
          id: Date.now().toString(),
          userId: 'guest',
          emotionId: data.emotionId,
          notes: data.notes,
          loggedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        } as EmotionLog;

        const existingLogs = JSON.parse(localStorage.getItem(GUEST_EMOTIONS_KEY) || '[]');
        existingLogs.push(emotionLog);
        localStorage.setItem(GUEST_EMOTIONS_KEY, JSON.stringify(existingLogs));

        setLoading(false);
        return emotionLog;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Call server endpoint to log emotion (server uses service role key)
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const resp = await fetch(`${API_BASE_URL}/api/log-emotion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            emotionId: data.emotionId,
            notes: data.notes
          }),
        });

        if (!resp.ok) {
          const errJson = await resp.json().catch(() => ({}));
          throw new Error(errJson.error || 'Failed to log emotion');
        }

        const json = await resp.json();
        const result = json.log || json;

        const mapped: EmotionLog = {
          id: (result && (result.id ? String(result.id) : Date.now().toString())) || Date.now().toString(),
          userId: result?.user_id || user.id,
          emotionId: result?.emotion_id || data.emotionId,
          notes: result?.notes || data.notes,
          loggedAt: result?.logged_at || new Date().toISOString(),
          createdAt: result?.created_at || new Date().toISOString(),
        } as EmotionLog;

        setLoading(false);
        return mapped;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log emotion';
      setError(message);
      setLoading(false);
      return null;
    }
  };

  const getEmotionLogs = async (limit = 50): Promise<EmotionLog[]> => {
    try {
      setLoading(true);
      setError(null);

      if (isGuest) {
        // Retrieve guest emotion logs from localStorage
        const existingLogs = JSON.parse(localStorage.getItem(GUEST_EMOTIONS_KEY) || '[]');
        setLoading(false);
        return existingLogs.slice(-limit).reverse() as EmotionLog[];
      } else {
        const { data, error: err } = await supabase
          .from('emotion_logs')
          .select(`
            *,
            emotion:emotions(name, color)
          `)
          .order('logged_at', { ascending: false })
          .limit(limit);

        if (err) throw err;
        setLoading(false);
        return (data as EmotionLog[]) || [];
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch emotion logs';
      setError(message);
      setLoading(false);
      return [];
    }
  };

  return { logEmotion, getEmotionLogs, loading, error };
};
