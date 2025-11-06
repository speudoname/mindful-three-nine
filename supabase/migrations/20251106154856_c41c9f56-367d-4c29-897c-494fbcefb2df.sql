-- Create function to get user dashboard summary
CREATE OR REPLACE FUNCTION public.get_user_dashboard_summary(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_total_sessions INTEGER;
  v_total_minutes INTEGER;
  v_current_streak INTEGER;
  v_token_balance INTEGER;
  v_active_goals INTEGER;
  v_unread_notifications INTEGER;
  v_enrolled_courses INTEGER;
BEGIN
  -- Get total completed sessions
  SELECT COUNT(*) INTO v_total_sessions
  FROM meditation_sessions
  WHERE user_id = _user_id AND status = 'completed';

  -- Get total minutes
  SELECT COALESCE(SUM(total_minutes_meditated), 0) INTO v_total_minutes
  FROM meditation_sessions
  WHERE user_id = _user_id AND status = 'completed';

  -- Get current streak
  SELECT COALESCE(MAX(current_streak), 0) INTO v_current_streak
  FROM streaks
  WHERE user_id = _user_id;

  -- Get token balance
  SELECT COALESCE(balance, 0) INTO v_token_balance
  FROM user_tokens
  WHERE user_id = _user_id;

  -- Get active goals count
  SELECT COUNT(*) INTO v_active_goals
  FROM goals
  WHERE user_id = _user_id AND is_active = true;

  -- Get unread notifications
  SELECT COUNT(*) INTO v_unread_notifications
  FROM notifications
  WHERE user_id = _user_id AND is_read = false;

  -- Get enrolled courses
  SELECT COUNT(*) INTO v_enrolled_courses
  FROM course_enrollments
  WHERE user_id = _user_id;

  RETURN jsonb_build_object(
    'total_sessions', v_total_sessions,
    'total_minutes', v_total_minutes,
    'current_streak', v_current_streak,
    'token_balance', v_token_balance,
    'active_goals', v_active_goals,
    'unread_notifications', v_unread_notifications,
    'enrolled_courses', v_enrolled_courses
  );
END;
$function$;

-- Create function to get user progress stats
CREATE OR REPLACE FUNCTION public.get_user_progress_stats(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_weekly_sessions INTEGER;
  v_weekly_minutes INTEGER;
  v_monthly_sessions INTEGER;
  v_monthly_minutes INTEGER;
  v_breathing_sessions INTEGER;
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
    AND started_at >= NOW() - INTERVAL '7 days';

  -- Monthly stats
  SELECT COUNT(*), COALESCE(SUM(total_minutes_meditated), 0)
  INTO v_monthly_sessions, v_monthly_minutes
  FROM meditation_sessions
  WHERE user_id = _user_id 
    AND status = 'completed'
    AND started_at >= NOW() - INTERVAL '30 days';

  -- Breathing sessions
  SELECT COUNT(*) INTO v_breathing_sessions
  FROM breathing_sessions
  WHERE user_id = _user_id;

  -- Completed courses
  SELECT COUNT(DISTINCT course_id) INTO v_courses_completed
  FROM course_progress
  WHERE user_id = _user_id AND completed_at IS NOT NULL;

  -- Badges earned
  SELECT COUNT(*) INTO v_badges_earned
  FROM user_badges
  WHERE user_id = _user_id;

  -- Longest streak
  SELECT COALESCE(MAX(longest_streak), 0) INTO v_longest_streak
  FROM streaks
  WHERE user_id = _user_id;

  RETURN jsonb_build_object(
    'weekly', jsonb_build_object(
      'sessions', v_weekly_sessions,
      'minutes', v_weekly_minutes
    ),
    'monthly', jsonb_build_object(
      'sessions', v_monthly_sessions,
      'minutes', v_monthly_minutes
    ),
    'breathing_sessions', v_breathing_sessions,
    'courses_completed', v_courses_completed,
    'badges_earned', v_badges_earned,
    'longest_streak', v_longest_streak
  );
END;
$function$;

-- Create function to get user courses with progress
CREATE OR REPLACE FUNCTION public.get_user_courses_with_progress(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT jsonb_agg(course_data)
    FROM (
      SELECT 
        c.id as course_id,
        c.title as course_title,
        c.description as course_description,
        p.full_name as teacher_name,
        COUNT(cs.id) as total_sessions,
        COUNT(cp.id) FILTER (WHERE cp.completed_at IS NOT NULL) as completed_sessions,
        CASE 
          WHEN COUNT(cs.id) > 0 THEN 
            ROUND((COUNT(cp.id) FILTER (WHERE cp.completed_at IS NOT NULL)::NUMERIC / COUNT(cs.id)) * 100)
          ELSE 0 
        END as progress_percentage
      FROM courses c
      JOIN teachers t ON c.teacher_id = t.id
      JOIN profiles p ON t.user_id = p.id
      JOIN course_enrollments ce ON c.id = ce.course_id
      LEFT JOIN course_sessions cs ON c.id = cs.course_id
      LEFT JOIN course_progress cp ON cs.id = cp.course_session_id AND cp.user_id = _user_id
      WHERE ce.user_id = _user_id
      GROUP BY c.id, c.title, c.description, p.full_name
    ) course_data
  );
END;
$function$;

-- Create function to get paginated courses
CREATE OR REPLACE FUNCTION public.get_courses_paginated(
  _category_id uuid DEFAULT NULL,
  _page_size integer DEFAULT 20,
  _offset_value integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT jsonb_agg(course_data)
    FROM (
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
      OFFSET _offset_value
    ) course_data
  );
END;
$function$;

-- Create function to sync meditation session
CREATE OR REPLACE FUNCTION public.sync_meditation_session(
  _user_id uuid,
  _session_type text,
  _duration_minutes integer,
  _status text,
  _started_at timestamp with time zone,
  _completed_at timestamp with time zone DEFAULT NULL,
  _total_minutes integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_session_id uuid;
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
    PERFORM update_streak(_user_id, _started_at::date, 'meditation');
    PERFORM check_and_award_badges(_user_id);
  END IF;

  RETURN v_session_id;
END;
$function$;