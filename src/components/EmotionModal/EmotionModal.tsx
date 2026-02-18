import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Emotion } from '../../types/emotion.types';
import { generateCopingStrategies } from '../../services/anthropic';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface EmotionModalProps {
  emotion: Emotion | null;
  tier1?: Emotion;
  tier2?: Emotion;
  onClose: () => void;
  onConfirm: (emotion: Emotion) => void;
}

export const EmotionModal: React.FC<EmotionModalProps> = ({
  emotion,
  tier1,
  tier2,
  onClose,
  onConfirm,
}) => {
  const [strategies, setStrategies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchStrategies = async () => {
      if (!emotion) return;
      
      try {
        setLoading(true);
        setError(null);
        const result = await generateCopingStrategies(
          emotion.name,
          emotion.description
        );
        setStrategies(result);
      } catch (err) {
        console.error('Failed to generate strategies:', err);
        setError('Failed to generate coping strategies. Please try again.');
        // Fallback strategies
        setStrategies([
          'Take a deep breath and pause for a moment',
          'Identify what triggered this feeling',
          'Talk to someone you trust about how you feel',
          'Engage in a physical activity or movement',
          'Practice mindfulness or meditation',
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, [emotion]);

  const handleConfirm = async () => {
    if (!emotion) return;
    
    try {
      setConfirming(true);
      onConfirm(emotion);
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

              {/* Coping Strategies */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Coping strategies</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
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
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleConfirm}
                  loading={confirming}
                  disabled={loading || confirming}
                >
                  Log this emotion
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
