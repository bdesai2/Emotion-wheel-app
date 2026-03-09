export interface Emotion {
  id: number;
  name: string;
  tier: 1 | 2 | 3;
  parentId: number | null;
  description: string;
  color: string;
  triggers?: string;
  physicalSensations?: string;
  characteristics?: string[];
  children?: Emotion[];
}

export interface EmotionLog {
  id: string;
  userId: string;
  emotionId: number;
  tier1EmotionId: number;
  tier2EmotionId?: number;
  tier3EmotionId?: number;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface CopingStrategy {
  id: string;
  emotionId: number;
  strategyText: string;
  generatedBy: 'ai' | 'manual';
  useCount: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIResponse {
  strategies: string[];
  loading: boolean;
  error?: string;
}
