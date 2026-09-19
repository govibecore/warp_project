import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react';

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  studentProfile: any | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  refreshStudentProfile: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  studentProfile: null,
  isLoaded: false,
  isSignedIn: false,
  refreshStudentProfile: async () => {},
});

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [studentProfile, setStudentProfile] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchGenerationRef = useRef(0);

  const fetchStudentProfile = async (userId: string) => {
    const gen = ++fetchGenerationRef.current;
    setStudentProfile(null);
    const { data } = await supabase.from('students').select('*').eq('id', userId).maybeSingle();
    if (fetchGenerationRef.current === gen) {
      setStudentProfile(data || null);
    }
  };

  const refreshStudentProfile = async () => {
    if (user?.id) {
      await fetchStudentProfile(user.id);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        try {
          window.sessionStorage.removeItem('logged_out');
        } catch {}
        if (session.user) {
          Sentry.setUser({ id: session.user.id, email: session.user.email });
          await fetchStudentProfile(session.user.id);
        }
      } else {
        Sentry.setUser(null);
        setStudentProfile(null);
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
      
      const updateUserState = async (s: Session | null) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          Sentry.setUser({ id: s.user.id, email: s.user.email });
          // Fetch the student profile if it's a new user or auth state changed
          await fetchStudentProfile(s.user.id);
        } else {
          Sentry.setUser(null);
          setStudentProfile(null);
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
    <SupabaseAuthContext.Provider value={{ user, session, studentProfile, isLoaded, isSignedIn: !!user, refreshStudentProfile }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  return useContext(SupabaseAuthContext);
};
