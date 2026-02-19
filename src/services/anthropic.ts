const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const generateCopingStrategies = async (
  emotionName: string,
  emotionDescription: string
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
    return data.strategies || [];
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
