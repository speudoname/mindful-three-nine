-- Phase 4: Guided Content System Database Schema

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
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
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  intro_video_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  scheduling_mode TEXT NOT NULL DEFAULT 'freeform' CHECK (scheduling_mode IN ('linear', 'daypart', 'freeform', 'challenge')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_sessions table (lessons/audio files)
CREATE TABLE public.course_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  unlock_day INTEGER, -- For linear mode
  daypart_window TEXT, -- For daypart mode: 'morning', 'afternoon', 'evening'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create standalone_meditations table
CREATE TABLE public.standalone_meditations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_tags junction table
CREATE TABLE public.course_tags (
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);

-- Create meditation_tags junction table
CREATE TABLE public.meditation_tags (
  meditation_id UUID NOT NULL REFERENCES public.standalone_meditations(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (meditation_id, tag_id)
);

-- Create course_enrollments table
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create course_progress table
CREATE TABLE public.course_progress (
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
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_standalone_meditations_updated_at BEFORE UPDATE ON public.standalone_meditations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON public.course_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for audio and video
INSERT INTO storage.buckets (id, name, public) VALUES ('course-audio', 'course-audio', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('intro-videos', 'intro-videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('meditation-audio', 'meditation-audio', true);

-- Storage policies for course-audio
CREATE POLICY "Anyone can view course audio" ON storage.objects FOR SELECT USING (bucket_id = 'course-audio');
CREATE POLICY "Teachers can upload course audio" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'course-audio' AND 
  EXISTS (SELECT 1 FROM public.teachers WHERE user_id = auth.uid() AND is_approved = true)
);
CREATE POLICY "Teachers can update their course audio" ON storage.objects FOR UPDATE USING (
  bucket_id = 'course-audio' AND 
  EXISTS (SELECT 1 FROM public.teachers WHERE user_id = auth.uid())
);
CREATE POLICY "Teachers can delete their course audio" ON storage.objects FOR DELETE USING (
  bucket_id = 'course-audio' AND 
  EXISTS (SELECT 1 FROM public.teachers WHERE user_id = auth.uid())
);

-- Storage policies for intro-videos
CREATE POLICY "Anyone can view intro videos" ON storage.objects FOR SELECT USING (bucket_id = 'intro-videos');
CREATE POLICY "Teachers can upload intro videos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'intro-videos' AND 
  EXISTS (SELECT 1 FROM public.teachers WHERE user_id = auth.uid() AND is_approved = true)
);
CREATE POLICY "Teachers can update their intro videos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'intro-videos' AND 
  EXISTS (SELECT 1 FROM public.teachers WHERE user_id = auth.uid())
);
CREATE POLICY "Teachers can delete their intro videos" ON storage.objects FOR DELETE USING (
  bucket_id = 'intro-videos' AND 
  EXISTS (SELECT 1 FROM public.teachers WHERE user_id = auth.uid())
);

-- Storage policies for meditation-audio
CREATE POLICY "Anyone can view meditation audio" ON storage.objects FOR SELECT USING (bucket_id = 'meditation-audio');
CREATE POLICY "Teachers can upload meditation audio" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'meditation-audio' AND 
  EXISTS (SELECT 1 FROM public.teachers WHERE user_id = auth.uid() AND is_approved = true)
);
CREATE POLICY "Teachers can update their meditation audio" ON storage.objects FOR UPDATE USING (
  bucket_id = 'meditation-audio' AND 
  EXISTS (SELECT 1 FROM public.teachers WHERE user_id = auth.uid())
);
CREATE POLICY "Teachers can delete their meditation audio" ON storage.objects FOR DELETE USING (
  bucket_id = 'meditation-audio' AND 
  EXISTS (SELECT 1 FROM public.teachers WHERE user_id = auth.uid())
);

-- Insert some default categories
INSERT INTO public.categories (name, description, icon) VALUES
  ('Mindfulness', 'Present moment awareness and attention', '🧘'),
  ('Sleep', 'Relaxation and sleep preparation', '😴'),
  ('Stress Relief', 'Managing stress and anxiety', '🌊'),
  ('Focus', 'Concentration and productivity', '🎯'),
  ('Healing', 'Emotional and physical healing', '💚'),
  ('Gratitude', 'Cultivating appreciation and thankfulness', '🙏');

-- Insert some default tags
INSERT INTO public.tags (name) VALUES
  ('Beginner'),
  ('Intermediate'),
  ('Advanced'),
  ('Morning'),
  ('Evening'),
  ('Quick'),
  ('Deep Dive'),
  ('Guided'),
  ('Silent'),
  ('Music');