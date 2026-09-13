-- Revert Temporary RLS Bypass
-- Restoring strict RLS policies relying on Supabase auth.uid()

DROP POLICY IF EXISTS "students_insert" ON public.students;
DROP POLICY IF EXISTS "students_select" ON public.students;
DROP POLICY IF EXISTS "students_update" ON public.students;

CREATE POLICY "students_insert" ON public.students FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "students_select" ON public.students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "students_update" ON public.students FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "assessments_insert" ON public.assessments;
DROP POLICY IF EXISTS "assessments_select" ON public.assessments;
DROP POLICY IF EXISTS "assessments_update" ON public.assessments;

CREATE POLICY "assessments_insert" ON public.assessments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "assessments_select" ON public.assessments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "assessments_update" ON public.assessments FOR UPDATE USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "reports_insert" ON public.reports;
DROP POLICY IF EXISTS "reports_select" ON public.reports;
DROP POLICY IF EXISTS "reports_update" ON public.reports;

CREATE POLICY "reports_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "reports_select" ON public.reports FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "reports_update" ON public.reports FOR UPDATE USING (auth.uid() = student_id);
