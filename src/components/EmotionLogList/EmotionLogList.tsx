import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

export interface EmotionLogEntry {
  id: string;
  emotionId: number;
  emotionName: string;
  emotionColor: string;
  breadcrumb: string; // e.g. "Happy › Optimistic › Hopeful"
  notes: string | null;
  loggedAt: string;
}

interface EmotionLogListProps {
  open: boolean;
  logs: EmotionLogEntry[];
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

/** Ensure the ISO string is treated as UTC (Supabase TIMESTAMP may omit the Z suffix) */
function toUTCDate(iso: string): Date {
  const s = iso.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + 'Z';
  return new Date(s);
}

function formatDate(iso: string): string {
  return toUTCDate(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(iso: string): string {
  return toUTCDate(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export const EmotionLogList: React.FC<EmotionLogListProps> = ({
  open,
  logs,
  page,
  totalPages,
  loading,
  error,
  onPageChange,
  onClose,
}) => {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        /* Backdrop */
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">📓 My Emotion Log</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Error */}
              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="ml-2 text-gray-600">Loading logs…</span>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && logs.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="font-medium">No emotion logs yet</p>
                  <p className="text-sm mt-1">Start tracking your emotions using the wheel!</p>
                </div>
              )}

              {/* Log entries */}
              {!loading && logs.length > 0 && (
                <div>
                  {logs.map((log, index) => (
                    <div
                      key={log.id}
                      className={`px-6 py-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${index !== logs.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      {/* Top row: emotion breadcrumb | date + time */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: log.emotionColor || '#6B7280' }}
                          />
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {log.breadcrumb}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500">{formatDate(log.loggedAt)}</p>
                          <p className="text-xs text-gray-400">{formatTime(log.loggedAt)}</p>
                        </div>
                      </div>

                      {/* Notes */}
                      {log.notes && (
                        <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed pl-5">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 px-6 py-3 border-t border-gray-200 flex-shrink-0 bg-gray-50">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  ← Prev
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
