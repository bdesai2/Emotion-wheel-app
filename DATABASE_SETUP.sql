-- Emotion Wheel App - Database Setup SQL
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CREATE EMOTIONS TABLE
-- ============================================
CREATE TABLE emotions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
  parent_id INTEGER REFERENCES emotions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  color VARCHAR(7) NOT NULL,
  characteristics TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. CREATE EMOTION LOGS TABLE
-- ============================================
CREATE TABLE emotion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion_id INTEGER REFERENCES emotions(id),
  tier_1_emotion_id INTEGER REFERENCES emotions(id),
  tier_2_emotion_id INTEGER REFERENCES emotions(id),
  tier_3_emotion_id INTEGER REFERENCES emotions(id),
  notes TEXT,
  logged_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. CREATE COPING STRATEGIES TABLE
-- ============================================
CREATE TABLE coping_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emotion_id INTEGER REFERENCES emotions(id) ON DELETE CASCADE,
  strategy_text TEXT NOT NULL,
  generated_by VARCHAR(50) DEFAULT 'ai', -- 'ai' or 'manual'
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. CREATE USER PREFERENCES TABLE (Future)
-- ============================================
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_enabled BOOLEAN DEFAULT false,
  reminder_time TIME,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_emotion_logs_user_id ON emotion_logs(user_id);
CREATE INDEX idx_emotion_logs_logged_at ON emotion_logs(logged_at DESC);
CREATE INDEX idx_emotion_logs_emotion_id ON emotion_logs(emotion_id);
CREATE INDEX idx_emotions_parent_id ON emotions(parent_id);
CREATE INDEX idx_emotions_tier ON emotions(tier);
CREATE INDEX idx_coping_strategies_emotion_id ON coping_strategies(emotion_id);

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE RLS POLICIES FOR EMOTION LOGS
-- ============================================

-- Policy: Users can only view their own emotion logs
CREATE POLICY "Users can view own logs"
ON emotion_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create emotion logs
CREATE POLICY "Users can create own logs"
ON emotion_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own logs
CREATE POLICY "Users can update own logs"
ON emotion_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own logs
CREATE POLICY "Users can delete own logs"
ON emotion_logs FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 8. CREATE RLS POLICIES FOR USER PREFERENCES
-- ============================================

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can create their own preferences
CREATE POLICY "Users can create own preferences"
ON user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 9. ALLOW PUBLIC READ ACCESS TO EMOTIONS
-- ============================================
ALTER TABLE emotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read emotions"
ON emotions FOR SELECT
USING (true);

-- ============================================
-- 10. INSERT PRIMARY EMOTIONS (TIER 1) - 6 EMOTIONS
-- ============================================

INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Happy', 1, NULL, 'A feeling of pleasure and contentment', '#FFD700', ARRAY['Smiling', 'Laughter', 'Positive energy']),
('Sad', 1, NULL, 'A feeling of sorrow or unhappiness', '#4A90E2', ARRAY['Low energy', 'Withdrawal', 'Heaviness']),
('Angry', 1, NULL, 'A strong feeling of displeasure', '#FF6B6B', ARRAY['Tension', 'Irritability', 'Hot energy']),
('Fearful', 1, NULL, 'A feeling of anxiety or dread', '#9B59B6', ARRAY['Tension', 'Worry', 'Hypervigilance']),
('Surprised', 1, NULL, 'Feeling suddenly caught off guard', '#F39C12', ARRAY['Sudden', 'Alert', 'Uncertain']),
('Disgusted', 1, NULL, 'A strong dislike or aversion', '#27AE60', ARRAY['Repulsion', 'Rejection', 'Aversion']);

-- ============================================
-- 11. INSERT TIER 2 EMOTIONS - HAPPY (3 emotions)
-- ============================================
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Joyful', 2, 1, 'An intense feeling of happiness and excitement', '#FFC700', ARRAY['Excited', 'Elated', 'Enthusiastic']),
('Content', 2, 1, 'A peaceful, satisfied feeling', '#FFE066', ARRAY['Peaceful', 'Satisfied', 'At ease']),
('Proud', 2, 1, 'Feeling good about accomplishments', '#FFD700', ARRAY['Accomplished', 'Confident']);

