-- Phase 5: Tracking & Gamification Database Schema

-- Create practice_plans table
CREATE TABLE IF NOT EXISTS public.practice_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'twice_daily', 'custom')),
  target_sessions_per_week INTEGER,
  target_minutes_per_week INTEGER,
  grace_days INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('sessions', 'minutes', 'streak', 'courses', 'custom')),
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  grace_used INTEGER NOT NULL DEFAULT 0,
  streak_type TEXT NOT NULL DEFAULT 'meditation' CHECK (streak_type IN ('meditation', 'breathing', 'courses', 'overall')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('streak', 'time', 'sessions', 'courses', 'special')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.practice_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practice_plans
CREATE POLICY "Users can view their own practice plan" ON public.practice_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own practice plan" ON public.practice_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own practice plan" ON public.practice_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage practice plans" ON public.practice_plans FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for goals
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage goals" ON public.goals FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for streaks
CREATE POLICY "Users can view their own streaks" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own streaks" ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" ON public.streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage streaks" ON public.streaks FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Super admins can manage badges" ON public.badges FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage user badges" ON public.user_badges FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_practice_plans_updated_at ON public.practice_plans;
CREATE TRIGGER update_practice_plans_updated_at BEFORE UPDATE ON public.practice_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_streaks_updated_at ON public.streaks;
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON public.streaks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, tier)
SELECT 'First Session', 'Complete your first meditation session', '🌱', 'sessions', 'total_sessions', 1, 'bronze'
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'First Session');

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, tier)
SELECT 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 'current_streak', 7, 'bronze'
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Week Warrior');

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, tier)
SELECT 'Meditation Master', 'Complete 100 meditation sessions', '🧘', 'sessions', 'total_sessions', 100, 'silver'
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Meditation Master');

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, tier)
SELECT 'Time Traveler', 'Meditate for 1000 total minutes', '⏰', 'time', 'total_minutes', 1000, 'silver'
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Time Traveler');

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, tier)
SELECT 'Streak Champion', 'Maintain a 30-day streak', '⚡', 'streak', 'current_streak', 30, 'gold'
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Streak Champion');

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, tier)
SELECT 'Zenith', 'Complete 500 meditation sessions', '✨', 'sessions', 'total_sessions', 500, 'platinum'
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Zenith');

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, tier)
SELECT 'Eternal Flame', 'Maintain a 100-day streak', '🌟', 'streak', 'current_streak', 100, 'platinum'
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Eternal Flame');

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, tier)
SELECT 'Breathing Expert', 'Complete 50 breathing exercises', '💨', 'sessions', 'breathing_sessions', 50, 'silver'
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Breathing Expert');

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, tier)
SELECT 'Course Completer', 'Complete your first course', '📚', 'courses', 'courses_completed', 1, 'bronze'
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Course Completer');

INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, tier)
SELECT 'Sacred Nine', 'Complete 9 sessions in one day', '9️⃣', 'special', 'sessions_in_day', 9, 'gold'
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Sacred Nine');

-- Create function to update streaks
CREATE OR REPLACE FUNCTION public.update_streak(
  _user_id UUID,
  _activity_date DATE,
  _streak_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak RECORD;
  v_grace_days INTEGER;
  v_day_diff INTEGER;
BEGIN
  SELECT grace_days INTO v_grace_days
  FROM practice_plans
  WHERE user_id = _user_id AND is_active = true;
  
  IF v_grace_days IS NULL THEN
    v_grace_days := 1;
  END IF;

  SELECT * INTO v_streak
  FROM streaks
  WHERE user_id = _user_id AND streak_type = _streak_type;

  IF v_streak IS NULL THEN
    INSERT INTO streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date, grace_used)
    VALUES (_user_id, _streak_type, 1, 1, _activity_date, 0);
  ELSE
    v_day_diff := _activity_date - v_streak.last_activity_date;
    
    IF v_day_diff = 0 THEN
      RETURN;
    ELSIF v_day_diff = 1 THEN
      UPDATE streaks
      SET current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_activity_date = _activity_date,
          grace_used = 0,
          updated_at = NOW()
      WHERE user_id = _user_id AND streak_type = _streak_type;
    ELSIF v_day_diff <= (v_grace_days + 1) AND v_streak.grace_used < v_grace_days THEN
      UPDATE streaks
      SET grace_used = grace_used + (v_day_diff - 1),
          last_activity_date = _activity_date,
          updated_at = NOW()
      WHERE user_id = _user_id AND streak_type = _streak_type;
    ELSE
      UPDATE streaks
      SET current_streak = 1,
          last_activity_date = _activity_date,
          grace_used = 0,
          updated_at = NOW()
      WHERE user_id = _user_id AND streak_type = _streak_type;
    END IF;
  END IF;
END;
$$;

-- Create function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
  v_total_sessions INTEGER;
  v_total_minutes INTEGER;
  v_breathing_sessions INTEGER;
  v_courses_completed INTEGER;
  v_current_streak INTEGER;
  v_sessions_today INTEGER;
  v_already_has_badge BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO v_total_sessions
  FROM meditation_sessions
  WHERE user_id = _user_id AND status = 'completed';

  SELECT COALESCE(SUM(total_minutes_meditated), 0) INTO v_total_minutes
  FROM meditation_sessions
  WHERE user_id = _user_id AND status = 'completed';

  SELECT COUNT(*) INTO v_breathing_sessions
  FROM breathing_sessions
  WHERE user_id = _user_id;

  SELECT COUNT(DISTINCT course_id) INTO v_courses_completed
  FROM course_progress cp
  JOIN course_sessions cs ON cp.course_session_id = cs.id
  WHERE cp.user_id = _user_id AND cp.completed_at IS NOT NULL
  GROUP BY cs.course_id
  HAVING COUNT(*) = (SELECT COUNT(*) FROM course_sessions WHERE course_id = cs.course_id);

  SELECT COALESCE(MAX(current_streak), 0) INTO v_current_streak
  FROM streaks
  WHERE user_id = _user_id;

  SELECT COUNT(*) INTO v_sessions_today
  FROM meditation_sessions
  WHERE user_id = _user_id 
    AND DATE(started_at) = CURRENT_DATE 
    AND status = 'completed';

  FOR v_badge IN SELECT * FROM badges LOOP
    SELECT EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_id = _user_id AND badge_id = v_badge.id
    ) INTO v_already_has_badge;

    IF NOT v_already_has_badge THEN
      IF (v_badge.requirement_type = 'total_sessions' AND v_total_sessions >= v_badge.requirement_value) OR
         (v_badge.requirement_type = 'total_minutes' AND v_total_minutes >= v_badge.requirement_value) OR
         (v_badge.requirement_type = 'breathing_sessions' AND v_breathing_sessions >= v_badge.requirement_value) OR
         (v_badge.requirement_type = 'courses_completed' AND v_courses_completed >= v_badge.requirement_value) OR
         (v_badge.requirement_type = 'current_streak' AND v_current_streak >= v_badge.requirement_value) OR
         (v_badge.requirement_type = 'sessions_in_day' AND v_sessions_today >= v_badge.requirement_value) THEN
        
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (_user_id, v_badge.id);
      END IF;
    END IF;
  END LOOP;
END;
$$;