import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn('VITE_ANTHROPIC_API_KEY is not set');
}

const anthropic = new Anthropic({
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true, // For MVP - move to backend in production
});

export const generateCopingStrategies = async (
  emotionName: string,
  emotionDescription: string
): Promise<string[]> => {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `A user is experiencing the emotion "${emotionName}": ${emotionDescription}

Please provide 4-5 practical, actionable coping strategies for managing this emotion. Each strategy should be:
- Specific and actionable
- Evidence-based when possible
- Varied (immediate actions, breathing exercises, reframing techniques, physical activities, social connection, etc.)
- Supportive and non-judgmental in tone
- Between 1-2 sentences each

Format your response as a JSON array of strings, like this:
["Strategy 1", "Strategy 2", "Strategy 3", "Strategy 4", "Strategy 5"]

ONLY return the JSON array, nothing else.`
      }]
    });

    const content = message.content[0];
    if (content.type === 'text') {
      try {
        // Extract JSON from the response
        const jsonMatch = content.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(content.text);
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        // Fallback parsing if not JSON
        return content.text
          .split('\n')
          .filter(s => s.trim().length > 0)
          .slice(0, 5);
      }
    }
    
    return [];
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
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `The user has logged feeling "${emotionName}" ${frequency} times recently. Provide a brief, supportive insight about what this might mean and a gentle suggestion. Keep it under 50 words.`
      }]
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    
    return '';
  } catch (error) {
    console.error('Error analyzing mood:', error);
    throw error;
  }
};
