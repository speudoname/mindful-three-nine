import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Bell } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function NotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    practice_reminders: true,
    course_reminders: true,
    achievement_alerts: true,
    system_notifications: true,
    quiet_hours_start: '',
    quiet_hours_end: '',
  });

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          practice_reminders: data.practice_reminders,
          course_reminders: data.course_reminders,
          achievement_alerts: data.achievement_alerts,
          system_notifications: data.system_notifications,
          quiet_hours_start: data.quiet_hours_start || '',
          quiet_hours_end: data.quiet_hours_end || '',
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user?.id,
          ...preferences,
          quiet_hours_start: preferences.quiet_hours_start || null,
          quiet_hours_end: preferences.quiet_hours_end || null,
        });

      if (error) throw error;
      toast.success("Notification preferences saved!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation showBack />
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your notification preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Choose which notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="practice_reminders">Practice Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about your daily practice goals
                </p>
              </div>
              <Switch
                id="practice_reminders"
                checked={preferences.practice_reminders}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, practice_reminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="course_reminders">Course Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about course schedules and new sessions
                </p>
              </div>
              <Switch
                id="course_reminders"
                checked={preferences.course_reminders}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, course_reminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="achievement_alerts">Achievement Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Celebrate your milestones and earned badges
                </p>
              </div>
              <Switch
                id="achievement_alerts"
                checked={preferences.achievement_alerts}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, achievement_alerts: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system_notifications">System Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Important updates and announcements
                </p>
              </div>
              <Switch
                id="system_notifications"
                checked={preferences.system_notifications}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, system_notifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
            <CardDescription>
              Set times when you don't want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet_start">Start Time</Label>
                <Input
                  id="quiet_start"
                  type="time"
                  value={preferences.quiet_hours_start}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      quiet_hours_start: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet_end">End Time</Label>
                <Input
                  id="quiet_end"
                  type="time"
                  value={preferences.quiet_hours_end}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      quiet_hours_end: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Leave empty to receive notifications at all times
            </p>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full mt-6">
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
