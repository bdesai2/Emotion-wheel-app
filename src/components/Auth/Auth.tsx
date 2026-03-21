import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface AuthProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onContinueAsGuest: () => void;
  onSignInWithProvider?: (provider: string) => Promise<void>;
}

export const Auth: React.FC<AuthProps> = ({ onSignIn, onSignUp, onContinueAsGuest, onSignInWithProvider }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await onSignUp(email, password);
      } else {
        await onSignIn(email, password);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Emotion Wheel</h1>
            <p className="text-gray-600">Track and manage your emotions</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Provider (Google) Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-3 flex items-center justify-center gap-2"
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                // call optional provider handler passed from parent
                // if not provided, fallback to a noop
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                const fn = (onSignInWithProvider as any) || (() => Promise.resolve());
                await fn('google');
              } catch (err) {
                const message = err instanceof Error ? err.message : 'OAuth failed';
                setError(message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" className="inline">
              <path fill="#fbc02d" d="M43.6 20.5H42V20H24v8h11.3C34.7 32 30.2 35 24 35c-7 0-12.6-5.6-12.6-12.6S17 9.8 24 9.8c3.6 0 6.7 1.4 9 3.6l6.3-6.3C36.9 4 30.9 1.8 24 1.8 12 1.8 2.4 11.5 2.4 23.5S12 45.2 24 45.2c11.1 0 20.1-8 21.6-18.7.4-2.1.6-4.1.6-6z"/>
            </svg>
            <span>Sign in with Google</span>
          </Button>

          {/* Guest Button */}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={onContinueAsGuest}
            disabled={loading}
          >
            Continue as Guest
          </Button>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              {' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={loading}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Demo note */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs text-center">
            💡 Use any email/password for demo purposes
          </div>
        </div>
      </motion.div>
    </div>
  );
};
