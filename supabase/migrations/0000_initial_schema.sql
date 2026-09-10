-- Enable uuid-ossp for uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  current_class INTEGER,
  difficulty_preference TEXT CHECK (difficulty_preference IN ('standard', 'advanced', 'olympiad')),
  role TEXT CHECK (role IN ('student', 'admin')) DEFAULT 'student',
  quota_date DATE,
  ai_reports_used_today INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  class_level INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Standard', 'Advanced', 'Olympiad')) NOT NULL,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned', 'timed_out')) NOT NULL,
  responses JSONB DEFAULT '[]'::JSONB,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  total_time_ms INTEGER,
  result JSONB,
  report_id UUID, -- References reports(id), added later or checked at app level
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  ai_insights JSONB NOT NULL,
  action_plan JSONB NOT NULL,
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  share_token TEXT,
  share_expires_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ NOT NULL,
  ai_model_used TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add report_id foreign key constraint to assessments
ALTER TABLE public.assessments
ADD CONSTRAINT fk_assessments_report
FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE SET NULL;

-- SCENARIOS TABLE
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id TEXT NOT NULL,
  type TEXT NOT NULL,
  class_level INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  question TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NORMS TABLE
CREATE TABLE IF NOT EXISTS public.norms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_level INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  mean REAL NOT NULL,
  std_dev REAL NOT NULL,
  competency_thresholds JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.norms ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can delete their own profile" ON public.users FOR DELETE USING (auth.uid() = auth_id);

-- Assessments policies
CREATE POLICY "Users can view assessments" ON public.assessments FOR SELECT USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR status = 'completed'
);
CREATE POLICY "Users can insert their own assessments" ON public.assessments FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can update their own assessments" ON public.assessments FOR UPDATE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can delete their own assessments" ON public.assessments FOR DELETE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- Reports policies
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can insert their own reports" ON public.reports FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- Scenarios policies (read only for everyone)
CREATE POLICY "Scenarios are viewable by everyone" ON public.scenarios FOR SELECT USING (true);

-- Norms policies (read only for everyone)
CREATE POLICY "Norms are viewable by everyone" ON public.norms FOR SELECT USING (true);

