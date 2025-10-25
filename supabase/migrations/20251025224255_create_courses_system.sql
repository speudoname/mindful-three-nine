/*
  # Courses and Lessons System

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `cover_image_url` (text)
      - `teacher_id` (uuid, references profiles)
      - `difficulty_level` (text)
      - `is_premium` (boolean, default false)
      - `token_cost` (integer, default 0)
      - `total_lessons` (integer, default 0)
      - `total_duration_minutes` (integer, default 0)
      - `enrollment_count` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `lessons`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `title` (text)
      - `description` (text)
      - `content` (text)
      - `video_url` (text)
      - `audio_url` (text)
      - `duration_minutes` (integer)
      - `order_index` (integer)
      - `is_preview` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `course_enrollments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `progress_percentage` (integer, default 0)
      - `last_accessed_lesson_id` (uuid, references lessons)
      - `completed` (boolean, default false)
      - `enrolled_at` (timestamptz)
      - `completed_at` (timestamptz)

    - `lesson_completions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `lesson_id` (uuid, references lessons)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - All authenticated users can view courses and lessons
    - Users can view their own enrollments
    - Teachers can manage their own courses
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_image_url text,
  teacher_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_premium boolean DEFAULT false,
  token_cost integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  total_duration_minutes integer DEFAULT 0,
  enrollment_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text,
  video_url text,
  audio_url text,
  duration_minutes integer DEFAULT 10,
  order_index integer NOT NULL,
  is_preview boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create course_enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage integer DEFAULT 0,
  last_accessed_lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  completed boolean DEFAULT false,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, course_id)
);

-- Create lesson_completions table
CREATE TABLE IF NOT EXISTS lesson_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can update their own courses"
  ON courses FOR UPDATE
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

CREATE POLICY "Teachers can delete their own courses"
  ON courses FOR DELETE
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for lessons
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage lessons for their courses"
  ON lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND (courses.teacher_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND (courses.teacher_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

-- RLS Policies for course_enrollments
CREATE POLICY "Users can view their own enrollments"
  ON course_enrollments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own enrollments"
  ON course_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own enrollments"
  ON course_enrollments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own enrollments"
  ON course_enrollments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for lesson_completions
CREATE POLICY "Users can view their own lesson completions"
  ON lesson_completions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own lesson completions"
  ON lesson_completions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own lesson completions"
  ON lesson_completions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Triggers for updated_at
DROP TRIGGER IF EXISTS on_course_updated ON courses;
CREATE TRIGGER on_course_updated
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_lesson_updated ON lessons;
CREATE TRIGGER on_lesson_updated
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();