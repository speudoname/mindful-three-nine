/*
  # Breathing Exercises Table

  1. New Tables
    - `breathing_exercises`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `inhale_duration` (integer, seconds)
      - `hold_duration` (integer, seconds)
      - `exhale_duration` (integer, seconds)
      - `pause_duration` (integer, seconds)
      - `cycles` (integer)
      - `difficulty_level` (text)
      - `is_premium` (boolean, default false)
      - `created_at` (timestamptz)

    - `breathing_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `exercise_id` (uuid, references breathing_exercises)
      - `duration_minutes` (integer)
      - `cycles_completed` (integer)
      - `session_date` (date)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - All authenticated users can view exercises
    - Users can only see their own breathing sessions
*/

-- Create breathing_exercises table
CREATE TABLE IF NOT EXISTS breathing_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  inhale_duration integer DEFAULT 4,
  hold_duration integer DEFAULT 4,
  exhale_duration integer DEFAULT 4,
  pause_duration integer DEFAULT 0,
  cycles integer DEFAULT 10,
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create breathing_sessions table
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES breathing_exercises(id) ON DELETE SET NULL,
  duration_minutes integer NOT NULL,
  cycles_completed integer DEFAULT 0,
  session_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE breathing_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for breathing_exercises
CREATE POLICY "Anyone can view breathing exercises"
  ON breathing_exercises FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage breathing exercises"
  ON breathing_exercises FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for breathing_sessions
CREATE POLICY "Users can view their own breathing sessions"
  ON breathing_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own breathing sessions"
  ON breathing_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own breathing sessions"
  ON breathing_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own breathing sessions"
  ON breathing_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());