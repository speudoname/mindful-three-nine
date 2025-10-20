import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Loader2, Flame, Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Progress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [practicePlan, setPracticePlan] = useState<any>(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    breathingSessions: 0,
    coursesCompleted: 0,
  });

  useEffect(() => {
    loadProgressData();
  }, [user]);

  const loadProgressData = async () => {
    try {
      // Load streaks
      const { data: streaksData } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user?.id);

      setStreaks(streaksData || []);

      // Load user badges with badge info
      const { data: userBadgesData } = await supabase
        .from("user_badges")
        .select(`
          *,
          badges(*)
        `)
        .eq("user_id", user?.id)
        .order("earned_at", { ascending: false });

      setBadges(userBadgesData || []);

      // Load goals
      const { data: goalsData } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setGoals(goalsData || []);

      // Load practice plan
      const { data: planData } = await supabase
        .from("practice_plans")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .maybeSingle();

      setPracticePlan(planData);

      // Calculate stats
      const { count: sessionsCount } = await supabase
        .from("meditation_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("status", "completed");

      const { data: minutesData } = await supabase
        .from("meditation_sessions")
        .select("total_minutes_meditated")
        .eq("user_id", user?.id)
        .eq("status", "completed");

      const totalMinutes = minutesData?.reduce((acc, session) => acc + (session.total_minutes_meditated || 0), 0) || 0;

      const { count: breathingCount } = await supabase
        .from("breathing_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      const { data: completedCoursesData } = await supabase
        .from("course_progress")
        .select("course_session_id")
        .eq("user_id", user?.id)
        .not("completed_at", "is", null);

      setStats({
        totalSessions: sessionsCount || 0,
        totalMinutes,
        breathingSessions: breathingCount || 0,
        coursesCompleted: completedCoursesData?.length || 0,
      });
    } catch (error: any) {
      console.error("Error loading progress:", error);
      toast.error("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const overallStreak = streaks.find(s => s.streak_type === "overall");
  const meditationStreak = streaks.find(s => s.streak_type === "meditation");

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
          <p className="text-muted-foreground">
            Track your journey and achievements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Streak</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-500" />
                {overallStreak?.current_streak || 0} days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Longest: {overallStreak?.longest_streak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Sessions</CardDescription>
              <CardTitle className="text-3xl">{stats.totalSessions}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Completed meditations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Time</CardDescription>
              <CardTitle className="text-3xl">{stats.totalMinutes}m</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {(stats.totalMinutes / 60).toFixed(1)} hours meditated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Badges Earned</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                {badges.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Keep going!
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="badges" className="space-y-4">
          <TabsList>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="badges">
            {badges.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Complete your first session to earn badges!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {badges.map((userBadge) => (
                  <Card key={userBadge.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span className="text-4xl">{userBadge.badges.icon}</span>
                        <Badge variant={
                          userBadge.badges.tier === "platinum" ? "default" :
                          userBadge.badges.tier === "gold" ? "secondary" :
                          "outline"
                        }>
                          {userBadge.badges.tier}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{userBadge.badges.name}</CardTitle>
                      <CardDescription>{userBadge.badges.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="streaks" className="space-y-4">
            {streaks.map((streak) => (
              <Card key={streak.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-xl capitalize">
                        {streak.streak_type} Streak
                      </CardTitle>
                    </div>
                    <Badge variant="outline">{streak.current_streak} days</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-semibold">{streak.current_streak} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Longest:</span>
                    <span className="font-semibold">{streak.longest_streak} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Grace used:</span>
                    <span>{streak.grace_used} day(s)</span>
                  </div>
                  {streak.last_activity_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last active:</span>
                      <span>{new Date(streak.last_activity_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            {goals.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Set goals to track your progress
                  </p>
                  <Button>Create Goal</Button>
                </CardContent>
              </Card>
            ) : (
              goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{goal.title}</CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {goal.goal_type}
                      </Badge>
                    </div>
                    {goal.description && (
                      <CardDescription>{goal.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-semibold">
                        {goal.current_value} / {goal.target_value}
                      </span>
                    </div>
                    <ProgressBar 
                      value={(goal.current_value / goal.target_value) * 100} 
                    />
                    {goal.deadline && (
                      <p className="text-xs text-muted-foreground">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
                <CardDescription>Your meditation journey by the numbers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Meditation Sessions</p>
                    <p className="text-3xl font-bold">{stats.totalSessions}</p>
                    <p className="text-xs text-muted-foreground">Completed sessions</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total Minutes</p>
                    <p className="text-3xl font-bold">{stats.totalMinutes}</p>
                    <p className="text-xs text-muted-foreground">
                      {(stats.totalMinutes / 60).toFixed(1)} hours
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Breathing Sessions</p>
                    <p className="text-3xl font-bold">{stats.breathingSessions}</p>
                    <p className="text-xs text-muted-foreground">Breathing exercises</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Course Progress</p>
                    <p className="text-3xl font-bold">{stats.coursesCompleted}</p>
                    <p className="text-xs text-muted-foreground">Sessions completed</p>
                  </div>
                </div>

                {practicePlan && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Practice Plan</p>
                    <div className="space-y-1 text-sm">
                      <p className="capitalize">Frequency: {practicePlan.frequency.replace('_', ' ')}</p>
                      {practicePlan.target_sessions_per_week && (
                        <p>Target: {practicePlan.target_sessions_per_week} sessions/week</p>
                      )}
                      {practicePlan.target_minutes_per_week && (
                        <p>Target: {practicePlan.target_minutes_per_week} minutes/week</p>
                      )}
                      <p>Grace days: {practicePlan.grace_days}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
