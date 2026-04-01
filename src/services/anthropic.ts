const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Debug log to verify API base URL at runtime in deployed environments
// (Safe to leave; remove later if you prefer a quieter console.)
// eslint-disable-next-line no-console
console.log('[Emotion Wheel] API_BASE_URL:', API_BASE_URL);

export const generateCopingStrategies = async (
  emotionName: string,
  emotionDescription: string,
  emotionId?: number,
  level?: number
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
        emotionId,
        level,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate coping strategies');
    }

    const data = await response.json();
    const strategies: string[] = data.strategies || [];

    console.log(`Generated ${strategies.length} strategies for emotion "${emotionName}".`);
    return strategies;
  } catch (error) {
    console.error('Error generating coping strategies:', error);
    throw error;
  }
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
