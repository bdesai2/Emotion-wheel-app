import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '../types/emotion.types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error: err }) => {
      if (err) {
        setError(err.message);
      } else if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) throw err;
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      return { data: null, error: message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error: err } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (err) throw err;
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      return { data: null, error: message };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error: err } = await supabase.auth.signOut();
      if (err) throw err;
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
    }
  };

  const signInWithProvider = async (provider: 'google', usePopup = true) => {
    try {
      setError(null);
      // Start OAuth flow
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (err) throw err;

      // If caller prefers redirect, return SDK response
      if (!usePopup) return { data, error: null };

      // SDK returns a URL to open in a popup
      const url = (data as any)?.url || (data as any)?.url;
      if (!url) {
        return { data: null, error: 'No OAuth URL returned' };
      }

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const popup = window.open(
        url,
        'supabase_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        return { data: null, error: 'Popup blocked' };
      }

      // Listen for a postMessage from the popup (sent by our app when the
      // popup completes the OAuth redirect). Fallback to timeout if nothing
      // arrives.
      return await new Promise((resolve) => {
        let settled = false;
        const timeoutMs = 60_000; // 60s

        const handler = (event: MessageEvent) => {
          try {
            if (event.origin !== window.location.origin) return;
            const payload = event.data || {};
            if (payload?.type === 'supabase-auth') {
              settled = true;
              window.removeEventListener('message', handler);
              try {
                if (!popup.closed) popup.close();
              } catch (e) {}
              return resolve({ data: payload.session ? { session: payload.session } : null, error: null });
            }
          } catch (e) {
            // ignore
          }
        };

        window.addEventListener('message', handler);

        // Also set a timeout to fail gracefully
        const t = window.setTimeout(async () => {
          if (settled) return;
          window.removeEventListener('message', handler);
          try {
            if (!popup.closed) popup.close();
          } catch (e) {}
          // Final attempt: check session in main window
          try {
            const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
            if (sessionErr) {
              return resolve({ data: null, error: sessionErr.message });
            }
            if (sessionData?.session) {
              return resolve({ data: sessionData, error: null });
            }
          } catch (e) {
            // ignore
          }
          return resolve({ data: null, error: 'No session after OAuth popup (timeout)' });
        }, timeoutMs);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth sign in failed';
      setError(message);
      return { data: null, error: message };
    }
  };

  const continueAsGuest = () => {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      email: 'guest@anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(guestUser);
    setIsGuest(true);
    localStorage.setItem('auth_mode', 'guest');
  };

  return { user, loading, error, signUp, signIn, signOut, continueAsGuest, isGuest, signInWithProvider };
};
