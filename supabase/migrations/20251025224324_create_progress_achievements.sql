/*
  # Progress Tracking and Achievements

  1. New Tables
    - `user_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `goal_type` (text) - 'daily_meditation', 'weekly_sessions', 'streak'
      - `target_value` (integer)
      - `current_value` (integer, default 0)
      - `completed` (boolean, default false)
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `achievements`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `badge_icon` (text)
      - `category` (text)
      - `requirement_type` (text)
      - `requirement_value` (integer)
      - `token_reward` (integer, default 0)
      - `created_at` (timestamptz)

    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `achievement_id` (uuid, references achievements)
      - `unlocked_at` (timestamptz)
      - `UNIQUE(user_id, achievement_id)`

    - `practice_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `days_of_week` (jsonb) - array of days
      - `time_of_day` (time)
      - `duration_minutes` (integer)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Achievements are viewable by all
*/

-- Create user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('daily_meditation', 'weekly_sessions', 'streak', 'total_minutes', 'course_completion')),
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  completed boolean DEFAULT false,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  badge_icon text,
  category text,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  token_reward integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create practice_plans table
CREATE TABLE IF NOT EXISTS practice_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  days_of_week jsonb DEFAULT '[]'::jsonb,
  time_of_day time,
  duration_minutes integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_goals
CREATE POLICY "Users can view their own goals"
  ON user_goals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own goals"
  ON user_goals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals"
  ON user_goals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals"
  ON user_goals FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage achievements"
  ON achievements FOR ALL
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

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can unlock achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for practice_plans
CREATE POLICY "Users can view their own practice plans"
  ON practice_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own practice plans"
  ON practice_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own practice plans"
  ON practice_plans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own practice plans"
  ON practice_plans FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Triggers for updated_at
DROP TRIGGER IF EXISTS on_user_goal_updated ON user_goals;
CREATE TRIGGER on_user_goal_updated
  BEFORE UPDATE ON user_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_practice_plan_updated ON practice_plans;
CREATE TRIGGER on_practice_plan_updated
  BEFORE UPDATE ON practice_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();