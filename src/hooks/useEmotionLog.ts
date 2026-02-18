import { useState } from 'react';
import { supabase } from '../services/supabase';
import type { EmotionLog } from '../types/emotion.types';

export const useEmotionLog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logEmotion = async (data: {
    emotionId: number;
    tier1EmotionId: number;
    tier2EmotionId?: number;
    tier3EmotionId?: number;
    notes?: string;
  }): Promise<EmotionLog | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: result, error: err } = await supabase
        .from('emotion_logs')
        .insert({
          user_id: user.id,
          emotion_id: data.emotionId,
          tier_1_emotion_id: data.tier1EmotionId,
          tier_2_emotion_id: data.tier2EmotionId,
          tier_3_emotion_id: data.tier3EmotionId,
          notes: data.notes,
          logged_at: new Date().toISOString()
        })
        .select()
        .single();

      if (err) throw err;
      setLoading(false);
      return result as EmotionLog;
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch emotion logs';
      setError(message);
      setLoading(false);
      return [];
    }
  };

  return { logEmotion, getEmotionLogs, loading, error };
};
