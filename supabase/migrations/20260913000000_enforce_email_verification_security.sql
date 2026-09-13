-- Migration: 20260913000000_enforce_email_verification_security.sql
-- Enforce that authenticated student accounts must have a verified email before acquiring 'verified' consent status.

-- 1. Function to synchronize email confirmation state into public.students
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- When user's email becomes confirmed, promote their student record consent if guardian details exist
  IF new.email_confirmed_at IS NOT NULL AND (old.email_confirmed_at IS NULL OR old.email_confirmed_at IS DISTINCT FROM new.email_confirmed_at) THEN
    UPDATE public.students
    SET 
      consent_status = CASE 
        WHEN parent_name IS NOT NULL AND length(trim(parent_name)) > 0 THEN 'verified'
        ELSE consent_status
      END,
      consent_verified_at = CASE 
        WHEN parent_name IS NOT NULL AND length(trim(parent_name)) > 0 THEN coalesce(consent_verified_at, now())
        ELSE consent_verified_at
      END
    WHERE id = new.id;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();

-- 2. Guard handle_new_user so unconfirmed signups do not immediately gain 'verified' status unless email is confirmed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_parent_name text;
  v_consent text;
  v_verified_at timestamptz;
BEGIN
  v_parent_name := new.raw_user_meta_data->>'parent_name';
  -- Require BOTH parent_name AND confirmed email to grant verified consent status
  IF v_parent_name IS NOT NULL AND length(trim(v_parent_name)) > 0 AND new.email_confirmed_at IS NOT NULL THEN
    v_consent := 'verified';
    v_verified_at := now();
  ELSE
    v_consent := 'pending';
    v_verified_at := null;
  END IF;

  INSERT INTO public.students (
    id,
    full_name,
    parent_name,
    parent_phone,
    school_name,
    current_class,
    consent_status,
    consent_verified_at
  ) VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New Student'),
    v_parent_name,
    new.raw_user_meta_data->>'whatsapp_number',
    new.raw_user_meta_data->>'school_name',
    coalesce((new.raw_user_meta_data->>'current_class')::smallint, 8),
    v_consent,
    v_verified_at
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    parent_name = coalesce(EXCLUDED.parent_name, students.parent_name),
    parent_phone = coalesce(EXCLUDED.parent_phone, students.parent_phone),
    school_name = coalesce(EXCLUDED.school_name, students.school_name),
    current_class = coalesce(EXCLUDED.current_class, students.current_class),
    consent_status = CASE 
      WHEN EXCLUDED.consent_status = 'verified' THEN 'verified' 
      ELSE students.consent_status 
    END,
    consent_verified_at = CASE 
      WHEN EXCLUDED.consent_status = 'verified' THEN coalesce(students.consent_verified_at, now()) 
      ELSE students.consent_verified_at 
    END;

  RETURN new;
END;
$$;
