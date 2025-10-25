/*
  # Performance Indexes and Optimizations

  1. Indexes
    - Add indexes on frequently queried columns
    - Add composite indexes for common query patterns
    - Optimize foreign key lookups

  2. Mobile Optimization
    - Indexes optimized for mobile queries
    - Fast user profile lookups
    - Efficient session retrieval
*/

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);

-- Meditation sessions indexes
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_meditation_id ON meditation_sessions(meditation_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_session_date ON meditation_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_date ON meditation_sessions(user_id, session_date DESC);

-- Meditations indexes
CREATE INDEX IF NOT EXISTS idx_meditations_teacher_id ON meditations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_meditations_category ON meditations(category);
CREATE INDEX IF NOT EXISTS idx_meditations_is_premium ON meditations(is_premium);
CREATE INDEX IF NOT EXISTS idx_meditations_difficulty ON meditations(difficulty_level);

-- Breathing sessions indexes
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_user_id ON breathing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_exercise_id ON breathing_sessions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_date ON breathing_sessions(session_date DESC);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_premium ON courses(is_premium);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Lessons indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_order ON lessons(course_id, order_index);

-- Course enrollments indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_course ON course_enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_completed ON course_enrollments(user_id, completed);

-- Lesson completions indexes
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_id ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id ON lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_lesson ON lesson_completions(user_id, lesson_id);

-- User goals indexes
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_completed ON user_goals(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_user_goals_dates ON user_goals(user_id, start_date, end_date);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_requirement ON achievements(requirement_type);

-- User achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(user_id, unlocked_at DESC);

-- Practice plans indexes
CREATE INDEX IF NOT EXISTS idx_practice_plans_user_id ON practice_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_plans_active ON practice_plans(user_id, is_active);

-- Token transactions indexes
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created ON token_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(user_id, transaction_type);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(user_id, type);

-- Notification preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON notification_preferences(user_id);