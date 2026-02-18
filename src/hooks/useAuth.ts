import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '../types/emotion.types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return { user, loading, error, signUp, signIn, signOut };
};