-- Tier 2 for HAPPY - Tier 3
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Ecstatic', 3, (SELECT id FROM emotions WHERE name = 'Joyful' AND tier = 2), 'Overwhelming joy and excitement', '#FFB700', ARRAY['Peak happiness', 'Euphoria']),
('Thrilled', 3, (SELECT id FROM emotions WHERE name = 'Joyful' AND tier = 2), 'Excited and delighted', '#FFC700', ARRAY['Exhilarated', 'Delighted']),
('Peaceful', 3, (SELECT id FROM emotions WHERE name = 'Content' AND tier = 2), 'Calm and serene', '#FFE680', ARRAY['Tranquil', 'Relaxed']),
('Grateful', 3, (SELECT id FROM emotions WHERE name = 'Content' AND tier = 2), 'Appreciative and thankful', '#FFE066', ARRAY['Thankful', 'Appreciative']),
('Confident', 3, (SELECT id FROM emotions WHERE name = 'Proud' AND tier = 2), 'Sure and self-assured', '#FFC700', ARRAY['Self-assured', 'Strong']),
('Accomplished', 3, (SELECT id FROM emotions WHERE name = 'Proud' AND tier = 2), 'Having achieved goals', '#FFB700', ARRAY['Successful', 'Victorious']);

-- ============================================
-- 12. INSERT TIER 2 EMOTIONS - SAD (3 emotions)
-- ============================================
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Lonely', 2, 2, 'Feeling isolated or disconnected', '#5BA3F5', ARRAY['Isolated', 'Disconnected']),
('Vulnerable', 2, 2, 'Feeling exposed or weak', '#4A90E2', ARRAY['Exposed', 'Defenseless']),
('Guilty', 2, 2, 'Feeling responsible for wrongdoing', '#3D7DD4', ARRAY['Remorseful', 'Ashamed']);

-- Tier 3 for SAD
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Abandoned', 3, (SELECT id FROM emotions WHERE name = 'Lonely' AND tier = 2), 'Feeling deserted or left behind', '#6EB3FF', ARRAY['Deserted', 'Forsaken']),
('Homesick', 3, (SELECT id FROM emotions WHERE name = 'Lonely' AND tier = 2), 'Missing home or loved ones', '#5BA3F5', ARRAY['Missing', 'Yearning']),
('Powerless', 3, (SELECT id FROM emotions WHERE name = 'Vulnerable' AND tier = 2), 'Unable to control circumstances', '#3D7DD4', ARRAY['Helpless', 'Ineffectual']),
('Weak', 3, (SELECT id FROM emotions WHERE name = 'Vulnerable' AND tier = 2), 'Lacking strength or energy', '#4A90E2', ARRAY['Feeble', 'Exhausted']),
('Ashamed', 3, (SELECT id FROM emotions WHERE name = 'Guilty' AND tier = 2), 'Feeling embarrassed or disgraceful', '#3570CE', ARRAY['Embarrassed', 'Disgraced']),
('Regretful', 3, (SELECT id FROM emotions WHERE name = 'Guilty' AND tier = 2), 'Wishing you had acted differently', '#3D7DD4', ARRAY['Remorseful', 'Sorry']);

-- ============================================
-- 13. INSERT TIER 2 EMOTIONS - ANGRY (3 emotions)
-- ============================================
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Frustrated', 2, 3, 'Annoyed by obstacles or blockers', '#FF8085', ARRAY['Blocked', 'Thwarted']),
('Antagonistic', 2, 3, 'Opposing or hostile toward others', '#FF5252', ARRAY['Hostile', 'Combative']),
('Outraged', 2, 3, 'Shocked and extremely angry', '#FF3B3B', ARRAY['Shocked', 'Intense fury']);

