-- Migration: Auto-confirm users on signup to avoid SMTP delivery bottlenecks
-- When email is submitted, stamps email_confirmed_at = now() BEFORE INSERT on auth.users

CREATE OR REPLACE FUNCTION public.auth_auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;

CREATE TRIGGER on_auth_user_auto_confirm
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auth_auto_confirm_user();

-- Update any existing unconfirmed accounts
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

UPDATE public.students
SET consent_status = 'verified',
    consent_verified_at = coalesce(consent_verified_at, now())
WHERE consent_status = 'pending';
