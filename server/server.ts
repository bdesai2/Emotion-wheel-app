import express, { Request, Response } from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('VITE_ANTHROPIC_API_KEY is not set in .env.local');
  process.exit(1);
}

const modelName = process.env.ANTHROPIC_MODEL_NAME || 'claude-3-5-sonnet-20241022';
console.log(`Using model: ${modelName}`);

const anthropic = new Anthropic({ apiKey });

// Cache configuration
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_EXPIRY_DAYS = 30;
const CACHE_EXPIRY_MS = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Generate cache key from emotion data
function generateCacheKey(emotionName: string, emotionDescription: string): string {
  const data = `${emotionName}:${emotionDescription}`;
  return crypto.createHash('md5').update(data).digest('hex');
}

// Check if cache exists and is valid
function getCachedResponse(cacheKey: string): string | null {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  if (!fs.existsSync(cacheFile)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    const age = Date.now() - data.timestamp;
    
    if (age > CACHE_EXPIRY_MS) {
      fs.unlinkSync(cacheFile);
      return null;
    }
    
    return data.response;
  } catch (e) {
    console.error('Error reading cache:', e);
    return null;
  }
}

// Save response to cache
function cacheResponse(cacheKey: string, response: string): void {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    fs.writeFileSync(
      cacheFile,
      JSON.stringify({
        timestamp: Date.now(),
        response,
      })
    );
  } catch (e) {
    console.error('Error writing cache:', e);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Endpoint to generate coping strategies
app.post('/api/coping-strategies', async (req: Request, res: Response) => {
  try {
    const { emotionName, emotionDescription, level } = req.body;

    if (!emotionName || !emotionDescription) {
      return res.status(400).json({
        error: 'Missing required fields: emotionName or emotionDescription',
      });
    }

    // Check cache for level 3 emotions
    let strategies: string[] = [];
    let fromCache = false;

    if (level === 3) {
      const cacheKey = generateCacheKey(emotionName, emotionDescription);
      const cachedResponse = getCachedResponse(cacheKey);
      
      if (cachedResponse) {
        strategies = JSON.parse(cachedResponse);
        fromCache = true;
        console.log(`Cache hit for emotion: ${emotionName}`);
        return res.json({ strategies, fromCache });
      }
    }

    // Call Anthropic API if no cache
    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `A user is experiencing the emotion "${emotionName}": ${emotionDescription}

Please provide 4-5 practical, actionable coping strategies for managing this emotion. Each strategy should be:
- Specific and actionable
- Evidence-based when possible
- Varied (immediate actions, breathing exercises, reframing techniques, physical activities, social connection, etc.)
- Supportive and non-judgmental in tone
- Between 1-2 sentences each

Format your response as a JSON array of strings, like this:
["Strategy 1", "Strategy 2", "Strategy 3", "Strategy 4", "Strategy 5"]

ONLY return the JSON array, nothing else.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      try {
        // Extract JSON from the response
        const jsonMatch = content.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          strategies = JSON.parse(jsonMatch[0]);
        } else {
          strategies = JSON.parse(content.text);
        }
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        // Fallback parsing if not JSON
        strategies = content.text
          .split('\n')
          .filter((s: string) => s.trim().length > 0)
          .slice(0, 5);
      }

      // Cache for level 3 emotions
      if (level === 3) {
        const cacheKey = generateCacheKey(emotionName, emotionDescription);
        cacheResponse(cacheKey, JSON.stringify(strategies));
        console.log(`Cached strategies for emotion: ${emotionName}`);
      }

      return res.json({ strategies, fromCache: false });
    }

    return res.json({ strategies: [], fromCache: false });
  } catch (error) {
    console.error('Error generating coping strategies:', error);
    res.status(500).json({
      error: 'Failed to generate coping strategies',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Endpoint to analyze mood
app.post('/api/analyze-mood', async (req: Request, res: Response) => {
  try {
    const { emotionName, frequency } = req.body;

    if (!emotionName || frequency === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: emotionName or frequency',
      });
    }

    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `The user has logged feeling "${emotionName}" ${frequency} times recently. Provide a brief, supportive insight about what this might mean and a gentle suggestion. Keep it under 50 words.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return res.json({ analysis: content.text });
    }

    return res.json({ analysis: '' });
  } catch (error) {
    console.error('Error analyzing mood:', error);
    res.status(500).json({
      error: 'Failed to analyze mood',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});