import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Emotion } from '../../types/emotion.types';
import { supabase } from '../../services/supabase';
import { EMOTION_WHEEL_DATA } from '../../utils/constants';

interface EmotionWheelProps {
  emotions?: Emotion[];
  onEmotionSelect: (emotion: Emotion) => void;
}

export const EmotionWheel: React.FC<EmotionWheelProps> = ({ emotions, onEmotionSelect }) => {
  const [selectedTier1, setSelectedTier1] = useState<Emotion | null>(null);
  const [selectedTier2, setSelectedTier2] = useState<Emotion | null>(null);
  const [localEmotions, setLocalEmotions] = useState<Emotion[]>(emotions && emotions.length ? emotions : EMOTION_WHEEL_DATA);

  useEffect(() => {
    let mounted = true;

    if (emotions && emotions.length) {
      setLocalEmotions(emotions);
      return;
    }

    (async () => {
      try {
        const { data: t1Rows, error: err1 } = await supabase
          .from('emotions').select('*').eq('tier', 1).eq('enabled', true).order('id', { ascending: true }); //tier 1 emotions

        if (err1 || !t1Rows || t1Rows.length === 0) {
          console.error('Failed to load emotions for wheel, falling back to constants', err1);    
          if (mounted) setLocalEmotions(EMOTION_WHEEL_DATA);
          return;
        }

        const tier1Ids = t1Rows.map((r: any) => r.id);

        const { data: t2Rows } = await supabase
          .from('emotions').select('*').in('parent_id', tier1Ids).eq('tier', 2).eq('enabled', true).order('id', { ascending: true }); //tier 2 emotions for the selected parent

        const tier2Ids = (t2Rows || []).map((r: any) => r.id);

        let tier3Rows: any[] = [];
        if (tier2Ids.length > 0) {
          const { data: t3, error: err3 } = await supabase
            .from('emotions').select('*').in('parent_id', tier2Ids).eq('tier', 3).eq('enabled', true).order('id', { ascending: true }); //tier 3 emotions for the selected parents
          if (!err3) tier3Rows = t3 || [];
        }

        const normalize = (r: any): Emotion => {
          // helper to coerce field values to string or string[]
          const coerceList = (val: any): string | string[] => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
              // try parse JSON arrays
              try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) return parsed;
              } catch (e) {
                // not JSON, fallthrough
              }
              return val;
            }
            return '';
          };

          // Accept several possible DB field names for triggers and physical sensations
          const triggersField = r.triggers ?? r.triggers_list ?? r.triggers_text ?? r.triggersText ?? r.trigger ?? r.triggersText ?? '';
          const physicalField = r.physical_sensations ?? r.physicalSensations ?? r.physical ?? r.sensations ?? r.physical_sensation ?? '';

          return {
            id: r.id, name: r.name, tier: Number(r.tier) as 1 | 2 | 3,
            parentId: r.parent_id ?? r.parentId ?? null,
            description: r.description ?? r.desc ?? '',
            triggers: coerceList(triggersField) as string,
            physicalSensations: coerceList(physicalField) as string,
            color: r.color ?? '#999',
            characteristics: Array.isArray(r.characteristics)
              ? r.characteristics
              : (typeof r.characteristics === 'string' ? ((): string[] => {
                  try { return JSON.parse(r.characteristics); } catch { return []; }
                })() : []),
            children: [] as Emotion[],
          };
        };

        const tier1Map = new Map<number, Emotion>();
        const tier2Map = new Map<number, Emotion>();

        t1Rows.forEach((r: any) => tier1Map.set(r.id, normalize(r)));
        (t2Rows || []).forEach((r: any) => tier2Map.set(r.id, normalize(r)));
        (tier3Rows || []).forEach((r: any) => {
          const e = normalize(r);
          if (e.parentId && tier2Map.has(e.parentId)) tier2Map.get(e.parentId)!.children!.push(e);
        });

        tier2Map.forEach((v) => {
          if (v.parentId && tier1Map.has(v.parentId)) tier1Map.get(v.parentId)!.children!.push(v);
        });

        // Ensure every tier-2 emotion has at least one child. If none exist in the DB,
        // create a placeholder tier-3 child so the UI always drills down to a Level 3.
        /*tier2Map.forEach((v) => {
          if (!v.children || v.children.length === 0) {
            const placeholder: Emotion = {
              id: -(v.id), // negative id to avoid colliding with DB ids
              name: v.name, tier: 3, parentId: v.id,
              description: v.description || v.name,
              color: v.color || '#999',
              characteristics: v.characteristics || [], children: [],
            };
            v.children = [placeholder];
          }
        });*/

        const roots = Array.from(tier1Map.values());
        if (mounted) setLocalEmotions(roots.length ? roots : EMOTION_WHEEL_DATA);
      } catch (err) {
        console.error('Failed to load emotions for wheel, falling back to constants', err);
        if (mounted) setLocalEmotions(EMOTION_WHEEL_DATA);
      }
    })();

    return () => { mounted = false; };
  }, [emotions]);

  const handleTier1Select = (emotion: Emotion) => {
    setSelectedTier1(emotion);
    setSelectedTier2(null);
  };
  const handleTier2Select = (emotion: Emotion) => {
    if(emotion.children && emotion.children.length > 0) {
      setSelectedTier2(emotion);
    } else {
      // if no children, treat as final selection
      onEmotionSelect(emotion);
    }
    //setSelectedTier2(emotion);
  };

  const handleTier3Select = (emotion: Emotion) => {
    onEmotionSelect(emotion);
  };

  const currentEmotions = selectedTier2?.children || selectedTier1?.children || localEmotions;
  const segmentCount = currentEmotions.length;
  let angleSlice = 360 / segmentCount; // Full circle
  if (segmentCount < 3) angleSlice = 180/segmentCount; // For 2 or fewer segments, split half-circle to avoid thin slivers

  // Flatten all emotions (roots + children + grandchildren) so we generate gradients for every ID
  const allEmotions: Emotion[] = [];
  const pushAll = (list: Emotion[] = []) => {
    for (const e of list) {
      allEmotions.push(e);
      if (e.children && e.children.length) pushAll(e.children);
    }
  };
  pushAll(localEmotions);

  return (
    <div className="wheel-wrapper flex flex-col items-center justify-center bg min-h-screen p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">How are you feeling?</h1>
      <p className="text-gray-600 mb-8">Select your emotion by clicking on the wheel segments</p>

      <div className="w-full max-w-2xl">
        <div className="relative w-96 h-96 mx-auto">
          {/* Wheel container */}
          <svg className="w-full h-full" viewBox="0 0 400 400">
            <defs>
              <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.15" />
              </filter>
              {allEmotions.map((e) => {
                const dark = (hex: string, amt = 0.2) => {
                  try {
                    const h = hex.replace('#', '');
                    const r = Math.max(0, Math.min(255, Math.round(parseInt(h.substring(0,2),16) * (1-amt))));
                    const g = Math.max(0, Math.min(255, Math.round(parseInt(h.substring(2,4),16) * (1-amt))));
                    const b = Math.max(0, Math.min(255, Math.round(parseInt(h.substring(4,6),16) * (1-amt))));
                    return `rgb(${r}, ${g}, ${b})`;
                  } catch (err) {
                    return hex;
                  }
                };

                return (
                  <linearGradient id={`grad-${e.id}`} key={e.id} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={e.color} stopOpacity="1" />
                    <stop offset="100%" stopColor={dark(e.color, 0.22)} stopOpacity="1" />
                  </linearGradient>
                );
              })}
            </defs>

            {/* Background circle */}
            <circle cx="200" cy="200" r="180" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2" />

            {/* Segments */}
            {currentEmotions.map((emotion, index) => {
              const startAngle = index * angleSlice;
              const endAngle = (index + 1) * angleSlice;
              
              const x1 = 200 + 180 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 200 + 180 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 200 + 180 * Math.cos((endAngle - 90) * Math.PI / 180);
              const y2 = 200 + 180 * Math.sin((endAngle - 90) * Math.PI / 180);
              
              const largeArc = angleSlice > 180 ? 1 : 0;
              
              return (
                <motion.g
                  key={emotion.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    // Determine action by current selection context so level-2 segments are clickable
                    if (!selectedTier1) {
                      handleTier1Select(emotion);
                    } else if (selectedTier1 && !selectedTier2) {
                      // we're viewing tier2 segments under a tier1; select tier2
                      handleTier2Select(emotion);
                    } else {
                      // otherwise, treat as tier3/confirm
                      handleTier3Select(emotion);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Segment path */}
                  <path
                    d={`M 200 200 L ${x1} ${y1} A 180 180 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={`url(#grad-${emotion.id})`}
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ transition: 'transform 0.18s, opacity: 0.3s' }}
                    filter="url(#dropShadow)"
                  />
                  
                  {/* Label */}
                  <text
                    x={200 + 120 * Math.cos(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
                    y={200 + 120 * Math.sin(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-semibold text-white text-sm"
                    pointerEvents="none"
                  >
                    {emotion.name}
                  </text>
                </motion.g>
              );
            })}
          </svg>

          {/* Center white circle showing level. Only the center circle consumes clicks so underlying segments remain clickable. */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'default' }}
            >
              <p className="text-gray-500 text-sm font-medium">{selectedTier2 ? 'Level 3' : selectedTier1 ? 'Level 2' : 'Level 1'}</p>
              <p className="text-gray-900 font-bold text-lg mt-1">{selectedTier2?.name || selectedTier1?.name || 'Select'}</p>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          {selectedTier2 && (
            <button
              onClick={() => setSelectedTier2(null)}
              className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          {selectedTier1 && !selectedTier2 && (
            <button
              onClick={() => setSelectedTier1(null)}
              className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
