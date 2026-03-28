import express, { Request, Response } from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

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

// Supabase admin client for server-side writes (requires service role key)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseServiceRole) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
} else {
  console.warn('Supabase admin client not configured. Server persistence endpoints will fail without SUPABASE_SERVICE_ROLE_KEY.');
}

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
    const { emotionName, emotionDescription, emotionId, level } = req.body;

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

      // Persist AI-generated strategies to coping_strategies table
      try {
        if (emotionId && strategies.length > 0) {
          if (!supabaseAdmin) {
            console.warn('supabaseAdmin not configured — cannot persist coping strategies. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
          } else {
            // Fetch existing strategies for this emotion to avoid duplicates
            const { data: existingRows, error: selectErr } = await supabaseAdmin
              .from('coping_strategies')
              .select('strategy_text')
              .eq('emotion_id', emotionId);

            if (selectErr) {
              console.error('Error checking existing strategies before insert:', selectErr.message || selectErr);
            }

            const existingSet = new Set(
              (existingRows || []).map((r: any) => String(r.strategy_text || '').trim().toLowerCase())
            );

            const rowsToInsert = strategies
              .map((s) => ({
                emotion_id: emotionId,
                strategy_text: s,
                generated_by: 'ai' as const,
              }))
              .filter((r) => !existingSet.has(r.strategy_text.trim().toLowerCase()));

            if (rowsToInsert.length > 0) {
              console.log(`Inserting ${rowsToInsert.length} strategies for emotion ID ${emotionId}:`, JSON.stringify(rowsToInsert));
              const { data: insertData, error: insertErr } = await supabaseAdmin
                .from('coping_strategies')
                .insert(rowsToInsert)
                .select();

              if (insertErr) {
                console.error('Failed to persist strategies:', insertErr.message, insertErr.details, insertErr.hint);
              } else {
                console.log(`Persisted ${insertData?.length ?? 0} new strategies for emotion ID ${emotionId}`);
              }
            } else {
              console.log(`All strategies already exist for emotion ID ${emotionId} — nothing to insert`);
            }
          }
        } else if (!emotionId) {
          console.warn('No emotionId in request body — skipping coping strategy persistence');
        }
      } catch (persistErr) {
        console.error('Error persisting strategies on server:', persistErr instanceof Error ? persistErr.stack : persistErr);
      }

      return res.json({ strategies, fromCache: false });
    }

    return res.json({ strategies: [], fromCache: false });
  } catch (error) {
    console.error('Error generating coping strategies:', error instanceof Error ? error.stack || error.message : error);
    const isProd = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: isProd ? 'Failed to generate coping strategies' : (error instanceof Error ? error.message : 'Unknown error'),
      ...(isProd ? {} : { stack: error instanceof Error ? error.stack : undefined }),
    });
  }
});

// Fetch existing coping strategies for an emotion (server-side read)
app.get('/api/coping-strategies', async (req: Request, res: Response) => {
  try {
    const emotionId = Number(req.query.emotionId);
    if (!emotionId || !supabaseAdmin) {
      return res.status(400).json({ error: 'Missing emotionId or server not configured' });
    }

    const { data, error } = await supabaseAdmin
      .from('coping_strategies')
      .select('strategy_text')
      .eq('emotion_id', emotionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error querying coping_strategies on server:', error);
      return res.status(500).json({ error: 'Failed to query coping strategies' });
    }

    const strategies = (data || []).map((r: any) => r.strategy_text || r.strategyText || String(r));
    return res.json({ strategies });
  } catch (err) {
    console.error('Error in GET /api/coping-strategies:', err instanceof Error ? err.stack || err.message : err);
    const isProd = process.env.NODE_ENV === 'production';
    return res.status(500).json({ error: isProd ? 'Internal server error' : (err instanceof Error ? err.message : 'Internal server error') });
  }
});

// Health endpoint to check DB read/write using the service role key
app.get('/api/health-db', async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ ok: false, error: 'supabaseAdmin not configured' });

    // Simple read check
    const { data: readData, error: readErr } = await supabaseAdmin.from('emotions').select('id').limit(1);
    if (readErr) {
      console.error('DB read check failed:', readErr.message || readErr);
      return res.status(500).json({ ok: false, stage: 'read', error: readErr.message || String(readErr) });
    }

    // Try a write and delete (healthcheck) in coping_strategies to ensure inserts work
    const testRow = { emotion_id: null, strategy_text: 'healthcheck', generated_by: 'healthcheck' } as any;
    const { data: insertData, error: insertErr } = await supabaseAdmin.from('coping_strategies').insert(testRow).select().single();
    if (insertErr) {
      console.error('DB write check failed:', insertErr.message || insertErr);
      return res.status(500).json({ ok: false, stage: 'write', error: insertErr.message || String(insertErr) });
    }

    // Cleanup inserted test row
    try {
      await supabaseAdmin.from('coping_strategies').delete().eq('id', insertData.id);
    } catch (cleanupErr) {
      console.warn('Healthcheck cleanup failed:', cleanupErr);
    }

    return res.json({ ok: true, read: Array.isArray(readData) ? readData.length : 0, write: !!insertData });
  } catch (err) {
    console.error('Error in /api/health-db:', err instanceof Error ? err.stack || err.message : err);
    return res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'unknown' });
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

