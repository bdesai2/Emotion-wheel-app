import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Emotion } from './types/emotion.types';
import { useAuth } from './hooks/useAuth';
import { useEmotionLog } from './hooks/useEmotionLog';
import { useEmotionStore } from './store/useEmotionStore';
import { Auth } from './components/Auth/Auth';
import { EmotionWheel } from './components/EmotionWheel/EmotionWheel';
import { EmotionModal } from './components/EmotionModal/EmotionModal';
import { EmotionLogList } from './components/EmotionLogList/EmotionLogList';
import type { EmotionLogEntry } from './components/EmotionLogList/EmotionLogList';
import { Button } from './components/ui/Button';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { supabase } from './services/supabase';
import './App.css';
import { useEffect } from 'react';

function App() {
  const { user, loading: authLoading, signUp, signIn, signOut, continueAsGuest, isGuest, signInWithProvider } = useAuth();
  const { logEmotion } = useEmotionLog(isGuest);
  const {
    selectedEmotionForModal,
    showModal,
    selectedTier1,
    selectedTier2,
    setSelectedEmotionForModal,
    setShowModal,
    setSelectedTier1,
    setSelectedTier2,
    reset,
  } = useEmotionStore();
  const [loggingEmotion, setLoggingEmotion] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Emotion log list state
  const [showLogs, setShowLogs] = useState(false);
  const [logEntries, setLogEntries] = useState<EmotionLogEntry[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const LOG_PAGE_SIZE = 20;

  const fetchLogs = useCallback(async (page: number) => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      if (isGuest) {
        // Guest logs from localStorage
        const raw = JSON.parse(localStorage.getItem('guest_emotion_logs') || '[]') as any[];
        const sorted = [...raw].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
        const total = sorted.length;
        const totalPages = Math.ceil(total / LOG_PAGE_SIZE) || 1;
        const start = (page - 1) * LOG_PAGE_SIZE;
        const slice = sorted.slice(start, start + LOG_PAGE_SIZE);
        setLogEntries(slice.map((l: any) => ({
          id: l.id,
          emotionId: l.emotionId,
          emotionName: `Emotion #${l.emotionId}`,
          emotionColor: '#6B7280',
          breadcrumb: `Emotion #${l.emotionId}`,
          notes: l.notes || null,
          loggedAt: l.loggedAt,
        })));
        setLogsPage(page);
        setLogsTotalPages(totalPages);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Not authenticated');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const resp = await fetch(
          `${API_BASE_URL}/api/emotion-logs?page=${page}&pageSize=${LOG_PAGE_SIZE}`,
          {
            headers: { 'Authorization': `Bearer ${session.access_token}` },
          }
        );
        if (!resp.ok) {
          const errJson = await resp.json().catch(() => ({}));
          throw new Error(errJson.error || 'Failed to fetch logs');
        }
        const json = await resp.json();
        setLogEntries(json.logs || []);
        setLogsPage(json.page || 1);
        setLogsTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      setLogsError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLogsLoading(false);
    }
  }, [isGuest]);

  const handleShowLogs = useCallback(() => {
    setShowLogs(true);
    fetchLogs(1);
  }, [fetchLogs]);

  const handleLogsPageChange = useCallback((page: number) => {
    fetchLogs(page);
  }, [fetchLogs]);

  useEffect(() => {
    // Close auth modal when a non-guest user signs in
    if (user && !isGuest && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [user, isGuest, showAuthModal]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return (
      <Auth
        onSignIn={async (email, password) => {
          const { error } = await signIn(email, password);
          if (error) throw new Error(error);
        }}
        onSignUp={async (email, password) => {
          const { error } = await signUp(email, password);
          if (error) throw new Error(error);
        }}
        onContinueAsGuest={continueAsGuest}
        onSignInWithProvider={async (provider: string) => {
          const { error } = await signInWithProvider?.(provider as 'google') as { error?: unknown };;
          if (error) throw new Error(error as string);
        }}
      />
    );
  }

  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotionForModal(emotion);
    setShowModal(true);
  };

  const handleConfirmEmotion = async (emotion: Emotion, notes?: string) => {
    try {
      setLoggingEmotion(true);
      
      const result = await logEmotion({
        emotionId: emotion.id,
        notes: notes,
      });

      if (!result) {
        throw new Error('Logging failed');
      }

      // Reset and close
      setShowModal(false);
      reset();
      setSelectedTier1(null);
      setSelectedTier2(null);

      // Refresh logs if the log list is open
      if (showLogs) {
        fetchLogs(logsPage);
      }

      // Show success message
      alert('Emotion logged successfully! 🎉');
    } catch (error) {
      console.error('Error logging emotion:', error);
      alert('Failed to log emotion. Please try again.');
    } finally {
      setLoggingEmotion(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.h1
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            🌈 Emotion Wheel
          </motion.h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user?.email}</span>
              {isGuest && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Guest Mode</span>}
            </div>
            {isGuest ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAuthModal(true)}
              >
                Login
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  signOut();
                  localStorage.removeItem('auth_mode');
                }}
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Auth modal for guest -> login flow */}
      {showAuthModal && (
        <Auth
          onSignIn={async (email, password) => {
            const { error } = await signIn(email, password);
            if (error) throw new Error(error);
          }}
          onSignUp={async (email, password) => {
            const { error } = await signUp(email, password);
            if (error) throw new Error(error);
          }}
          onContinueAsGuest={continueAsGuest}
          onSignInWithProvider={async (provider: string) => {
            const { error } = await signInWithProvider?.(provider as 'google')  as { error?: unknown };;
            if (error) throw new Error(error as string);
          }}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">
        {loggingEmotion ? (
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" text="Logging your emotion..." />
          </div>
        ) : (
          <>
            <EmotionWheel
              onEmotionSelect={handleEmotionSelect}
            />

            {/* Show My Log button */}
            <div className="flex justify-center py-4">
              <Button className="button" variant="primary"
                size="md"
                onClick={handleShowLogs}
              >
                📓 Show My Log
              </Button>
            </div>

            {/* Emotion Log Modal */}
            <EmotionLogList
              open={showLogs}
              logs={logEntries}
              page={logsPage}
              totalPages={logsTotalPages}
              loading={logsLoading}
              error={logsError}
              onPageChange={handleLogsPageChange}
              onClose={() => setShowLogs(false)}
            />

            {/* Modal */}
            <EmotionModal
              emotion={showModal ? selectedEmotionForModal : null}
              tier1={selectedTier1 || undefined}
              tier2={selectedTier2 || undefined}
              onClose={() => {
                setShowModal(false);
              }}
              isGuest={isGuest}
              onOpenAuth={() => setShowAuthModal(true)}
              onConfirm={handleConfirmEmotion}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          <p>Track your emotions, understand yourself better, and find healthy ways to cope.</p>
          <p className="mt-2">Made with ❤️ for emotional wellness</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
