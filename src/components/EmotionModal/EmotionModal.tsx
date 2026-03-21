import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Emotion } from '../../types/emotion.types';
import { generateCopingStrategies } from '../../services/anthropic';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface EmotionModalProps {
  emotion: Emotion | null;
  tier1?: Emotion;
  tier2?: Emotion;
  onClose: () => void;
  onConfirm: (emotion: Emotion, notes?: string) => void;
  isGuest?: boolean;
  onOpenAuth?: () => void;
}

export const EmotionModal: React.FC<EmotionModalProps> = ({
  emotion, tier1, tier2, onClose, onConfirm, isGuest, onOpenAuth,
}) => {
  const [strategies, setStrategies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [fetchedOnce, setFetchedOnce] = useState(false);
  const [notes, setNotes] = useState('');

  // Autosave draft notes to localStorage while modal is open
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    // When emotion opens, load any saved draft
    if (emotion) {
      try {
        const key = `emotion_notes_draft_${emotion.id}`;
        const saved = localStorage.getItem(key);
        if (saved) setNotes(saved);
      } catch (e) {
        // ignore localStorage errors
      }
    } else {
      setNotes('');
    }
    return () => {
      // clear pending timer when modal closes or emotion changes
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [emotion]);

  useEffect(() => {
    if (!emotion) return;
    // debounce save
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      try {
        const key = `emotion_notes_draft_${emotion.id}`;
        if (notes && notes.trim().length > 0) {
          localStorage.setItem(key, notes);
        } else {
          localStorage.removeItem(key); 
        }
      } catch (e) {
        // ignore
      }
    }, 500) as unknown as number;

    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [notes, emotion]);

  // Do NOT auto-call the AI API. Provide a button to fetch strategies on demand.
  const handleGetStrategies = async () => {
    if (!emotion) return;
    try {
      setLoading(true);
      setError(null);
      
      // Check with server if the emotion already has strategies and use them if present
      try {
        const resp = await fetch(`${API_BASE_URL}/api/coping-strategies?emotionId=${emotion.id}`);
        if (resp.ok) {
          const json = await resp.json();
          const existing = json.strategies || [];
          if (existing && existing.length > 0) {
            setStrategies(existing);
            setFetchedOnce(true);
            return;
          }
        } else {
          const errJson = await resp.json().catch(() => ({}));
          console.error('Server returned error checking coping strategies:', errJson);
        }
      } catch (dbErr) {
        console.error('Failed to check existing strategies on server:', dbErr);
      }

      const result = await generateCopingStrategies(emotion.name, emotion.description, emotion.id);
      setStrategies(result);
      setFetchedOnce(true);
    } catch (err) {
      console.error('Failed to generate strategies:', err);
      setError('Failed to generate coping strategies. Please try again.');
      // Fallback strategies
      setStrategies([
        'Unable to fetch personalized strategies. Here are some general coping strategies to try:',
        'Take a deep breath and pause for a moment',
        'Identify what triggered this feeling',
        'Talk to someone you trust about how you feel',
        'Engage in a physical activity or movement',
        'Practice mindfulness or meditation',
      ]);
      setFetchedOnce(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!emotion) return;
    
    try {
      setConfirming(true);
      onConfirm(emotion, notes);
      // Clear saved draft after user confirms
      try {
        const key = `emotion_notes_draft_${emotion.id}`;
        localStorage.removeItem(key);
      } catch (e) {}
    } catch (err) {
      console.error('Error confirming emotion:', err);
      setError('Failed to log emotion. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AnimatePresence>
      {emotion && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ backgroundColor: emotion.color }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{emotion.name}</h2>
                  <p className="text-sm text-gray-600">
                    {tier2?.name && `${tier1?.name} > ${tier2.name} > ${emotion.name}`}
                    {!tier2?.name && tier1?.name && `${tier1.name} > ${emotion.name}`}
                    {!tier1?.name && emotion.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What this means</h3>
                <p className="text-gray-700">{emotion.description}</p>
              </div>

                {/* Triggers & Physical Sensations (from DB if present) */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Triggers</h3>
                  <div className="text-gray-700 space-y-3">
                    {/* triggers: support several possible field names */}
                    {emotion.triggers}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Physical Sensations</h3>
                  <div className="text-gray-700 space-y-3">
                    {/* physical sensations: support several possible field names */}
                    {emotion.physicalSensations}
                  </div>
                </div>

              {/* Characteristics */}
              {emotion.characteristics && emotion.characteristics.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Common signs</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {emotion.characteristics.map((char, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-700">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: emotion.color }} />
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Coping Strategies (manual) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Coping strategies</h3>

                {!fetchedOnce && (
                  <div className="space-y-3">
                    <p className="text-gray-700">Get personalized coping strategies generated by the AI. This will call the AI service from the server.</p>
                    <div className="pt-3">
                      <Button variant="secondary" onClick={handleGetStrategies} disabled={loading}>
                        {loading ? 'Generating…' : 'Get coping strategies'}
                      </Button>
                    </div>
                  </div>
                )}

                {fetchedOnce && (
                  <>
                    {loading ? (
                      <div className="flex items-center justify-center py-6">
                        <LoadingSpinner size="md" text="Generating personalized strategies..." />
                      </div>
                    ) : error ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {strategies.map((strategy, idx) => (
                          <motion.div
                            key={idx}
                            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer group"
                            whileHover={{ scale: 1.02 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <p className="text-gray-800 text-sm group-hover:text-gray-900 transition-colors">
                              {strategy}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes (optional)</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any notes about this experience (how you felt, context, or anything to remember)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                  disabled={confirming}
                >
                  Not now
                </Button>
                {isGuest ? (
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => onOpenAuth && onOpenAuth()}
                    disabled={loading || confirming}
                  >
                    Login to log
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleConfirm}
                    loading={confirming}
                    disabled={loading || confirming}
                  >
                    Log this emotion
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
