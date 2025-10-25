-- Create breathing_exercises table for tracking user sessions
CREATE TABLE IF NOT EXISTS public.breathing_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pattern_name TEXT NOT NULL,
  inhale_seconds INTEGER NOT NULL,
  hold_seconds INTEGER NOT NULL,
  exhale_seconds INTEGER NOT NULL,
  rounds_completed INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.breathing_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for breathing_sessions
CREATE POLICY "Users can view their own breathing sessions" 
ON public.breathing_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own breathing sessions" 
ON public.breathing_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own breathing sessions" 
ON public.breathing_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create breathing_presets table for predefined patterns
CREATE TABLE IF NOT EXISTS public.breathing_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  purpose TEXT NOT NULL,
  inhale_seconds INTEGER NOT NULL,
  hold_seconds INTEGER NOT NULL,
  exhale_seconds INTEGER NOT NULL,
  recommended_rounds INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for presets (public read)
ALTER TABLE public.breathing_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view breathing presets" 
ON public.breathing_presets 
FOR SELECT 
USING (true);

CREATE POLICY "Super admins can manage breathing presets" 
ON public.breathing_presets 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'));

-- Insert default breathing patterns
INSERT INTO public.breathing_presets (name, description, purpose, inhale_seconds, hold_seconds, exhale_seconds, recommended_rounds)
SELECT 'Calm (3-4-3)', 'Gentle calming breath', 'Relaxation and stress relief', 3, 4, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM public.breathing_presets WHERE name = 'Calm (3-4-3)');

INSERT INTO public.breathing_presets (name, description, purpose, inhale_seconds, hold_seconds, exhale_seconds, recommended_rounds)
SELECT 'Balance (4-4-2)', 'Balanced breathing for focus', 'Mental clarity and focus', 4, 4, 2, 5
WHERE NOT EXISTS (SELECT 1 FROM public.breathing_presets WHERE name = 'Balance (4-4-2)');

INSERT INTO public.breathing_presets (name, description, purpose, inhale_seconds, hold_seconds, exhale_seconds, recommended_rounds)
SELECT 'Sleep (4-7-8)', 'Dr. Weil''s relaxing breath', 'Deep relaxation and sleep preparation', 4, 7, 8, 4
WHERE NOT EXISTS (SELECT 1 FROM public.breathing_presets WHERE name = 'Sleep (4-7-8)');

INSERT INTO public.breathing_presets (name, description, purpose, inhale_seconds, hold_seconds, exhale_seconds, recommended_rounds)
SELECT 'Energy (7-7-8)', 'Extended breath for energy', 'Boost energy and alertness', 7, 7, 8, 3
WHERE NOT EXISTS (SELECT 1 FROM public.breathing_presets WHERE name = 'Energy (7-7-8)');

INSERT INTO public.breathing_presets (name, description, purpose, inhale_seconds, hold_seconds, exhale_seconds, recommended_rounds)
SELECT 'Box Breathing (4-4-4-4)', 'Navy SEAL breathing technique', 'Stress management and mental resilience', 4, 4, 4, 5
WHERE NOT EXISTS (SELECT 1 FROM public.breathing_presets WHERE name = 'Box Breathing (4-4-4-4)');