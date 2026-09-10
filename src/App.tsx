import { AxiomSessionProvider, useAxiomSession } from './context/AxiomSessionContext';
import { AppShell } from './components/AppShell';
import { Assessment } from './components/Assessment';
import { Landing } from './components/Landing';
import { Onboarding } from './components/Onboarding';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { ReportDetail } from './components/dashboard/ReportDetail';
import { AdminApp } from './components/admin/AdminApp';
import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';

import { useSupabaseAuth } from './context/SupabaseAuthContext';
import { supabase } from './lib/supabase';

// ── Admin portal: served at /admin or /admin/* ───────────────────────
const isAdminRoute = window.location.pathname.startsWith('/admin');

function AxiomApplication() {
  const { session, enterApp } = useAxiomSession();
  const { isGuest } = useAuthStore();
  const { isLoaded, isSignedIn, user } = useSupabaseAuth();

  // URL routing for dashboard/reports
  const params = new URLSearchParams(window.location.search);
  const isDashboard = params.has('dashboard');
  const hasAssessmentId = params.has('assessment');

  // Synchronize user to Supabase public.users and AxiomSession
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      if (isGuest) {
        useAuthStore.setState({ isGuest: false });
      }

      // Store user in Supabase database
      const syncUser = async () => {
        if (!user.email) return;
        const { error } = await supabase.from('users').upsert({
          auth_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        }, { onConflict: 'email' });
        if (error) console.error('Failed to store user in Supabase:', error);
      };
      syncUser();
    }
  }, [isLoaded, isSignedIn, user, isGuest]);

  // Determine what body to render
  let body;

  if (isDashboard) {
    body = <StudentDashboard key="dashboard" />;
  } else if (hasAssessmentId) {
    body = <ReportDetail key="report" />;
  } else if (session.phase === 'landing') {
    body = <Landing key="landing" onEnter={enterApp} />;
  } else if (session.phase === 'onboarding') {
    body = <Onboarding key="onboarding" />;
  } else if (session.phase === 'results' && session.result) {
    body = <ReportDetail key="results" />;
  } else {
    body = <Assessment key="assessment" />;
  }

  // Auto-redirect if auth completes while in onboarding
  useEffect(() => {
    if (session.phase === 'onboarding' && (isSignedIn || isGuest)) {
      window.location.search = '?dashboard';
    }
  }, [session.phase, isSignedIn, isGuest]);

  return (
    <AppShell scrollable={session.phase === 'landing'} hideHeader={session.phase === 'landing'}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isDashboard ? 'dash' : hasAssessmentId ? 'rep' : session.phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col min-h-0 h-full w-full"
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  // Admin portal bypasses the student app entirely
  if (isAdminRoute) {
    return <AdminApp />;
  }

  return <AxiomSessionProvider><AxiomApplication /></AxiomSessionProvider>;
}
