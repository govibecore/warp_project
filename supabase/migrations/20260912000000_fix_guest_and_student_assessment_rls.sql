-- Fix RLS, constraints, and triggers for guest trial mode and authenticated student assessments

-- 1. Update students consent_status check constraint to include 'guest_provisional'
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_consent_status_check;
ALTER TABLE public.students ADD CONSTRAINT students_consent_status_check 
  CHECK (consent_status IN ('pending', 'verified', 'withdrawn', 'guest_provisional'));

-- 2. Drop the foreign key from students.id to auth.users.id so guest student records can exist
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_id_fkey;

-- 3. Trigger to maintain cascade delete from auth.users -> public.students
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.students WHERE id = old.id;
  RETURN old;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_user();

-- 4. Update handle_new_user to properly populate parent consent and student info on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_parent_name text;
  v_consent text;
  v_verified_at timestamptz;
BEGIN
  v_parent_name := new.raw_user_meta_data->>'parent_name';
  IF v_parent_name IS NOT NULL AND length(trim(v_parent_name)) > 0 THEN
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

-- 5. Backfill existing registered students from their auth.users metadata
UPDATE public.students s
SET 
  parent_name = coalesce(s.parent_name, u.raw_user_meta_data->>'parent_name'),
  parent_phone = coalesce(s.parent_phone, u.raw_user_meta_data->>'whatsapp_number'),
  school_name = coalesce(s.school_name, u.raw_user_meta_data->>'school_name'),
  current_class = coalesce(s.current_class, (u.raw_user_meta_data->>'current_class')::smallint, 8),
  consent_status = CASE 
    WHEN u.raw_user_meta_data->>'parent_name' IS NOT NULL AND length(trim(u.raw_user_meta_data->>'parent_name')) > 0 THEN 'verified'
    ELSE s.consent_status
  END,
  consent_verified_at = CASE 
    WHEN u.raw_user_meta_data->>'parent_name' IS NOT NULL AND length(trim(u.raw_user_meta_data->>'parent_name')) > 0 THEN coalesce(s.consent_verified_at, now())
    ELSE s.consent_verified_at
  END
FROM auth.users u
WHERE s.id = u.id;

-- Also insert student rows for any existing auth.users that don't have a row in students yet
INSERT INTO public.students (id, full_name, parent_name, parent_phone, school_name, current_class, consent_status, consent_verified_at)
SELECT 
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'parent_name',
  u.raw_user_meta_data->>'whatsapp_number',
  u.raw_user_meta_data->>'school_name',
  coalesce((u.raw_user_meta_data->>'current_class')::smallint, 8),
  CASE WHEN u.raw_user_meta_data->>'parent_name' IS NOT NULL AND length(trim(u.raw_user_meta_data->>'parent_name')) > 0 THEN 'verified' ELSE 'pending' END,
  CASE WHEN u.raw_user_meta_data->>'parent_name' IS NOT NULL AND length(trim(u.raw_user_meta_data->>'parent_name')) > 0 THEN now() ELSE null END
FROM auth.users u
LEFT JOIN public.students s ON u.id = s.id
WHERE s.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 6. Ensure students RLS policies permit self and guest provisional
DROP POLICY IF EXISTS "students_insert" ON public.students;
DROP POLICY IF EXISTS "self insert" ON public.students;
CREATE POLICY "students_insert" ON public.students
  FOR INSERT WITH CHECK (
    (id = (SELECT auth.uid()))
    OR (consent_status = ANY (ARRAY['guest_provisional'::text, 'verified'::text]))
  );

DROP POLICY IF EXISTS "students_select" ON public.students;
DROP POLICY IF EXISTS "self select" ON public.students;
CREATE POLICY "students_select" ON public.students
  FOR SELECT USING (
    (id = (SELECT auth.uid()))
    OR (consent_status = 'guest_provisional'::text)
  );

DROP POLICY IF EXISTS "students_update" ON public.students;
DROP POLICY IF EXISTS "self update" ON public.students;
CREATE POLICY "students_update" ON public.students
  FOR UPDATE USING (
    (id = (SELECT auth.uid()))
    OR (consent_status = 'guest_provisional'::text)
  )
  WITH CHECK (
    (id = (SELECT auth.uid()))
    OR (consent_status = 'guest_provisional'::text)
  );

-- 7. Ensure assessments RLS policies permit self (authenticated) and guest provisional
DROP POLICY IF EXISTS "assessments_insert" ON public.assessments;
DROP POLICY IF EXISTS "own assessments insert" ON public.assessments;
CREATE POLICY "assessments_insert" ON public.assessments
  FOR INSERT WITH CHECK (
    (student_id = (SELECT auth.uid()))
    OR (EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = assessments.student_id 
        AND s.consent_status IN ('guest_provisional', 'verified')
    ))
  );

DROP POLICY IF EXISTS "assessments_select" ON public.assessments;
DROP POLICY IF EXISTS "own assessments select" ON public.assessments;
CREATE POLICY "assessments_select" ON public.assessments
  FOR SELECT USING (
    (student_id = (SELECT auth.uid()))
    OR (EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = assessments.student_id 
        AND s.consent_status IN ('guest_provisional', 'verified')
    ))
    OR (EXISTS (
      SELECT 1 FROM public.reports r
      WHERE r.assessment_id = assessments.id
        AND r.share_token IS NOT NULL
        AND (r.share_expires_at IS NULL OR r.share_expires_at > now())
    ))
  );

DROP POLICY IF EXISTS "assessments_update" ON public.assessments;
DROP POLICY IF EXISTS "own assessments update" ON public.assessments;
CREATE POLICY "assessments_update" ON public.assessments
  FOR UPDATE USING (
    (student_id = (SELECT auth.uid()))
    OR (EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = assessments.student_id 
        AND s.consent_status IN ('guest_provisional', 'verified')
    ))
  )
  WITH CHECK (
    (student_id = (SELECT auth.uid()))
    OR (EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = assessments.student_id 
        AND s.consent_status IN ('guest_provisional', 'verified')
    ))
  );
