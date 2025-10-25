-- Create meditation sessions table
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'timer',
  duration_minutes INTEGER NOT NULL,
  interval_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'started',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  resumed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  total_minutes_meditated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sound library table
CREATE TABLE IF NOT EXISTS public.sound_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sound_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  theme_pack TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_library ENABLE ROW LEVEL SECURITY;

-- Meditation sessions policies
CREATE POLICY "Users can view their own sessions"
  ON public.meditation_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.meditation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.meditation_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Sound library policies (read-only for users)
CREATE POLICY "Anyone can view sounds"
  ON public.sound_library FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage sounds"
  ON public.sound_library FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Trigger for meditation_sessions updated_at
DROP TRIGGER IF EXISTS update_meditation_sessions_updated_at ON public.meditation_sessions;
CREATE TRIGGER update_meditation_sessions_updated_at
  BEFORE UPDATE ON public.meditation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sounds
INSERT INTO public.sound_library (name, sound_type, file_url, theme_pack) 
SELECT 'Soft Bell', 'start', 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', 'zen'
WHERE NOT EXISTS (SELECT 1 FROM public.sound_library WHERE name = 'Soft Bell');

INSERT INTO public.sound_library (name, sound_type, file_url, theme_pack)
SELECT 'Gentle Chime', 'interval', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 'zen'
WHERE NOT EXISTS (SELECT 1 FROM public.sound_library WHERE name = 'Gentle Chime');

INSERT INTO public.sound_library (name, sound_type, file_url, theme_pack)
SELECT 'Singing Bowl', 'end', 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3', 'zen'
WHERE NOT EXISTS (SELECT 1 FROM public.sound_library WHERE name = 'Singing Bowl');