// Get paginated emotion logs with breadcrumb (tier path) for the authenticated user
app.get('/api/emotion-logs', async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Server not configured for DB access' });

    // Authenticate via Bearer token
    const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: 'Invalid access token' });
    }
    const userId = userData.user.id;

    // Pagination params
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get total count
    const { count, error: countErr } = await supabaseAdmin
      .from('emotion_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countErr) {
      console.error('Error counting emotion logs:', countErr);
      return res.status(500).json({ error: 'Failed to count logs' });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Get logs with joined emotion data
    const { data: logs, error: logsErr } = await supabaseAdmin
      .from('emotion_logs')
      .select(`
        id, emotion_id, notes, logged_at, created_at,
        emotion:emotions!inner(id, name, color, tier, parent_id)
      `)
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .range(from, to);

    if (logsErr) {
      console.error('Error fetching emotion logs:', logsErr);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    // Build breadcrumbs: for each log, walk up the parent chain to build Tier1 > Tier2 > Tier3
    // First, collect all unique emotion ids we need to resolve parents for
    const emotionIds = new Set<number>();
    for (const log of (logs || [])) {
      const em = (log as any).emotion;
      if (em) {
        emotionIds.add(em.id);
        if (em.parent_id) emotionIds.add(em.parent_id);
      }
    }

    // Fetch all emotions we might need (parents/grandparents)
    let emotionMap: Record<number, { id: number; name: string; color: string; tier: number; parent_id: number | null }> = {};
    if (emotionIds.size > 0) {
      // We need up to 3 levels, so fetch all emotions referenced plus their parents
      const { data: allEmotions } = await supabaseAdmin
        .from('emotions')
        .select('id, name, color, tier, parent_id');
      if (allEmotions) {
        for (const e of allEmotions) {
          emotionMap[e.id] = e;
        }
      }
    }

    // Build breadcrumb string for an emotion id
    function buildBreadcrumb(emotionId: number): string {
      const parts: string[] = [];
      let current = emotionMap[emotionId];
      while (current) {
        parts.unshift(current.name);
        current = current.parent_id ? emotionMap[current.parent_id] : (undefined as any);
      }
      return parts.join(' › ');
    }

    const result = (logs || []).map((log: any) => ({
      id: log.id,
      emotionId: log.emotion_id,
      emotionName: log.emotion?.name || 'Unknown',
      emotionColor: log.emotion?.color || '#6B7280',
      breadcrumb: log.emotion ? buildBreadcrumb(log.emotion.id) : 'Unknown',
      notes: log.notes || null,
      loggedAt: log.logged_at,
    }));

    return res.json({ logs: result, total, page, pageSize, totalPages });
  } catch (err) {
    console.error('Error in GET /api/emotion-logs:', err instanceof Error ? err.stack || err.message : err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Log an emotion on behalf of a user. Expects { userId, emotionId, notes }
app.post('/api/log-emotion', async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: 'Server not configured for DB writes' });

    const { emotionId, notes } = req.body || {};

    // Prefer token-based verification. If Authorization header with Bearer token is provided,
    // validate it with Supabase and use the verified user id.
    let userIdToUse: string | null = null;
    const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token as string);
        if (userErr) {
          console.error('Token verification failed:', userErr);
          return res.status(401).json({ error: 'Invalid access token' });
        }
        if (!userData || !userData.user) {
          return res.status(401).json({ error: 'Invalid access token' });
        }
        userIdToUse = userData.user.id;
      } catch (e) {
        console.error('Error verifying token:', e instanceof Error ? e.stack || e.message : e);
        return res.status(500).json({ error: 'Failed to verify access token' });
      }
    }

    // Require a valid access token — no unauthenticated fallback
    if (!userIdToUse) {
      return res.status(401).json({ error: 'Authentication required. Please sign in to log emotions.' });
    }

    if (!emotionId) return res.status(400).json({ error: 'Missing emotionId' });

    // Validate emotion exists
    try {
      const { data: emotionRow, error: emotionErr } = await supabaseAdmin
        .from('emotions')
        .select('id')
        .eq('id', emotionId)
        .limit(1)
        .single();

      if (emotionErr || !emotionRow) {
        console.error('Error validating emotion id:', emotionErr);
        return res.status(400).json({ error: 'Invalid emotionId' });
      }
    } catch (e) {
      console.error('Exception validating emotion id:', e);
      return res.status(500).json({ error: 'Failed to validate emotion id' });
    }

    const payload = {
      user_id: userIdToUse,
      emotion_id: emotionId,
      notes: notes || null,
      logged_at: new Date().toISOString(),
    } as any;

    const { data, error } = await supabaseAdmin.from('emotion_logs').insert(payload).select().single();
    if (error) {
      console.error('Error inserting emotion_log on server:', error instanceof Error ? error.stack || error.message : error);
      const isProd = process.env.NODE_ENV === 'production';
      return res.status(500).json({ error: isProd ? 'Failed to insert emotion log' : (error instanceof Error ? error.message : String(error)) });
    }

    return res.json({ log: data });
  } catch (err) {
    console.error('Error in /api/log-emotion:', err instanceof Error ? err.stack || err.message : err);
    const isProd = process.env.NODE_ENV === 'production';
    return res.status(500).json({ error: isProd ? 'Internal server error' : (err instanceof Error ? err.message : String(err)) });
  }
});