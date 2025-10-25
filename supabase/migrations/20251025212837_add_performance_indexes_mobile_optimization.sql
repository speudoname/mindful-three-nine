/*
  # Performance Indexes and Mobile Optimization

  ## Overview
  Adds database indexes for frequently queried fields to optimize mobile app performance
  and creates mobile-specific database functions for efficient data fetching.

  ## Changes
  1. Indexes
    - Add indexes on foreign keys and frequently queried columns
    - Add composite indexes for common query patterns
    - Optimize for mobile data sync and pagination

  2. Mobile-Optimized Functions
    - Function to get user dashboard summary
    - Function to get paginated course list
    - Function to get user progress statistics
    - Function to sync offline changes
*/

-- Performance Indexes

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Meditation sessions indexes
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON public.meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_status ON public.meditation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_started_at ON public.meditation_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_status ON public.meditation_sessions(user_id, status);

-- Breathing sessions indexes
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_user_id ON public.breathing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_started_at ON public.breathing_sessions(started_at DESC);

-- Teachers indexes
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_is_approved ON public.teachers(is_approved);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON public.courses(created_at DESC);

-- Course sessions indexes
CREATE INDEX IF NOT EXISTS idx_course_sessions_course_id ON public.course_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sessions_order_index ON public.course_sessions(course_id, order_index);

-- Standalone meditations indexes
CREATE INDEX IF NOT EXISTS idx_standalone_meditations_teacher_id ON public.standalone_meditations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_standalone_meditations_is_published ON public.standalone_meditations(is_published);
CREATE INDEX IF NOT EXISTS idx_standalone_meditations_category_id ON public.standalone_meditations(category_id);

-- Course enrollments indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments(course_id);

