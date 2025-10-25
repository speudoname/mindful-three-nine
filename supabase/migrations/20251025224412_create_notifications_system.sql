/*
  # Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `message` (text)
      - `type` (text) - 'achievement', 'reminder', 'course', 'system'
      - `action_url` (text)
      - `is_read` (boolean, default false)
      - `created_at` (timestamptz)

    - `notification_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles, unique)
      - `email_notifications` (boolean, default true)
      - `push_notifications` (boolean, default true)
      - `daily_reminder` (boolean, default true)
      - `reminder_time` (time, default '09:00')
      - `achievement_notifications` (boolean, default true)
      - `course_updates` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text NOT NULL CHECK (type IN ('achievement', 'reminder', 'course', 'system', 'streak', 'goal')),
  action_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  daily_reminder boolean DEFAULT true,
  reminder_time time DEFAULT '09:00:00',
  achievement_notifications boolean DEFAULT true,
  course_updates boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own preferences"
  ON notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON notification_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to create default notification preferences
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences on user creation
DROP TRIGGER IF EXISTS on_user_created_notification_prefs ON profiles;
CREATE TRIGGER on_user_created_notification_prefs
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_preferences();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_notification_preferences_updated ON notification_preferences;
CREATE TRIGGER on_notification_preferences_updated
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();