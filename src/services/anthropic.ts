const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

import { supabase } from './supabase';

export const generateCopingStrategies = async (
  emotionName: string,
  emotionDescription: string,
  emotionId?: number
): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coping-strategies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emotionName,
        emotionDescription,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate coping strategies');
    }

    const data = await response.json();
    const strategies: string[] = data.strategies || [];

    // If an emotionId was provided, persist the generated strategies to the DB.
console.log(`Generated ${strategies.length} strategies for emotion "${emotionName} ${emotionId}". Persisting to DB...`);
    if (emotionId && strategies.length > 0) {
      try {
console.log(`Saving generated strategies for emotion ID ${emotionId} to Supabase...`);
        await saveCopingStrategiesForEmotion(emotionId, strategies);
      } catch (saveErr) {
        console.error('Failed to save generated strategies:', saveErr);
      }
    }

    return strategies;
  } catch (error) {
    console.error('Error generating coping strategies:', error);
    throw error;
  }
};

// Save generated strategies to the `coping_strategies` table for a given emotion id.
export const saveCopingStrategiesForEmotion = async (
  emotionId: number,
  strategies: string[]
) => {
  if (!emotionId || !strategies || strategies.length === 0) return;
  console.log(`Saving ${strategies.length} strategies for emotion ID ${emotionId} to Supabase...`);
  const rows = strategies.map((s) => ({
    emotion_id: emotionId,
    strategy_text: s,
    generated_by: 'ai',
  }));

  const { data, error } = await supabase.from('coping_strategies').insert(rows).select();
  if (error) {
    console.error('Error saving coping strategies to Supabase:', error);
    return { error };
  }
  return { data };
};

export const analyzeMood = async (
  emotionName: string,
  frequency: number
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emotionName,
        frequency,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze mood');
    }

    const data = await response.json();
    return data.analysis || '';
  } catch (error) {
    console.error('Error analyzing mood:', error);
    throw error;
  }
};
