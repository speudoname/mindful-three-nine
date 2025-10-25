-- Phase 4: Guided Content System Database Schema

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  intro_video_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  scheduling_mode TEXT NOT NULL DEFAULT 'freeform' CHECK (scheduling_mode IN ('linear', 'daypart', 'freeform', 'challenge')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  token_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_sessions table (lessons/audio files)
CREATE TABLE IF NOT EXISTS public.course_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  unlock_day INTEGER,
  daypart_window TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create standalone_meditations table
CREATE TABLE IF NOT EXISTS public.standalone_meditations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  is_published BOOLEAN NOT NULL DEFAULT false,
  token_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_tags junction table
CREATE TABLE IF NOT EXISTS public.course_tags (
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);

-- Create meditation_tags junction table
CREATE TABLE IF NOT EXISTS public.meditation_tags (
  meditation_id UUID NOT NULL REFERENCES public.standalone_meditations(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (meditation_id, tag_id)
);

-- Create course_enrollments table
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create course_progress table
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_session_id UUID NOT NULL REFERENCES public.course_sessions(id) ON DELETE CASCADE,
  last_position_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_session_id)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standalone_meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Super admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for tags (public read, admin write)
CREATE POLICY "Anyone can view tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Super admins can manage tags" ON public.tags FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for teachers
CREATE POLICY "Anyone can view approved teachers" ON public.teachers FOR SELECT USING (is_approved = true);
CREATE POLICY "Super admins can view all teachers" ON public.teachers FOR SELECT USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can create teacher profile" ON public.teachers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers can update their own profile" ON public.teachers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage teachers" ON public.teachers FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Teachers can view their own courses" ON public.courses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.teachers WHERE id = courses.teacher_id AND user_id = auth.uid())
);
CREATE POLICY "Teachers can create courses" ON public.courses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teachers WHERE id = teacher_id AND user_id = auth.uid() AND is_approved = true)
);
CREATE POLICY "Teachers can update their own courses" ON public.courses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teachers WHERE id = courses.teacher_id AND user_id = auth.uid())
);
CREATE POLICY "Super admins can manage courses" ON public.courses FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for course_sessions
CREATE POLICY "Anyone can view sessions of published courses" ON public.course_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_sessions.course_id AND is_published = true)
);
CREATE POLICY "Teachers can view their course sessions" ON public.course_sessions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.teachers t ON c.teacher_id = t.id
    WHERE c.id = course_sessions.course_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Teachers can manage their course sessions" ON public.course_sessions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.teachers t ON c.teacher_id = t.id
    WHERE c.id = course_sessions.course_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Super admins can manage course sessions" ON public.course_sessions FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for standalone_meditations
CREATE POLICY "Anyone can view published meditations" ON public.standalone_meditations FOR SELECT USING (is_published = true);
CREATE POLICY "Teachers can view their meditations" ON public.standalone_meditations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.teachers WHERE id = standalone_meditations.teacher_id AND user_id = auth.uid())
);
CREATE POLICY "Teachers can create meditations" ON public.standalone_meditations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teachers WHERE id = teacher_id AND user_id = auth.uid() AND is_approved = true)
);
CREATE POLICY "Teachers can update their meditations" ON public.standalone_meditations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teachers WHERE id = standalone_meditations.teacher_id AND user_id = auth.uid())
);
CREATE POLICY "Super admins can manage meditations" ON public.standalone_meditations FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for course_tags
CREATE POLICY "Anyone can view course tags" ON public.course_tags FOR SELECT USING (true);
CREATE POLICY "Teachers can manage their course tags" ON public.course_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.teachers t ON c.teacher_id = t.id
    WHERE c.id = course_tags.course_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Super admins can manage course tags" ON public.course_tags FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for meditation_tags
CREATE POLICY "Anyone can view meditation tags" ON public.meditation_tags FOR SELECT USING (true);
CREATE POLICY "Teachers can manage their meditation tags" ON public.meditation_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.standalone_meditations m
    JOIN public.teachers t ON m.teacher_id = t.id
    WHERE m.id = meditation_tags.meditation_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Super admins can manage meditation tags" ON public.meditation_tags FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for course_enrollments
CREATE POLICY "Users can view their enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll in courses" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unenroll from courses" ON public.course_enrollments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage enrollments" ON public.course_enrollments FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for course_progress
CREATE POLICY "Users can view their progress" ON public.course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their progress" ON public.course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their progress" ON public.course_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage progress" ON public.course_progress FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_teachers_updated_at ON public.teachers;
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_standalone_meditations_updated_at ON public.standalone_meditations;
CREATE TRIGGER update_standalone_meditations_updated_at BEFORE UPDATE ON public.standalone_meditations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_progress_updated_at ON public.course_progress;
CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON public.course_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, description, icon)
SELECT 'Mindfulness', 'Present moment awareness and attention', '🧘'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Mindfulness');

INSERT INTO public.categories (name, description, icon)
SELECT 'Sleep', 'Relaxation and sleep preparation', '😴'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Sleep');

INSERT INTO public.categories (name, description, icon)
SELECT 'Stress Relief', 'Managing stress and anxiety', '🌊'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Stress Relief');

INSERT INTO public.categories (name, description, icon)
SELECT 'Focus', 'Concentration and productivity', '🎯'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Focus');

INSERT INTO public.categories (name, description, icon)
SELECT 'Healing', 'Emotional and physical healing', '💚'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Healing');

INSERT INTO public.categories (name, description, icon)
SELECT 'Gratitude', 'Cultivating appreciation and thankfulness', '🙏'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Gratitude');

-- Insert default tags
INSERT INTO public.tags (name) SELECT 'Beginner' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Beginner');
INSERT INTO public.tags (name) SELECT 'Intermediate' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Intermediate');
INSERT INTO public.tags (name) SELECT 'Advanced' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Advanced');
INSERT INTO public.tags (name) SELECT 'Morning' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Morning');
INSERT INTO public.tags (name) SELECT 'Evening' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Evening');
INSERT INTO public.tags (name) SELECT 'Quick' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Quick');
INSERT INTO public.tags (name) SELECT 'Deep Dive' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Deep Dive');
INSERT INTO public.tags (name) SELECT 'Guided' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Guided');
INSERT INTO public.tags (name) SELECT 'Silent' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Silent');
INSERT INTO public.tags (name) SELECT 'Music' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Music');