-- Tier 3 for ANGRY
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Irritated', 3, (SELECT id FROM emotions WHERE name = 'Frustrated' AND tier = 2), 'Bothered by minor annoyances', '#FF8A8F', ARRAY['Bothered', 'Vexed']),
('Annoyed', 3, (SELECT id FROM emotions WHERE name = 'Frustrated' AND tier = 2), 'Mildly displeased', '#FF8085', ARRAY['Bothered', 'Pestered']),
('Aggressive', 3, (SELECT id FROM emotions WHERE name = 'Antagonistic' AND tier = 2), 'Ready to attack or confront', '#FF4842', ARRAY['Combative', 'Attacking']),
('Bitter', 3, (SELECT id FROM emotions WHERE name = 'Antagonistic' AND tier = 2), 'Feeling resentful and cynical', '#FF5252', ARRAY['Resentful', 'Cynical']),
('Furious', 3, (SELECT id FROM emotions WHERE name = 'Outraged' AND tier = 2), 'Extremely angry', '#FF2B2B', ARRAY['Enraged', 'Seething']),
('Betrayed', 3, (SELECT id FROM emotions WHERE name = 'Outraged' AND tier = 2), 'Feeling deeply wronged', '#FF3B3B', ARRAY['Wronged', 'Double-crossed']);

-- ============================================
-- 14. INSERT TIER 2 EMOTIONS - FEARFUL (3 emotions)
-- ============================================
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Anxious', 2, 4, 'Nervous or worried about future', '#A568BD', ARRAY['Nervous', 'Worried']),
('Insecure', 2, 4, 'Lacking confidence or certainty', '#8B4BA8', ARRAY['Doubtful', 'Uncertain']),
('Terrified', 2, 4, 'Extremely frightened', '#7A3B8C', ARRAY['Panic', 'Dread']);

-- Tier 3 for FEARFUL
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Worried', 3, (SELECT id FROM emotions WHERE name = 'Anxious' AND tier = 2), 'Concerned about possible outcomes', '#B378C5', ARRAY['Concerned', 'Troubled']),
('Stressed', 3, (SELECT id FROM emotions WHERE name = 'Anxious' AND tier = 2), 'Under mental or physical strain', '#A568BD', ARRAY['Strained', 'Pressured']),
('Inadequate', 3, (SELECT id FROM emotions WHERE name = 'Insecure' AND tier = 2), 'Not good enough', '#7D42A0', ARRAY['Insufficient', 'Unworthy']),
('Inferior', 3, (SELECT id FROM emotions WHERE name = 'Insecure' AND tier = 2), 'Feeling less than others', '#8B4BA8', ARRAY['Lesser', 'Subpar']),
('Panicked', 3, (SELECT id FROM emotions WHERE name = 'Terrified' AND tier = 2), 'Sudden overwhelming fear', '#6D3380', ARRAY['Frantic', 'Hysterical']),
('Horrified', 3, (SELECT id FROM emotions WHERE name = 'Terrified' AND tier = 2), 'Shocked and frightened', '#7A3B8C', ARRAY['Shocked', 'Appalled']);

-- ============================================
-- 15. INSERT TIER 2 EMOTIONS - SURPRISED (3 emotions)
-- ============================================
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Amazed', 2, 5, 'Astonished or extremely impressed', '#F5AD41', ARRAY['Astounded', 'Impressed']),
('Confused', 2, 5, 'Uncertain or unable to understand', '#E8941D', ARRAY['Bewildered', 'Perplexed']),
('Excited', 2, 5, 'Enthusiastically interested', '#F39C12', ARRAY['Enthusiastic', 'Energetic']);

-- Tier 3 for SURPRISED
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Astonished', 3, (SELECT id FROM emotions WHERE name = 'Amazed' AND tier = 2), 'Shocked with wonder', '#F7BC59', ARRAY['Stunned', 'Awestruck']),
('Awed', 3, (SELECT id FROM emotions WHERE name = 'Amazed' AND tier = 2), 'Filled with awe and wonder', '#F5AD41', ARRAY['Reverent', 'Wondrous']),
('Perplexed', 3, (SELECT id FROM emotions WHERE name = 'Confused' AND tier = 2), 'Puzzled or bewildered', '#E8941D', ARRAY['Puzzled', 'Baffled']),
('Disoriented', 3, (SELECT id FROM emotions WHERE name = 'Confused' AND tier = 2), 'Confused about direction or situation', '#DB8B0B', ARRAY['Lost', 'Muddled']),
('Eager', 3, (SELECT id FROM emotions WHERE name = 'Excited' AND tier = 2), 'Keen and enthusiastic', '#F5AD41', ARRAY['Keen', 'Enthusiastic']),
('Hopeful', 3, (SELECT id FROM emotions WHERE name = 'Excited' AND tier = 2), 'Optimistic about possibilities', '#F39C12', ARRAY['Optimistic', 'Positive']);

