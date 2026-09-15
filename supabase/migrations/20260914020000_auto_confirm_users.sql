-- Migration: Ensure email verification integrity and preserve DPDP parental consent gating
-- Removed blanket auto-confirm trigger and bulk student consent verification to satisfy security compliance.

-- Drop any legacy auto-confirm triggers to ensure genuine verification
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.auth_auto_confirm_user();

-- Consent records must remain 'pending' until parent verification details are supplied and email is verified.

