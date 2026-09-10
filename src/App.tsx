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

import { useAuth, useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
// @ts-ignore
import { api } from '../convex/_generated/api';

// ── Admin portal: served at /admin or /admin/* ───────────────────────
const isAdminRoute = window.location.pathname.startsWith('/admin');

function AxiomApplication() {
  const { session, enterApp, setProfile } = useAxiomSession();
  const { isGuest } = useAuthStore();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const storeUser = useMutation(api.users.storeUser);

  // URL routing for dashboard/reports
  const params = new URLSearchParams(window.location.search);
  const isDashboard = params.has('dashboard');
  const hasAssessmentId = params.has('assessment');

  // Synchronize Clerk user to Convex and AxiomSession
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Store user in Convex database
      storeUser().catch((err) => console.error('Failed to store user in Convex:', err));

      // Auto-set the local profile for backward compatibility if it's not set
      if (!session.profile) {
        setProfile({
          name: user.fullName || 'Learner',
          classLevel: 8, // Default, can be updated later
          difficulty: 'Standard',
        });
      }
    }
  }, [isLoaded, isSignedIn, user, storeUser, session.profile, setProfile]);

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
