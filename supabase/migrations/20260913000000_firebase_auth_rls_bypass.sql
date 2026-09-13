-- Temporary RLS Bypass for Firebase Auth Migration
-- Since we are replacing Supabase Auth with Firebase Auth, auth.uid() will be null.
-- We must temporarily bypass RLS so the application continues to function until a permanent solution (Custom JWTs or Firestore migration) is chosen.

DROP POLICY IF EXISTS "students_insert" ON public.students;
DROP POLICY IF EXISTS "students_select" ON public.students;
DROP POLICY IF EXISTS "students_update" ON public.students;

CREATE POLICY "students_insert" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "students_select" ON public.students FOR SELECT USING (true);
CREATE POLICY "students_update" ON public.students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "assessments_insert" ON public.assessments;
DROP POLICY IF EXISTS "assessments_select" ON public.assessments;
DROP POLICY IF EXISTS "assessments_update" ON public.assessments;

CREATE POLICY "assessments_insert" ON public.assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "assessments_select" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "assessments_update" ON public.assessments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "reports_insert" ON public.reports;
DROP POLICY IF EXISTS "reports_select" ON public.reports;
DROP POLICY IF EXISTS "reports_update" ON public.reports;

CREATE POLICY "reports_insert" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "reports_select" ON public.reports FOR SELECT USING (true);
CREATE POLICY "reports_update" ON public.reports FOR UPDATE USING (true);
