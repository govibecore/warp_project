import { useEffect, useRef, useState } from 'react';
import { supabase, supabaseUrl } from '../lib/supabase';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useWarpSession } from '../context/WarpSessionContext';
import { normalizeDifficulty } from '../domain/assessment';
import { motion, AnimatePresence } from 'motion/react';
import { signOutUser } from '../lib/auth';
import {
  User,
  Camera,
  LogOut,
  X,
  Save,
  Settings,
  Shield,
  BookOpen,
  GraduationCap,
  Phone,
  MapPin,
  Building2,
  Trash2,
  Bell,
  Moon,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Lock,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const CLASSES = Array.from({ length: 10 }, (_, i) => i + 3); // Classes 3–12

export interface StudentPreferences {
  whatsappReports: boolean;
  checkpointAlerts: boolean;
  socraticTips: boolean;
  nordicCanvas: boolean;
  antiGamification: boolean;
}

const DEFAULT_STUDENT_PREFERENCES: StudentPreferences = {
  whatsappReports: true,
  checkpointAlerts: true,
  socraticTips: false,
  nordicCanvas: true,
  antiGamification: true,
};

export type ProfileTab = 'profile' | 'settings' | 'account';
export type StudentGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type StudentDifficultyPref = 'standard' | 'advanced' | 'olympiad';

interface StudentProfile {
  full_name: string;
  parent_name: string;
  school_name: string;
  city: string;
  state: string;
  parent_phone: string;
  current_class: number;
  gender: StudentGender;
  preferred_language: string;
  difficulty_pref: StudentDifficultyPref;
  bio: string;
  avatar_url: string | null;
}

/** Persistent slide-over profile & settings panel + avatar ring trigger */
export function ProfilePanel({ hideTrigger = false }: { hideTrigger?: boolean } = {}) {
  const { user, isSignedIn, isLoaded } = useSupabaseAuth();
  const { setProfile } = useWarpSession();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ProfileTab>('profile');
  const [profile, setLocalProfile] = useState<StudentProfile>({
    full_name: '',
    parent_name: '',
    school_name: '',
    city: '',
    state: '',
    parent_phone: '',
    current_class: 8,
    gender: 'prefer_not_to_say',
    preferred_language: 'English',
    difficulty_pref: 'standard',
    bio: '',
    avatar_url: null,
  });
  const [initialProfile, setInitialProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // ── Persistent Student Preferences ──────────────────────────────────────────
  const [preferences, setPreferences] = useState<StudentPreferences>(() => {
    try {
      const userKey = user?.id ? `warp_student_preferences_${user.id}` : null;
      const stored = (userKey && localStorage.getItem(userKey)) || localStorage.getItem('warp_student_preferences');
      if (stored) return { ...DEFAULT_STUDENT_PREFERENCES, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_STUDENT_PREFERENCES;
  });

  // Reload preferences when user id changes
  useEffect(() => {
    try {
      const userKey = user?.id ? `warp_student_preferences_${user.id}` : null;
      const stored = (userKey && localStorage.getItem(userKey)) || localStorage.getItem('warp_student_preferences');
      if (stored) {
        setPreferences({ ...DEFAULT_STUDENT_PREFERENCES, ...JSON.parse(stored) });
      } else {
        setPreferences(DEFAULT_STUDENT_PREFERENCES);
      }
    } catch {}
  }, [user?.id]);

  // Persist preferences keyed by user id
  useEffect(() => {
    try {
      const userKey = user?.id ? `warp_student_preferences_${user.id}` : 'warp_student_preferences';
      localStorage.setItem(userKey, JSON.stringify(preferences));
    } catch {}
  }, [preferences, user?.id]);

  const updatePreference = (key: keyof StudentPreferences, val: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: val }));
  };

  // ── Listen for custom open events from User Dropdown & URL params ─────────
  useEffect(() => {
    const handleOpenProfile = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: ProfileTab }>;
      if (customEvent.detail?.tab) {
        setTab(customEvent.detail.tab);
      }
      setOpen(true);
    };
    window.addEventListener('warp:open-profile', handleOpenProfile);

    // Also support direct query string trigger (?settings or ?profile)
    const params = new URLSearchParams(window.location.search);
    if (params.has('settings')) {
      setTab('settings');
      setOpen(true);
    } else if (params.has('profile')) {
      setTab('profile');
      setOpen(true);
    }

    return () => {
      window.removeEventListener('warp:open-profile', handleOpenProfile);
    };
  }, []);

  // ── Dialog semantics, focus trap, and Escape key handling ────────────────
  useEffect(() => {
    if (!open) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = window.setTimeout(() => {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => el.offsetParent !== null);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElementRef.current?.focus?.();
    };
  }, [open]);

  // ── Load profile from Supabase eagerly on user change ────────────────────
  useEffect(() => {
    if (!user) {
      setLocalProfile(p => ({ ...p, full_name: '', avatar_url: null, bio: '' }));
      setInitialProfile(null);
      return;
    }
    setLoading(true);
    supabase
      .from('students')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const validGenders: StudentGender[] = ['male', 'female', 'other', 'prefer_not_to_say'];
          const parsedGender = data.gender && validGenders.includes(data.gender as StudentGender)
            ? (data.gender as StudentGender)
            : 'prefer_not_to_say';

          let parsedDiff = (data.difficulty_pref || 'standard').toLowerCase();
          if (parsedDiff === 'easy' || parsedDiff === 'medium') parsedDiff = 'standard';
          if (parsedDiff === 'hard') parsedDiff = 'olympiad';
          const validDiffs: StudentDifficultyPref[] = ['standard', 'advanced', 'olympiad'];
          const cleanDiff = validDiffs.includes(parsedDiff as StudentDifficultyPref)
            ? (parsedDiff as StudentDifficultyPref)
            : 'standard';

          const loaded: StudentProfile = {
            full_name: data.full_name ?? '',
            parent_name: data.parent_name ?? '',
            school_name: data.school_name ?? '',
            city: data.city ?? '',
            state: data.state ?? '',
            parent_phone: data.parent_phone ?? '',
            current_class: data.current_class ?? 8,
            gender: parsedGender,
            preferred_language: data.preferred_language ?? 'English',
            difficulty_pref: cleanDiff,
            bio: (data as any).bio ?? '',
            avatar_url: (data as any).avatar_url ?? null,
          };
          setLocalProfile(loaded);
          setInitialProfile(loaded);
        } else {
          const meta = user.user_metadata;
          const prefill: StudentProfile = {
            full_name: meta?.full_name ?? meta?.name ?? '',
            parent_name: '',
            school_name: '',
            city: '',
            state: '',
            parent_phone: '',
            current_class: 8,
            gender: 'prefer_not_to_say',
            preferred_language: 'English',
            difficulty_pref: 'standard',
            bio: '',
            avatar_url: null,
          };
          setLocalProfile(prefill);
          setInitialProfile(prefill);
        }
        setLoading(false);
      });
  }, [user?.id]);

  // Check if there are unsaved modifications
  const isDirty = initialProfile !== null && JSON.stringify(profile) !== JSON.stringify(initialProfile);

  // ── Avatar URL + Initials ──────────────────────────────────────────────────
  const avatarSrc = profile.avatar_url
    ? (profile.avatar_url.startsWith('http')
        ? profile.avatar_url
        : `${supabaseUrl}/storage/v1/object/public/avatars/${profile.avatar_url}`)
    : (user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null);

  const displayName =
    profile.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Learner';

  const initials = displayName
    ? displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  // ── Upload avatar ──────────────────────────────────────────────────────────
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ALLOWED: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = ALLOWED[file.type];
    if (!ext) {
      setError('Only JPEG, PNG, WebP, or GIF images are allowed.');
      return;
    }

    setAvatarUploading(true);
    setError(null);

    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setError('Avatar upload failed: ' + uploadError.message);
      setAvatarUploading(false);
      return;
    }

    const { error: dbError } = await supabase
      .from('students')
      .update({ avatar_url: path } as any)
      .eq('id', user.id);

    if (dbError) {
      console.warn('[ProfilePanel] Student update failed, attempting upsert with defaults:', dbError);
      await supabase.from('students').upsert(
        {
          id: user.id,
          full_name: profile.full_name || user.user_metadata?.full_name || 'Learner',
          current_class: profile.current_class || 8,
          avatar_url: path,
        } as any,
        { onConflict: 'id' }
      );
    }

    setLocalProfile(p => ({ ...p, avatar_url: path }));
    setAvatarUploading(false);

    // Notify navbar (and any other listener) that the avatar has changed
    window.dispatchEvent(new CustomEvent('warp:avatar-updated', { detail: { path } }));
  }

  // ── Remove avatar ──────────────────────────────────────────────────────────
  async function handleRemoveAvatar() {
    if (!user || !profile.avatar_url) return;
    await supabase.storage.from('avatars').remove([profile.avatar_url]);
    await supabase.from('students').update({ avatar_url: null } as any).eq('id', user.id);
    setLocalProfile(p => ({ ...p, avatar_url: null }));
    window.dispatchEvent(new CustomEvent('warp:avatar-updated', { detail: { path: null } }));
  }

  // ── Save profile ───────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);

    // Sanitize gender to strictly match DB check constraint:
    // gender IN ('male', 'female', 'other', 'prefer_not_to_say')
    const validGenders: StudentGender[] = ['male', 'female', 'other', 'prefer_not_to_say'];
    const sanitizedGender: StudentGender =
      profile.gender && validGenders.includes(profile.gender as StudentGender)
        ? (profile.gender as StudentGender)
        : 'prefer_not_to_say';

    // Sanitize difficulty_pref to strictly match DB check constraint:
    // difficulty_pref IN ('standard', 'advanced', 'olympiad')
    let diffStr = (profile.difficulty_pref || 'standard').toLowerCase();
    if (diffStr === 'easy' || diffStr === 'medium') diffStr = 'standard';
    if (diffStr === 'hard') diffStr = 'olympiad';
    const validDiffs: StudentDifficultyPref[] = ['standard', 'advanced', 'olympiad'];
    const sanitizedDiff: StudentDifficultyPref = validDiffs.includes(diffStr as StudentDifficultyPref)
      ? (diffStr as StudentDifficultyPref)
      : 'standard';

    const cleanClass = Math.max(3, Math.min(12, Number(profile.current_class) || 8));

    const payload = {
      id: user.id,
      full_name: profile.full_name?.trim() || user.user_metadata?.full_name || 'Learner',
      parent_name: profile.parent_name?.trim() || null,
      school_name: profile.school_name?.trim() || null,
      city: profile.city?.trim() || null,
      state: profile.state?.trim() || null,
      parent_phone: profile.parent_phone?.trim() || null,
      current_class: cleanClass,
      gender: sanitizedGender,
      preferred_language: profile.preferred_language || 'English',
      difficulty_pref: sanitizedDiff,
      bio: profile.bio?.trim() || null,
    };

    const { data: updatedUser, error: err } = await supabase
      .from('students')
      .upsert(payload as any, { onConflict: 'id' })
      .select()
      .single();

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    // Sync WarpSession Context
    if (updatedUser) {
      setProfile({
        name: updatedUser.full_name || 'Learner',
        classLevel: updatedUser.current_class || 8,
        difficulty: normalizeDifficulty(updatedUser.difficulty_pref),
        schoolName: updatedUser.school_name ?? undefined,
      });
    }

    setInitialProfile(profile);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // ── Copy User ID ───────────────────────────────────────────────────────────
  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // ── Sign out ───────────────────────────────────────────────────────────────
  async function handleSignOut() {
    setOpen(false);
    await signOutUser();
  }

  // ── Trigger Button Skeleton ────────────────────────────────────────────────
  if (!isLoaded) {
    if (hideTrigger) return null;
    return (
      <div className="size-8 bg-surface border border-border animate-pulse" aria-label="Loading profile" />
    );
  }

  return (
    <>
      {/* ── Header Trigger Button ──────────────────────────────────────────── */}
      {hideTrigger ? (
        <button
          id="profile-panel-trigger"
          onClick={() => setOpen(true)}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : (
        <button
          id="profile-panel-trigger"
          onClick={() => setOpen(true)}
          className="relative flex size-8 items-center justify-center overflow-hidden rounded-none border border-border bg-surface text-foreground-secondary hover:border-primary hover:text-foreground transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          aria-label="Open profile & settings"
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt="Avatar" className="size-full object-cover" />
          ) : user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="size-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-[11px] font-bold font-mono">{initials}</span>
          )}
          {isSignedIn && (
            <span className="absolute bottom-0 right-0 size-2 bg-emerald-500 rounded-full border border-background" />
          )}
        </button>
      )}

      {/* ── Backdrop ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Slide-over Panel ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 z-70 flex h-screen w-full max-w-md sm:max-w-lg flex-col bg-background border-l border-border shadow-2xl overflow-hidden"
            aria-label="Student profile and settings"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface/30">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-none bg-primary" />
                <span id="profile-panel-title" className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-primary">
                  WARP // STUDENT IDENTITY & SETTINGS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[10px] font-mono text-foreground-muted px-1.5 py-0.5 border border-border">
                  ESC
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="flex size-7 items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* ── Avatar + Identity Hero ────────────────────────────────── */}
            <div className="flex flex-col items-center gap-3.5 border-b border-border px-6 py-6 bg-surface/20 relative">
              {/* Corner marks styling */}
              <div className="corner-marks absolute inset-0 pointer-events-none opacity-40" />

              {/* Avatar frame */}
              <div className="relative group">
                <div className="size-20 overflow-hidden rounded-none border border-primary/40 bg-card flex items-center justify-center">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile" className="size-full object-cover" />
                  ) : user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="size-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-2xl font-bold font-mono text-primary">{initials}</span>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <div className="size-5 border-2 border-primary border-t-transparent rounded-none animate-spin" />
                    </div>
                  )}
                </div>

                {isSignedIn && (
                  <div className="absolute -bottom-1.5 -right-1.5 flex gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex size-6.5 items-center justify-center bg-primary text-primary-foreground hover:bg-primary/80 transition-colors rounded-none cursor-pointer"
                      title="Upload photo"
                    >
                      <Camera className="size-3.5" />
                    </button>
                    {profile.avatar_url && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="flex size-6.5 items-center justify-center bg-destructive text-white hover:bg-destructive/80 transition-colors rounded-none cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className="font-display font-bold text-base sm:text-lg text-foreground tracking-tight">
                    {displayName}
                  </h2>
                  {isSignedIn && (
                    <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                      Verified Learner
                    </Badge>
                  )}
                </div>
                {user?.email && (
                  <p className="text-xs text-foreground-muted font-mono">{user.email}</p>
                )}
                {profile.current_class > 0 && (
                  <div className="pt-1 flex items-center justify-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-card border border-border text-[11px] font-mono font-semibold text-foreground-secondary">
                      <GraduationCap className="size-3.5 text-primary" />
                      Class {profile.current_class} · {profile.school_name || 'Academic Track'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Segmented Tab Bar ────────────────────────────────────────── */}
            <div className="flex border-b border-border bg-surface/40 px-6 pt-2">
              {(['profile', 'settings', 'account'] as ProfileTab[]).map(t => {
                const isActive = tab === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'text-primary'
                        : 'text-foreground-muted hover:text-foreground'
                    }`}
                  >
                    {t === 'profile' && <User className="size-3.5" />}
                    {t === 'settings' && <Settings className="size-3.5" />}
                    {t === 'account' && <Shield className="size-3.5" />}
                    <span>{t}</span>

                    {isActive && (
                      <motion.div
                        layoutId="active-profile-tab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Tab Content Container ──────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-foreground-muted">Loading profile data…</p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* ══════════════════════════════════════════════════════
                        PROFILE TAB
                    ══════════════════════════════════════════════════════ */}
                    {tab === 'profile' && (
                      <>
                        {/* Student Details */}
                        <FieldGroup label="Academic Identity" icon={<GraduationCap className="size-3.5" />} badge="Required for CAT">
                          <ProfileInput
                            label="Full Student Name"
                            value={profile.full_name}
                            disabled={!isSignedIn}
                            placeholder="e.g. Alex Mercer"
                            icon={<User className="size-3.5" />}
                            onChange={v => setLocalProfile(p => ({ ...p, full_name: v }))}
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="profile-current-class" className="block text-[10px] font-mono uppercase tracking-wider text-foreground-muted mb-1">
                                Current Class
                              </label>
                              <select
                                id="profile-current-class"
                                value={profile.current_class}
                                disabled={!isSignedIn}
                                onChange={e => setLocalProfile(p => ({ ...p, current_class: Number(e.target.value) }))}
                                className="w-full rounded-none border border-border bg-surface px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                              >
                                {CLASSES.map(c => (
                                  <option key={c} value={c} className="bg-card text-foreground">Class {c} (Grade {c})</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label htmlFor="profile-gender" className="block text-[10px] font-mono uppercase tracking-wider text-foreground-muted mb-1">
                                Gender
                              </label>
                              <select
                                id="profile-gender"
                                value={profile.gender || 'prefer_not_to_say'}
                                disabled={!isSignedIn}
                                onChange={e => setLocalProfile(p => ({ ...p, gender: e.target.value as StudentGender }))}
                                className="w-full rounded-none border border-border bg-surface px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                              >
                                <option value="prefer_not_to_say" className="bg-card text-foreground">Prefer not to say</option>
                                <option value="male" className="bg-card text-foreground">Male</option>
                                <option value="female" className="bg-card text-foreground">Female</option>
                                <option value="other" className="bg-card text-foreground">Other</option>
                              </select>
                            </div>
                          </div>

                          <ProfileInput
                            label="School / Institution"
                            icon={<Building2 className="size-3.5" />}
                            value={profile.school_name}
                            disabled={!isSignedIn}
                            placeholder="e.g. Delhi Public School"
                            onChange={v => setLocalProfile(p => ({ ...p, school_name: v }))}
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <ProfileInput
                              label="City"
                              icon={<MapPin className="size-3.5" />}
                              value={profile.city}
                              disabled={!isSignedIn}
                              placeholder="City"
                              onChange={v => setLocalProfile(p => ({ ...p, city: v }))}
                            />
                            <ProfileInput
                              label="State / Region"
                              value={profile.state}
                              disabled={!isSignedIn}
                              placeholder="State"
                              onChange={v => setLocalProfile(p => ({ ...p, state: v }))}
                            />
                          </div>
                        </FieldGroup>

                        {/* Parent Details */}
                        <FieldGroup label="Parent / Guardian WhatsApp Contact" icon={<Phone className="size-3.5" />} badge="Report Delivery">
                          <ProfileInput
                            label="Parent / Guardian Name"
                            value={profile.parent_name}
                            disabled={!isSignedIn}
                            placeholder="e.g. Eleanor Mercer"
                            icon={<User className="size-3.5" />}
                            onChange={v => setLocalProfile(p => ({ ...p, parent_name: v }))}
                          />
                          <ProfileInput
                            label="WhatsApp Phone Number"
                            icon={<Phone className="size-3.5" />}
                            type="tel"
                            value={profile.parent_phone}
                            disabled={!isSignedIn}
                            placeholder="+91 98765 43210"
                            hint="Official diagnostic reports sent here"
                            onChange={v => setLocalProfile(p => ({ ...p, parent_phone: v }))}
                          />
                        </FieldGroup>

                        {/* About Me */}
                        <FieldGroup label="Student Bio & Notes" icon={<BookOpen className="size-3.5" />}>
                          <label htmlFor="profile-student-bio" className="sr-only">
                            Student Bio & Notes
                          </label>
                          <textarea
                            id="profile-student-bio"
                            value={profile.bio}
                            onChange={e => setLocalProfile(p => ({ ...p, bio: e.target.value }))}
                            disabled={!isSignedIn}
                            rows={3}
                            maxLength={280}
                            placeholder="Share your learning interests, competitive olympiad goals, or STEM aspirations…"
                            className="w-full resize-none border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                          />
                          <div className="flex items-center justify-between text-[10px] text-foreground-muted font-mono">
                            <span>Markdown supported</span>
                            <span>{profile.bio.length}/280</span>
                          </div>
                        </FieldGroup>
                      </>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        SETTINGS TAB
                    ══════════════════════════════════════════════════════ */}
                    {tab === 'settings' && (
                      <>
                        <FieldGroup label="Adaptive Assessment Calibration" icon={<Sliders className="size-3.5" />} badge="3PL IRT">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-foreground-muted mb-1.5">
                              Baseline Difficulty Track
                            </label>
                            <div className="space-y-2">
                              {[
                                { id: 'standard', label: 'Grade Standard (Recommended)', desc: 'Foundation Level & standard benchmark calibration' },
                                { id: 'advanced', label: 'Advanced Analytical Track', desc: 'Accelerated problem-solving and multi-concept application' },
                                { id: 'olympiad', label: 'International Olympiad Track', desc: 'SASMO, AMC 8, and Gifted analytical traps' },
                              ].map(opt => (
                                <label
                                  key={opt.id}
                                  className={`flex items-start gap-3 p-3 border transition-colors cursor-pointer ${
                                    profile.difficulty_pref === opt.id
                                      ? 'border-primary bg-primary/5 text-foreground'
                                      : 'border-border bg-surface/50 text-foreground-secondary hover:border-border-strong'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="difficulty_pref"
                                    value={opt.id}
                                    checked={profile.difficulty_pref === opt.id}
                                    onChange={e => setLocalProfile(p => ({ ...p, difficulty_pref: e.target.value as StudentDifficultyPref }))}
                                    className="mt-0.5 text-primary focus:ring-primary"
                                    disabled={!isSignedIn}
                                  />
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-foreground">{opt.label}</p>
                                    <p className="text-[11px] text-foreground-muted">{opt.desc}</p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2">
                            <label htmlFor="profile-preferred-language" className="block text-[10px] font-mono uppercase tracking-wider text-foreground-muted mb-1">
                              Primary Test Language
                            </label>
                            <select
                              id="profile-preferred-language"
                              value={profile.preferred_language}
                              disabled={!isSignedIn}
                              onChange={e => setLocalProfile(p => ({ ...p, preferred_language: e.target.value }))}
                              className="w-full rounded-none border border-border bg-surface px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                            >
                              <option value="English" className="bg-card text-foreground">English (International)</option>
                              <option value="Hindi" className="bg-card text-foreground">Hindi (हिंदी)</option>
                            </select>
                          </div>
                        </FieldGroup>

                        <FieldGroup label="Notification Preferences" icon={<Bell className="size-3.5" />}>
                          <ToggleRow
                            label="WhatsApp PTM Reports"
                            description="Automatically dispatch PDF audit summaries after tests"
                            icon={<Phone className="size-3.5" />}
                            checked={preferences.whatsappReports}
                            onChange={v => updatePreference('whatsappReports', v)}
                          />
                          <ToggleRow
                            label="30-Day Checkpoint Alerts"
                            description="Notifications when your next calibration window opens"
                            icon={<Bell className="size-3.5" />}
                            checked={preferences.checkpointAlerts}
                            onChange={v => updatePreference('checkpointAlerts', v)}
                          />
                          <ToggleRow
                            label="Socratic Guidance Tips"
                            description="Weekly cognitive misstep analysis and hints"
                            icon={<Sparkles className="size-3.5" />}
                            checked={preferences.socraticTips}
                            onChange={v => updatePreference('socraticTips', v)}
                          />
                        </FieldGroup>

                        <FieldGroup label="Display & Accessibility" icon={<Moon className="size-3.5" />}>
                          <ToggleRow
                            label="Nordic Lagom Canvas"
                            description="High-contrast dark theme optimized for long study sessions"
                            icon={<Moon className="size-3.5" />}
                            checked={preferences.nordicCanvas}
                            onChange={v => updatePreference('nordicCanvas', v)}
                          />
                          <ToggleRow
                            label="Anti-Gamification Guard"
                            description="Suppresses distracting confetti and pressure countdowns"
                            icon={<Shield className="size-3.5" />}
                            checked={preferences.antiGamification}
                            onChange={v => updatePreference('antiGamification', v)}
                          />
                        </FieldGroup>
                      </>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        ACCOUNT TAB
                    ══════════════════════════════════════════════════════ */}
                    {tab === 'account' && (
                      <>
                        {isSignedIn ? (
                          <>
                            <FieldGroup label="Account Credentials" icon={<Shield className="size-3.5" />}>
                              <InfoRow label="Email Address" value={user?.email ?? '-'} />
                              <InfoRow
                                label="Student ID (UUID)"
                                value={user?.id ? `${user.id.slice(0, 16)}…` : '-'}
                                mono
                                copyable
                                onCopy={handleCopyId}
                                copied={copiedId}
                              />
                              <InfoRow
                                label="Member Since"
                                value={
                                  user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : '-'
                                }
                              />
                              <InfoRow
                                label="Authentication Provider"
                                value={user?.app_metadata?.provider ? String(user.app_metadata.provider).toUpperCase() : 'EMAIL / PASSWORD'}
                                mono
                              />
                            </FieldGroup>

                            <FieldGroup label="India DPDP Act 2023 & Consent" icon={<Lock className="size-3.5" />} badge="Verified">
                              <p className="text-[11px] text-foreground-secondary leading-relaxed">
                                Your psychometric learning signals and calibration responses are processed in strict compliance with the Digital Personal Data Protection (DPDP) Act 2023. Student data is never sold or utilized for third-party commercial profiling.
                              </p>
                            </FieldGroup>

                            <div className="p-4 border border-destructive/30 bg-destructive/5 space-y-3">
                              <h4 className="text-xs font-bold text-destructive font-mono uppercase tracking-wider">
                                Session Termination
                              </h4>
                              <p className="text-[11px] text-foreground-secondary">
                                End your active authentication session and clear cached credentials from this browser.
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                className="w-full text-destructive hover:bg-destructive/10 border border-destructive/30 text-xs font-mono"
                              >
                                <LogOut className="size-3.5" />
                                Sign out of all sessions
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-4 py-2">
                            <div className="flex items-center gap-3 p-3 bg-surface border border-border">
                              <div className="size-9 flex items-center justify-center border border-border bg-background shrink-0">
                                <Shield className="size-4 text-primary" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-foreground">Guest Session Active</p>
                                <p className="text-[11px] text-foreground-muted">Sign in to save your history and sync results across devices.</p>
                              </div>
                            </div>
                            <InlineAuthCard onSuccess={() => setOpen(false)} />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* ── Floating Sticky Footer: Save / Status ──────────── */}
                  {isSignedIn && tab !== 'account' && (
                    <div className="border-t border-border px-6 py-4 bg-surface/50 backdrop-blur-xs flex items-center gap-3">
                      {isDirty && !saved && !error && (
                        <span className="flex items-center gap-1.5 text-[11px] text-amber-500 font-mono">
                          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Unsaved changes
                        </span>
                      )}
                      {error && (
                        <p className="flex-1 flex items-center gap-1.5 text-[11px] text-destructive">
                          <AlertCircle className="size-3.5 shrink-0" />{error}
                        </p>
                      )}
                      {saved && !error && (
                        <p className="flex-1 flex items-center gap-1.5 text-[11px] text-emerald-500 font-mono">
                          <CheckCircle2 className="size-3.5 shrink-0" />Changes saved!
                        </p>
                      )}
                      {!error && !saved && !isDirty && <span className="flex-1" />}
                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={saving || !isDirty}
                          className="gap-1.5 text-xs font-mono font-bold px-4"
                        >
                          <Save className="size-3.5" />
                          {saving ? 'Saving…' : 'Save changes'}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function FieldGroup({
  label,
  icon,
  badge,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 border border-border bg-surface/30 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider text-foreground">{label}</h3>
        </div>
        {badge && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-primary/30 text-primary bg-primary/5">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ProfileInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  icon,
  disabled,
  placeholder,
  hint,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  const inputId = id || `profile-input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={inputId} className="block text-[10px] font-mono uppercase tracking-wider text-foreground-muted">
          {label}
        </label>
        {hint && <span className="text-[9px] font-mono text-foreground-muted">{hint}</span>}
      </div>
      <div className="relative flex items-center">
        {icon && <span className="absolute left-2.5 text-foreground-muted pointer-events-none">{icon}</span>}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full border border-border bg-surface text-xs text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none transition-colors disabled:opacity-50 ${
            icon ? 'pl-8 pr-3 py-2' : 'px-3 py-2'
          }`}
        />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  copyable,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 text-xs">
      <span className="text-[11px] text-foreground-muted font-mono">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[11px] font-medium text-foreground ${mono ? 'font-mono' : ''}`}>
          {value}
        </span>
        {copyable && onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="text-foreground-muted hover:text-primary transition-colors p-1 border border-border bg-surface"
            title="Copy value"
          >
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
          </button>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  icon,
  defaultChecked = false,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon?: React.ReactNode;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (val: boolean) => void;
}) {
  const [internalOn, setInternalOn] = useState(defaultChecked);
  const on = checked !== undefined ? checked : internalOn;
  const toggle = () => {
    if (onChange) onChange(!on);
    else setInternalOn(!internalOn);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-primary/70">{icon}</span>}
        <div>
          <p className="text-xs text-foreground font-medium">{label}</p>
          <p className="text-[10px] text-foreground-muted">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className={`relative inline-flex h-5 w-9 items-center rounded-none transition-colors border ${
          on ? 'bg-primary border-primary' : 'bg-surface border-border'
        }`}
        role="switch"
        aria-checked={on}
      >
        <span
          className={`inline-block size-3.5 bg-background border border-foreground/20 transform transition-transform ${
            on ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function InlineAuthCard({ onSuccess }: { onSuccess?: () => void }) {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: email.trim().split('@')[0],
          },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        setNotice('Account created! Signed in successfully.');
        onSuccess?.();
      } else if (data.user) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (!signInErr && signInData.session) {
          setNotice('Account created! Signed in successfully.');
          onSuccess?.();
        } else {
          setNotice('Account created! Please sign in with your password.');
          setMode('signin');
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid login credentials. If you are new, click "Create account".');
        } else {
          setError(error.message);
        }
      } else {
        setNotice('Signed in successfully!');
        onSuccess?.();
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/?dashboard` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
          {mode === 'signin' ? 'Sign In' : 'Create Free Account'}
        </span>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setNotice(null);
            setMode(m => m === 'signin' ? 'register' : 'signin');
          }}
          className="text-[11px] text-primary hover:underline font-mono"
        >
          {mode === 'signin' ? 'Need an account?' : 'Already have one?'}
        </button>
      </div>

      {notice && (
        <div className="p-2 text-[11px] bg-primary/10 border border-primary/20 text-primary">
          {notice}
        </div>
      )}
      {error && (
        <div className="p-2 text-[11px] bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <label htmlFor="inline-auth-email" className="block text-[10px] font-mono text-foreground-muted mb-1">Email</label>
          <input
            id="inline-auth-email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="student@example.com"
            className="w-full border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="inline-auth-password" className="block text-[10px] font-mono text-foreground-muted mb-1">Password</label>
          <input
            id="inline-auth-password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <Button type="submit" size="sm" block disabled={loading}>
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-surface px-2 text-foreground-muted font-mono font-bold">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        block
        disabled={loading}
        onClick={handleGoogle}
        className="gap-2 text-xs"
      >
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continue with Google
      </Button>
    </div>
  );
}
