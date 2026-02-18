import { create } from 'zustand';
import type { Emotion, EmotionLog } from '../types/emotion.types';
import { EMOTION_WHEEL_DATA } from '../utils/constants';

interface EmotionStore {
  // Emotion wheel state
  emotions: Emotion[];
  selectedTier1: Emotion | null;
  selectedTier2: Emotion | null;
  wheelRotation: number;

  // Modal state
  selectedEmotionForModal: Emotion | null;
  showModal: boolean;

  // Emotion logs
  emotionLogs: EmotionLog[];

  // Actions
  setSelectedTier1: (emotion: Emotion | null) => void;
  setSelectedTier2: (emotion: Emotion | null) => void;
  setWheelRotation: (rotation: number) => void;
  setSelectedEmotionForModal: (emotion: Emotion | null) => void;
  setShowModal: (show: boolean) => void;
  addEmotionLog: (log: EmotionLog) => void;
  setEmotionLogs: (logs: EmotionLog[]) => void;
  reset: () => void;
}

export const useEmotionStore = create<EmotionStore>((set) => ({
  emotions: EMOTION_WHEEL_DATA,
  selectedTier1: null,
  selectedTier2: null,
  wheelRotation: 0,
  selectedEmotionForModal: null,
  showModal: false,
  emotionLogs: [],

  setSelectedTier1: (emotion) => set({ selectedTier1: emotion, selectedTier2: null }),
  setSelectedTier2: (emotion) => set({ selectedTier2: emotion }),
  setWheelRotation: (rotation) => set({ wheelRotation: rotation }),
  setSelectedEmotionForModal: (emotion) => set({ selectedEmotionForModal: emotion }),
  setShowModal: (show) => set({ showModal: show }),
  addEmotionLog: (log) => set((state) => ({
    emotionLogs: [log, ...state.emotionLogs]
  })),
  setEmotionLogs: (logs) => set({ emotionLogs: logs }),
  reset: () => set({
    selectedTier1: null,
    selectedTier2: null,
    wheelRotation: 0,
    selectedEmotionForModal: null,
    showModal: false,
  }),
}));