-- Course progress indexes
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON public.course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_session_id ON public.course_progress(course_session_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_completed ON public.course_progress(user_id, completed_at);

-- Streaks indexes
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_type ON public.streaks(user_id, streak_type);

-- Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON public.goals(user_id, is_active);

-- User badges indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON public.user_badges(user_id, earned_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(user_id, created_at DESC);

-- User tokens indexes
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON public.user_tokens(user_id);

-- User purchases indexes
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_entity ON public.user_purchases(entity_type, entity_id);

-- Mobile-Optimized Functions

-- Function to get user dashboard summary (single query for mobile home screen)
CREATE OR REPLACE FUNCTION public.get_user_dashboard_summary(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_total_sessions INTEGER;
  v_total_minutes INTEGER;
  v_current_streak INTEGER;
  v_token_balance INTEGER;
  v_active_goals INTEGER;
  v_unread_notifications INTEGER;
  v_enrolled_courses INTEGER;
BEGIN
  -- Get meditation stats
  SELECT COUNT(*), COALESCE(SUM(total_minutes_meditated), 0)
  INTO v_total_sessions, v_total_minutes
  FROM meditation_sessions
  WHERE user_id = _user_id AND status = 'completed';

  -- Get current streak
  SELECT COALESCE(MAX(current_streak), 0)
  INTO v_current_streak
  FROM streaks
  WHERE user_id = _user_id;

  -- Get token balance
  SELECT COALESCE(balance, 0)
  INTO v_token_balance
  FROM user_tokens
  WHERE user_id = _user_id;

  -- Get active goals
  SELECT COUNT(*)
  INTO v_active_goals
  FROM goals
  WHERE user_id = _user_id AND is_active = true AND completed_at IS NULL;

  -- Get unread notifications
  SELECT COUNT(*)
  INTO v_unread_notifications
  FROM notifications
  WHERE user_id = _user_id AND is_read = false;

  -- Get enrolled courses
  SELECT COUNT(*)
  INTO v_enrolled_courses
  FROM course_enrollments
  WHERE user_id = _user_id;

  v_result := jsonb_build_object(
    'total_sessions', v_total_sessions,
    'total_minutes', v_total_minutes,
    'current_streak', v_current_streak,
    'token_balance', v_token_balance,
    'active_goals', v_active_goals,
    'unread_notifications', v_unread_notifications,
    'enrolled_courses', v_enrolled_courses
  );

  RETURN v_result;
END;
$$;

-- Function to get paginated courses with filters (for mobile browsing)
CREATE OR REPLACE FUNCTION public.get_courses_paginated(
  _category_id UUID DEFAULT NULL,
  _page_size INTEGER DEFAULT 20,
  _offset_value INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  teacher_name TEXT,
  category_name TEXT,
  token_cost INTEGER,
  session_count BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    p.full_name as teacher_name,
    cat.name as category_name,
    c.token_cost,
    COUNT(cs.id) as session_count,
    c.created_at
  FROM courses c
  JOIN teachers t ON c.teacher_id = t.id
  JOIN profiles p ON t.user_id = p.id
  LEFT JOIN categories cat ON c.category_id = cat.id
  LEFT JOIN course_sessions cs ON c.id = cs.course_id
  WHERE c.is_published = true
    AND (_category_id IS NULL OR c.category_id = _category_id)
  GROUP BY c.id, c.title, c.description, p.full_name, cat.name, c.token_cost, c.created_at
  ORDER BY c.created_at DESC
  LIMIT _page_size
  OFFSET _offset_value;
END;
$$;

-- Function to get user progress statistics (for progress screen)
CREATE OR REPLACE FUNCTION public.get_user_progress_stats(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_weekly_sessions INTEGER;
  v_weekly_minutes INTEGER;
  v_monthly_sessions INTEGER;
  v_monthly_minutes INTEGER;
  v_total_breathing_sessions INTEGER;
  v_courses_completed INTEGER;
  v_badges_earned INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Weekly stats
  SELECT COUNT(*), COALESCE(SUM(total_minutes_meditated), 0)
  INTO v_weekly_sessions, v_weekly_minutes
  FROM meditation_sessions
  WHERE user_id = _user_id 
    AND status = 'completed'
    AND started_at >= CURRENT_DATE - INTERVAL '7 days';

  -- Monthly stats
  SELECT COUNT(*), COALESCE(SUM(total_minutes_meditated), 0)
  INTO v_monthly_sessions, v_monthly_minutes
  FROM meditation_sessions
  WHERE user_id = _user_id 
    AND status = 'completed'
    AND started_at >= CURRENT_DATE - INTERVAL '30 days';

  -- Breathing sessions
  SELECT COUNT(*)
  INTO v_total_breathing_sessions
  FROM breathing_sessions
  WHERE user_id = _user_id;

  -- Courses completed
  SELECT COUNT(DISTINCT cs.course_id)
  INTO v_courses_completed
  FROM course_progress cp
  JOIN course_sessions cs ON cp.course_session_id = cs.id
  WHERE cp.user_id = _user_id AND cp.completed_at IS NOT NULL;

  -- Badges earned
  SELECT COUNT(*)
  INTO v_badges_earned
  FROM user_badges
  WHERE user_id = _user_id;

  -- Longest streak
  SELECT COALESCE(MAX(longest_streak), 0)
  INTO v_longest_streak
  FROM streaks
  WHERE user_id = _user_id;

  v_result := jsonb_build_object(
    'weekly', jsonb_build_object(
      'sessions', v_weekly_sessions,
      'minutes', v_weekly_minutes
    ),
    'monthly', jsonb_build_object(
      'sessions', v_monthly_sessions,
      'minutes', v_monthly_minutes
    ),
    'breathing_sessions', v_total_breathing_sessions,
    'courses_completed', v_courses_completed,
    'badges_earned', v_badges_earned,
    'longest_streak', v_longest_streak
  );

  RETURN v_result;
END;
$$;

-- Function to sync meditation session (for offline support)
CREATE OR REPLACE FUNCTION public.sync_meditation_session(
  _user_id UUID,
  _session_type TEXT,
  _duration_minutes INTEGER,
  _status TEXT,
  _started_at TIMESTAMPTZ,
  _completed_at TIMESTAMPTZ DEFAULT NULL,
  _total_minutes INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO meditation_sessions (
    user_id,
    session_type,
    duration_minutes,
    status,
    started_at,
    completed_at,
    total_minutes_meditated
  )
  VALUES (
    _user_id,
    _session_type,
    _duration_minutes,
    _status,
    _started_at,
    _completed_at,
    _total_minutes
  )
  RETURNING id INTO v_session_id;

  -- Update streak if completed
  IF _status = 'completed' THEN
    PERFORM update_streak(_user_id, DATE(_started_at), 'meditation');
    PERFORM check_and_award_badges(_user_id);
  END IF;

  RETURN v_session_id;
END;
$$;

-- Function to get user's enrolled courses with progress
CREATE OR REPLACE FUNCTION public.get_user_courses_with_progress(_user_id UUID)
RETURNS TABLE (
  course_id UUID,
  course_title TEXT,
  course_description TEXT,
  teacher_name TEXT,
  total_sessions BIGINT,
  completed_sessions BIGINT,
  progress_percentage INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as course_id,
    c.title as course_title,
    c.description as course_description,
    p.full_name as teacher_name,
    COUNT(DISTINCT cs.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN cp.completed_at IS NOT NULL THEN cs.id END) as completed_sessions,
    CASE 
      WHEN COUNT(DISTINCT cs.id) = 0 THEN 0
      ELSE (COUNT(DISTINCT CASE WHEN cp.completed_at IS NOT NULL THEN cs.id END) * 100 / COUNT(DISTINCT cs.id))::INTEGER
    END as progress_percentage
  FROM course_enrollments ce
  JOIN courses c ON ce.course_id = c.id
  JOIN teachers t ON c.teacher_id = t.id
  JOIN profiles p ON t.user_id = p.id
  LEFT JOIN course_sessions cs ON c.id = cs.course_id
  LEFT JOIN course_progress cp ON cs.id = cp.course_session_id AND cp.user_id = _user_id
  WHERE ce.user_id = _user_id
  GROUP BY c.id, c.title, c.description, p.full_name
  ORDER BY ce.enrolled_at DESC;
END;
$$;