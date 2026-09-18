import { WarpSessionProvider, useWarpSession } from './context/WarpSessionContext';
import { AppShell } from './components/AppShell';
import { Assessment } from './components/Assessment';
import { AssessmentHub } from './components/AssessmentHub';
import { Landing } from './components/Landing';
import { MarketingPage } from './components/MarketingPage';
import { Onboarding } from './components/Onboarding';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { ReportDetail } from './components/dashboard/ReportDetail';
import { ProfileSetup } from './components/ProfileSetup';
import { AdminApp } from './components/admin/AdminApp';
import { SharedReport } from './components/SharedReport';
import { AnimatePresence, motion } from 'motion/react';

import { useEffect, useState, useRef, useCallback } from 'react';

import { useSupabaseAuth } from './context/SupabaseAuthContext';
import { supabase } from './lib/supabase';
import { normalizeDifficulty } from './domain/assessment';

// ── Admin portal: served at /admin or /admin/* ───────────────────────
const isAdminRoute = window.location.pathname.startsWith('/admin');

function WarpApplication() {
  const { session, enterApp, setProfile, selectSubject, goHome } = useWarpSession();
  const { isLoaded, isSignedIn, user, studentProfile } = useSupabaseAuth();
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // URL routing for dashboard/reports
  const params = new URLSearchParams(window.location.search);
  const isDashboard = params.has('dashboard');
  const pageParam = params.get('page');
  const assessmentParam = params.get('assessment');
  const isNewAssessment = assessmentParam === 'new';
  const shareParam = params.get('share');
  const isSharedReport = Boolean(shareParam && shareParam.length > 3);
  const hasAssessmentId = Boolean(
    assessmentParam &&
    assessmentParam !== 'new' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assessmentParam)
  );

  // If user arrives with ?assessment=new, cleanly replace history to root
  useEffect(() => {
    if (isNewAssessment) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isNewAssessment]);

  // Support direct deep links to onboarding/auth (?choose, ?login, ?register)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('choose') || searchParams.has('login') || searchParams.has('register')) {
      if (session.phase !== 'onboarding' && session.phase !== 'hub' && session.phase !== 'assessment') {
        enterApp();
      }
    }
  }, [session.phase, enterApp]);

  // Support browser Back/Forward popstate navigation
  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('choose') || searchParams.has('login') || searchParams.has('register')) {
        enterApp();
      } else if (!searchParams.has('dashboard') && !searchParams.has('assessment') && !searchParams.has('share')) {
        goHome();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [enterApp, goHome]);

  // Auto-redirect signed-in users from landing → dashboard.
  // This covers two cases:
  //   1. Google OAuth bounces to /?dashboard - URL already has the param so isDashboard is true (handled above).
  //   2. A signed-in user manually navigates to / - send them to their dashboard.
  useEffect(() => {
    if (isLoaded && isSignedIn && session.phase === 'landing' && !isDashboard && !hasAssessmentId && !isSharedReport && !pageParam) {
      window.history.replaceState({}, '', '/?dashboard');
      // Force a URL-param re-read by reloading in-place
      window.location.replace('/?dashboard');
    }
  }, [isLoaded, isSignedIn, session.phase, isDashboard, hasAssessmentId, isSharedReport, pageParam]);

  // Synchronize user to Supabase public.users and WarpSession
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Store user in Supabase database without overwriting existing current_class
      const syncUser = async () => {
        if (!user.email) return;
        const { data: existing } = await supabase
          .from('students')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existing) {
          const { error } = await supabase.from('students').insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            current_class: 8,
          });
          if (error) console.error('Failed to insert user in Supabase:', error);
        } else if (user.user_metadata?.full_name) {
          await supabase.from('students').update({
            full_name: user.user_metadata.full_name,
          }).eq('id', user.id);
        }
      };
      syncUser();
    }
  }, [isLoaded, isSignedIn, user]);

  // Save assessment to Supabase when completed with sufficient responses
  useEffect(() => {
    const responseList = session.responses ? Object.values(session.responses) : [];
    const currentResult = session.result;
    if (session.phase === 'results' && currentResult && !hasAssessmentId && user && responseList.length >= 5) {
      const saveAssessment = async () => {
        const scaledScores = currentResult.competencies
          ? Object.fromEntries(Object.entries(currentResult.competencies).map(([k, v]) => [k, v.score]))
          : null;
        const abilityTheta = currentResult.competencies
          ? Object.fromEntries(Object.entries(currentResult.competencies).map(([k, v]) => [k, v.zScore]))
          : null;
        const percentiles = currentResult.regionalPercentiles
          ? { global: currentResult.regionalPercentiles.Global, ...currentResult.regionalPercentiles }
          : null;

        const { data: assessment, error } = await supabase.from('assessments').insert({
          student_id: user.id,
          class_level: session.profile?.classLevel || 8,
          difficulty: session.profile?.difficulty?.toLowerCase() || 'standard',
          subject: session.plan?.subject || 'STEM',
          status: 'completed',
          responses: responseList as any,
          global_score: currentResult.overallScore ?? null,
          ability_theta: abilityTheta,
          scaled_scores: scaledScores,
          percentiles: percentiles,
          started_at: session.assessmentStartedAt || new Date().toISOString(),
          completed_at: currentResult.completedAt || new Date().toISOString()
        } as any).select().single();

        if (assessment && !error) {
          window.location.search = `?assessment=${assessment.id}`;
        }
      };
      saveAssessment();
    }
  }, [session.phase, session.result, hasAssessmentId, user, session]);

  const handleEnterApp = useCallback((mode?: 'choose' | 'login' | 'register') => {
    if (mode && typeof window !== 'undefined') {
      window.history.pushState({}, '', `?${mode}`);
    }
    enterApp();
  }, [enterApp]);

  const isProfileComplete = Boolean(
    studentProfile && 
    studentProfile.full_name && 
    studentProfile.current_class && 
    studentProfile.parent_name && 
    studentProfile.school_name
  );

  // Determine what body to render
  let body;

  if (pageParam) {
    body = <MarketingPage key="marketing" slug={pageParam} onEnter={handleEnterApp} />;
  } else if (isDashboard) {
    if (!isLoaded) {
      body = <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-none animate-spin" /></div>;
    } else if (isSignedIn) {
      body = isProfileComplete ? <StudentDashboard key="dashboard" /> : <ProfileSetup key="profileSetup" />;
    } else {
      body = <Landing key="landing" onEnter={handleEnterApp} />;
    }
  } else if (isSharedReport && shareParam) {
    body = <SharedReport key="shared" token={shareParam} />;
  } else if (hasAssessmentId) {
    body = <ReportDetail key="report" />;
  } else if (session.phase === 'landing') {
    body = <Landing key="landing" onEnter={handleEnterApp} />;
  } else if (session.phase === 'onboarding') {
    if (!isSignedIn) {
      body = <Onboarding key="onboarding" />;
    } else if (!isProfileComplete || needsProfileSetup) {
      body = <ProfileSetup key="profileSetup" />;
    } else {
      body = <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-none animate-spin" /></div>;
    }
  } else if (session.phase === 'hub') {
    body = <AssessmentHub key="hub" onSelectSubject={selectSubject} />;
  } else if (session.phase === 'results' && session.result) {
    body = <ReportDetail key="results" />;
  } else {
    body = <Assessment key="assessment" />;
  }

  const lastCheckedUserId = useRef<string | null>(null);

  // Auto-redirect or auto-start assessment if auth completes while in onboarding
  useEffect(() => {
    if (!isSignedIn) {
      lastCheckedUserId.current = null;
      return;
    }

    // Do not auto-start assessment if the candidate is actively on the registration or choose views
    if (typeof window !== 'undefined' && window.location.search) {
      const p = new URLSearchParams(window.location.search);
      if (p.has('register') || p.has('choose')) {
        return;
      }
    }

    if (session.phase === 'onboarding' && isLoaded && isSignedIn && user && user.email) {
      if (lastCheckedUserId.current === user.id && session.profile?.name) {
        return;
      }
      lastCheckedUserId.current = user.id;

      // Automatically start the assessment with their saved profile
      if (!studentProfile || !studentProfile.full_name || !studentProfile.current_class || !studentProfile.parent_name || !studentProfile.school_name) {
        setNeedsProfileSetup(true);
      } else {
        // Clean up any auth query params from the URL so page refreshes don't re-trigger onboarding
        if (typeof window !== 'undefined' && window.location.search) {
          const p = new URLSearchParams(window.location.search);
          if (p.has('login') || p.has('register') || p.has('choose')) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
        setProfile({
          name: studentProfile.full_name || 'Learner',
          classLevel: studentProfile.current_class || 8,
          difficulty: normalizeDifficulty(studentProfile.difficulty_pref),
          schoolName: studentProfile.school_name ?? undefined
        });
      }
    }
  }, [session.phase, isLoaded, isSignedIn, user, session.profile, setProfile, studentProfile]);

  // If a logged-out user returns or signs out, redirect to the landing page instead of hub/assessment/results
  useEffect(() => {
    if (
      isLoaded &&
      !isSignedIn &&
      (session.phase === 'hub' || session.phase === 'assessment' || session.phase === 'results' || isDashboard)
    ) {
      if (isDashboard) {
        window.history.replaceState({}, '', '/?login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        goHome();
      }
    }
  }, [isLoaded, isSignedIn, session.phase, isDashboard, goHome]);

  return (
    <AppShell
      scrollable={
        session.phase === 'landing' ||
        session.phase === 'onboarding' ||
        session.phase === 'hub' ||
        isSharedReport ||
        hasAssessmentId
      }
      hideHeader={(session.phase === 'landing' || session.phase === 'onboarding' || isSharedReport) && !isDashboard}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDashboard ? 'dash' : (hasAssessmentId || isSharedReport) ? 'rep' : session.phase}
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

  return <WarpSessionProvider><WarpApplication /></WarpSessionProvider>;
}
