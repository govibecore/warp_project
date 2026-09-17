import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react';

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  isLoaded: false,
  isSignedIn: false,
});

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        try {
          window.sessionStorage.removeItem('logged_out');
        } catch {}
        if (session.user) {
          Sentry.setUser({ id: session.user.id, email: session.user.email });
        }
      } else {
        Sentry.setUser(null);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        try {
          window.sessionStorage.removeItem('logged_out');
        } catch {}
      }
      
      const updateUserState = (s: Session | null) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          Sentry.setUser({ id: s.user.id, email: s.user.email });
        } else {
          Sentry.setUser(null);
        }
      };

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      // Delay the UI state update on sign in to allow the success animation to play
      if (_event === 'SIGNED_IN') {
        timeoutId = setTimeout(() => {
          updateUserState(session);
        }, 3000);
      } else {
        updateUserState(session);
      }
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseAuthContext.Provider value={{ user, session, isLoaded, isSignedIn: !!user }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  return useContext(SupabaseAuthContext);
};
