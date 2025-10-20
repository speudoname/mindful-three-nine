import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AudioPlayer from "@/components/AudioPlayer";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Play, CheckCircle, Lock } from "lucide-react";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);

  useEffect(() => {
    loadCourseData();
  }, [courseId, user]);

  const loadCourseData = async () => {
    try {
      // Load course details
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(`
          *,
          categories(name, icon),
          teachers(id, profiles(full_name))
        `)
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load course sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("course_sessions")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

      // Check enrollment
      const { data: enrollmentData } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", user?.id)
        .eq("course_id", courseId)
        .maybeSingle();

      setEnrollment(enrollmentData);

      // Load progress if enrolled
      if (enrollmentData) {
        const { data: progressData } = await supabase
          .from("course_progress")
          .select("*")
          .eq("user_id", user?.id)
          .in("course_session_id", sessionsData?.map(s => s.id) || []);

        setProgress(progressData || []);
      }
    } catch (error: any) {
      console.error("Error loading course:", error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .insert({
          user_id: user?.id,
          course_id: courseId,
        });

      if (error) throw error;

      toast.success("Enrolled in course!");
      loadCourseData();
    } catch (error: any) {
      console.error("Error enrolling:", error);
      toast.error("Failed to enroll in course");
    }
  };

  const handleSessionProgress = async (sessionId: string, seconds: number) => {
    try {
      const { error } = await supabase
        .from("course_progress")
        .upsert({
          user_id: user?.id,
          course_session_id: sessionId,
          last_position_seconds: seconds,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error updating progress:", error);
    }
  };

  const handleSessionComplete = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("course_progress")
        .upsert({
          user_id: user?.id,
          course_session_id: sessionId,
          completed_at: new Date().toISOString(),
          last_position_seconds: 0,
        });

      if (error) throw error;
      
      toast.success("Session completed!");
      loadCourseData();
      setCurrentSession(null);
    } catch (error: any) {
      console.error("Error completing session:", error);
    }
  };

  const getSessionProgress = (sessionId: string) => {
    return progress.find(p => p.course_session_id === sessionId);
  };

  const isSessionUnlocked = (session: any, index: number) => {
    if (!enrollment) return false;
    
    if (course.scheduling_mode === "linear") {
      // For linear mode, check unlock day
      const enrolledDays = Math.floor(
        (Date.now() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      return session.unlock_day ? enrolledDays >= session.unlock_day : true;
    }
    
    // For other modes, all sessions are unlocked
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Course not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/courses")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                <CardDescription className="text-base">
                  {course.description}
                </CardDescription>
              </div>
              {course.categories?.icon && (
                <span className="text-4xl ml-4">{course.categories.icon}</span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4">
              {course.categories && (
                <Badge variant="secondary">{course.categories.name}</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                By {course.teachers?.profiles?.full_name || "Unknown"}
              </span>
              <Badge variant="outline">{course.scheduling_mode}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!enrollment ? (
              <Button onClick={handleEnroll} className="w-full">
                Enroll in Course
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>

        {currentSession ? (
          <div className="space-y-4">
            <AudioPlayer
              audioUrl={currentSession.audio_url}
              title={currentSession.title}
              initialPosition={getSessionProgress(currentSession.id)?.last_position_seconds || 0}
              onProgress={(seconds) => handleSessionProgress(currentSession.id, seconds)}
              onComplete={() => handleSessionComplete(currentSession.id)}
            />
            <Button
              variant="outline"
              onClick={() => setCurrentSession(null)}
              className="w-full"
            >
              Back to Sessions
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="sessions">
            <TabsList>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-2 mt-4">
              {sessions.map((session, index) => {
                const sessionProgress = getSessionProgress(session.id);
                const isCompleted = !!sessionProgress?.completed_at;
                const isUnlocked = isSessionUnlocked(session, index);

                return (
                  <Card key={session.id} className={!isUnlocked ? "opacity-50" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {session.title}
                            {isCompleted && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {!isUnlocked && <Lock className="h-4 w-4" />}
                          </CardTitle>
                          {session.description && (
                            <CardDescription>{session.description}</CardDescription>
                          )}
                        </div>
                        <Badge variant="outline">{session.duration_minutes} min</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => setCurrentSession(session)}
                        disabled={!isUnlocked || !enrollment}
                        className="w-full"
                        variant={isCompleted ? "outline" : "default"}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {isCompleted ? "Play Again" : "Play Session"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="about" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>About This Course</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Course Details</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Sessions</h4>
                    <p className="text-sm text-muted-foreground">
                      {sessions.length} sessions • {sessions.reduce((acc, s) => acc + s.duration_minutes, 0)} minutes total
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Teacher</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.teachers?.profiles?.full_name || "Unknown"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
