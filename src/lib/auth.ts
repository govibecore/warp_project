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
  // 1. Sign out of Supabase first so SDK can transmit revocation request to auth server
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error('Supabase sign out error:', e);
  }

  // 2. Clear zustand stores
  useAuthStore.getState().clearAuth();
  useAssessment.getState().resetAssessment();

  // 3. Reset Warp session storage & remove any remaining client tokens
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem('logged_out', 'true');
      resetSession(window.localStorage);
      window.localStorage.removeItem('warp_guest_student_id');
      window.localStorage.removeItem('warp.session.v2');
      window.localStorage.removeItem('warp.profile.v1');
      window.localStorage.removeItem('warp.session_id.v1');
      window.localStorage.removeItem('warp_persisted_session');

      // Clear any leftover Supabase client auth tokens
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

  // 4. Redirect cleanly to landing page
  if (typeof window !== 'undefined') {
    window.location.replace('/');
  }
}
