/*
  # Meditation Sessions Table

  1. New Tables
    - `meditation_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `meditation_id` (uuid, nullable, references meditations)
      - `duration_minutes` (integer)
      - `completed` (boolean, default false)
      - `notes` (text)
      - `session_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `meditations`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `audio_url` (text)
      - `duration_minutes` (integer)
      - `difficulty_level` (text) - 'beginner', 'intermediate', 'advanced'
      - `category` (text)
      - `is_premium` (boolean, default false)
      - `teacher_id` (uuid, references profiles)
      - `play_count` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only see their own meditation sessions
    - All authenticated users can view meditations
    - Teachers and admins can create/edit meditations
*/

-- Create meditations table
CREATE TABLE IF NOT EXISTS meditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  audio_url text,
  duration_minutes integer NOT NULL DEFAULT 10,
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category text,
  is_premium boolean DEFAULT false,
  teacher_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  play_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meditation_sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meditation_id uuid REFERENCES meditations(id) ON DELETE SET NULL,
  duration_minutes integer NOT NULL,
  completed boolean DEFAULT false,
  notes text,
  session_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meditations
CREATE POLICY "Anyone can view meditations"
  ON meditations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can create meditations"
  ON meditations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can update their own meditations"
  ON meditations FOR UPDATE
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Teachers can delete their own meditations"
  ON meditations FOR DELETE
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for meditation_sessions
CREATE POLICY "Users can view their own sessions"
  ON meditation_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own sessions"
  ON meditation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
  ON meditation_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions"
  ON meditation_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Triggers for updated_at
DROP TRIGGER IF EXISTS on_meditation_updated ON meditations;
CREATE TRIGGER on_meditation_updated
  BEFORE UPDATE ON meditations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_meditation_session_updated ON meditation_sessions;
CREATE TRIGGER on_meditation_session_updated
  BEFORE UPDATE ON meditation_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();