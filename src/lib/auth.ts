import { supabase } from './supabase';
import { useAuthStore } from '../stores/authStore';
import { useAssessment } from '../hooks/useAssessment';
import { resetSession } from '../persistence/storage';

/**
 * Centrally and completely signs out the user:
 * 1. Resets persisted WARP session and profile (prevents hydrating old profile into 'hub' / Choose Assessment)
 * 2. Clears zustand stores (authStore & useAssessment)
 * 3. Signs out of Supabase auth
 * 4. Cleans any URL search parameters (like ?dashboard, ?choose) and redirects cleanly to '/' (Landing Page)
 */
export async function signOutUser(): Promise<void> {
  // 1. Mark logged-out immediately and clear only WARP-specific keys.
  //    Do NOT remove the Supabase sb-*-auth-token here — if we wipe it before
  //    calling supabase.auth.signOut(), Supabase's storage-change listener fires
  //    SIGNED_OUT first, which clears the in-memory session. Then signOut() has
  //    no access token to send, skips the HTTP POST to /auth/v1/logout, and our
  //    Playwright mock never intercepts the request (causing the mobile flaky timeout).
  //    Supabase's own signOut() will clear its token from storage as part of the call.
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem('logged_out', 'true');
      resetSession(window.localStorage);
      window.localStorage.removeItem('warp_guest_student_id');
      window.localStorage.removeItem('warp.session.v2');
      window.localStorage.removeItem('warp.profile.v1');
      window.localStorage.removeItem('warp.session_id.v1');
      window.localStorage.removeItem('warp_persisted_session');
    } catch {}
  }

  // 2. Clear zustand stores
  useAuthStore.getState().clearAuth();
  useAssessment.getState().resetAssessment();

  // 3. Sign out of Supabase — this makes the POST /auth/v1/logout network call
  //    using the still-live in-memory session, then clears its own sb-* storage key.
  //    On error, retry with scope:'local' to guarantee local session revocation.
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Supabase sign out error returned, attempting local revocation retry:', error);
      const { error: localRetryError } = await supabase.auth.signOut({ scope: 'local' });
      if (localRetryError) {
        console.error('Supabase local scope sign out retry failed:', localRetryError);
      }
    }
  } catch (e) {
    console.error('Supabase sign out unexpected exception:', e);
  }

  // 4. Sweep any leftover sb-* tokens Supabase may not have cleaned up (safety net)
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => window.localStorage.removeItem(k));
    } catch {}
  }

  // 5. Redirect cleanly to landing page
  if (typeof window !== 'undefined') {
    window.location.replace('/');
  }
}
