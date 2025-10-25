-- Drop the insecure policy that allows anyone to create notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Notifications can only be created through the create_notification() function
-- which already has proper security checks and user preference validation
-- No direct INSERT policy needed - all inserts must go through the function