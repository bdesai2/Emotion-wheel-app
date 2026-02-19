--Inserting additional emotions.
-- Add new tier-2 emotion
select * from emotions where tier = 2 and parent_id = 1;

-- Add new tier-2 emotion
INSERT INTO emotions (name, tier, parent_id, description, color, characteristics) 
VALUES 
  ('Peaceful', 2, 1, 'Peaceful is a tranquil, serene state of happiness characterized by inner calm, absence of conflict or disturbance, and harmony with your surroundings. It''s a still, quiet form of wellbeing.', '#90EE90', ARRAY['Meditation', 'Gentle', 'Relaxed']),
  ('Interested', 2, 1, ' Interested is an engaged, curious state of happiness characterized by wanting to learn, explore, or understand more. It''s the pleasure of discovery and mental stimulation.', '#FFD700', ARRAY['Open-mindedness', 'Alert', 'Engaging']),
  ('Appreciated', 2, 1, 'Appreciated is the warm, affirming feeling of being valued, respected, and recognized by others. It''s the happiness that comes from knowing that your presence, contributions, or qualities matter to others and that you belong.', '#FFD700', ARRAY['Welcomed', 'Acknowledged', 'Worthy']);

-- Add new tier-3 emotions (child emotions)
/*INSERT INTO emotions (name, tier, parent_id, description, color, characteristics)
SELECT id, 'Inspired', 3, (SELECT id FROM emotions WHERE name='Hopeful' AND tier=2), 'Feeling motivated and encouraged', '#98FB98', ARRAY['Motivated', 'Driven']
FROM emotions WHERE name = 'Hopeful' AND tier = 2;*/