-- ============================================
-- 16. INSERT TIER 2 EMOTIONS - DISGUSTED (3 emotions)
-- ============================================
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Disapproving', 2, 6, 'Strongly disapproving of something', '#2EBD6F', ARRAY['Disdainful', 'Critical']),
('Disappointed', 2, 6, 'Sad because hopes were not fulfilled', '#229954', ARRAY['Let down', 'Unfulfilled']),
('Repelled', 2, 6, 'Revolted or disgusted', '#1E8449', ARRAY['Revolted', 'Sick']);

-- Tier 3 for DISGUSTED
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) VALUES
('Judging', 3, (SELECT id FROM emotions WHERE name = 'Disapproving' AND tier = 2), 'Making critical judgments', '#35CC7F', ARRAY['Critical', 'Censorious']),
('Skeptical', 3, (SELECT id FROM emotions WHERE name = 'Disapproving' AND tier = 2), 'Not believing or trusting', '#2EBD6F', ARRAY['Doubtful', 'Suspicious']),
('Disenchanted', 3, (SELECT id FROM emotions WHERE name = 'Disappointed' AND tier = 2), 'Disillusioned or disappointed', '#1E8449', ARRAY['Disillusioned', 'Cynical']),
('Discouraged', 3, (SELECT id FROM emotions WHERE name = 'Disappointed' AND tier = 2), 'Losing confidence or hope', '#229954', ARRAY['Demoralized', 'Disheartened']),
('Sickened', 3, (SELECT id FROM emotions WHERE name = 'Repelled' AND tier = 2), 'Feeling physically or morally ill', '#186A3B', ARRAY['Revulsed', 'Nauseated']),
('Offended', 3, (SELECT id FROM emotions WHERE name = 'Repelled' AND tier = 2), 'Hurt or insulted', '#1E8449', ARRAY['Insulted', 'Wronged']);

-- ============================================
-- 17. INSERT SAMPLE COPING STRATEGIES
-- ============================================

-- These are manual/fallback strategies
-- AI will generate more at runtime from Claude API

INSERT INTO coping_strategies (emotion_id, strategy_text, generated_by) VALUES
((SELECT id FROM emotions WHERE name = 'Anxious' AND tier = 2), 'Practice deep breathing - inhale for 4 counts, hold for 4, exhale for 4', 'manual'),
((SELECT id FROM emotions WHERE name = 'Anxious' AND tier = 2), 'Break your worry into smaller, manageable problems', 'manual'),
((SELECT id FROM emotions WHERE name = 'Lonely' AND tier = 2), 'Reach out to a friend or family member for a quick chat', 'manual'),
((SELECT id FROM emotions WHERE name = 'Lonely' AND tier = 2), 'Join a community or group activity that interests you', 'manual'),
((SELECT id FROM emotions WHERE name = 'Frustrated' AND tier = 2), 'Take a 10-minute break and do something you enjoy', 'manual'),
((SELECT id FROM emotions WHERE name = 'Frustrated' AND tier = 2), 'Write down the problem and brainstorm three solutions', 'manual'));

-- ============================================
-- 18. VERIFY DATA
-- ============================================

-- Run this query to verify all data was inserted:
-- SELECT tier, COUNT(*) as emotion_count FROM emotions GROUP BY tier ORDER BY tier;
-- Expected: 6 tier-1, 18 tier-2, 36 tier-3 emotions = 60 total

-- ============================================
-- END OF DATABASE SETUP
-- ============================================
