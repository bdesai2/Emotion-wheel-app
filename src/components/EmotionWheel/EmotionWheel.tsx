import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Emotion } from '../../types/emotion.types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface EmotionWheelProps {
  emotions: Emotion[];
  onEmotionSelect: (emotion: Emotion) => void;
}

export const EmotionWheel: React.FC<EmotionWheelProps> = ({ emotions, onEmotionSelect }) => {
  const [selectedTier1, setSelectedTier1] = useState<Emotion | null>(null);
  const [selectedTier2, setSelectedTier2] = useState<Emotion | null>(null);

  const handleTier1Select = (emotion: Emotion) => {
    setSelectedTier1(emotion);
    setSelectedTier2(null);
  };

  const handleTier2Select = (emotion: Emotion) => {
    setSelectedTier2(emotion);
  };

  const handleTier3Select = (emotion: Emotion) => {
    onEmotionSelect(emotion);
  };

  const currentEmotions = selectedTier2?.children || selectedTier1?.children || emotions;
  const segmentCount = currentEmotions.length;
  const angleSlice = 360 / segmentCount; // Full circle

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">How are you feeling?</h1>
      <p className="text-gray-600 mb-8">Select your emotion by clicking on the wheel segments</p>

      <div className="w-full max-w-2xl">
        <div className="relative w-96 h-96 mx-auto">
          {/* Wheel container */}
          <svg className="w-full h-full" viewBox="0 0 400 400">
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
                    if (emotion.tier === 1) handleTier1Select(emotion);
                    else if (emotion.tier === 2) handleTier2Select(emotion);
                    else handleTier3Select(emotion);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Segment path */}
                  <path
                    d={`M 200 200 L ${x1} ${y1} A 180 180 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={emotion.color}
                    fillOpacity="0.8"
                    stroke="#fff"
                    strokeWidth="2"
                    style={{ transition: 'fill-opacity 0.3s' }}
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

          {/* Center circle info */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">
                {selectedTier2 ? 'Level 3' : selectedTier1 ? 'Level 2' : 'Level 1'}
              </p>
              {(selectedTier2 || selectedTier1) && (
                <p className="text-gray-900 font-bold text-lg">
                  {selectedTier2?.name || selectedTier1?.name}
                </p>
              )}
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
