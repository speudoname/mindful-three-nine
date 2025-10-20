import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Upload } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [meditations, setMeditations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadTeacherData();
  }, [user, navigate]);

  const loadTeacherData = async () => {
    try {
      // Check if user is a teacher
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (teacherError) throw teacherError;

      if (!teacherData) {
        // Not a teacher yet
        setLoading(false);
        return;
      }

      setTeacher(teacherData);

      // Load courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*, categories(name)")
        .eq("teacher_id", teacherData.id)
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Load standalone meditations
      const { data: meditationsData, error: meditationsError } = await supabase
        .from("standalone_meditations")
        .select("*, categories(name)")
        .eq("teacher_id", teacherData.id)
        .order("created_at", { ascending: false });

      if (meditationsError) throw meditationsError;
      setMeditations(meditationsData || []);
    } catch (error: any) {
      console.error("Error loading teacher data:", error);
      toast.error("Failed to load teacher data");
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeTeacher = async () => {
    try {
      const { error } = await supabase.from("teachers").insert({
        user_id: user?.id,
      });

      if (error) throw error;

      toast.success("Teacher application submitted! Awaiting approval.");
      loadTeacherData();
    } catch (error: any) {
      console.error("Error becoming teacher:", error);
      toast.error("Failed to submit teacher application");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Become a Teacher</CardTitle>
            <CardDescription>
              Share your meditation expertise with our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Apply to become a teacher and start creating meditation courses and
              standalone meditations. Your application will be reviewed by our team.
            </p>
            <Button onClick={handleBecomeTeacher} className="w-full">
              Apply to Become a Teacher
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teacher.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Application Pending</CardTitle>
            <CardDescription>
              Your teacher application is under review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Thank you for applying! Our team is reviewing your application.
              You'll be notified once you're approved to start creating content.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your courses and meditation content
          </p>
        </div>

        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="meditations">Standalone Meditations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Courses</h2>
              <Button onClick={() => navigate("/teacher/create-course")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </div>

            {courses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    You haven't created any courses yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {course.is_published ? "Published" : "Draft"}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from("courses")
                                .update({ is_published: !course.is_published })
                                .eq("id", course.id);
                              
                              if (error) throw error;
                              toast.success(course.is_published ? "Course unpublished" : "Course published!");
                              loadTeacherData();
                            } catch (error: any) {
                              console.error("Error updating course:", error);
                              toast.error("Failed to update course");
                            }
                          }}
                        >
                          {course.is_published ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="meditations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Standalone Meditations</h2>
              <Button onClick={() => navigate("/teacher/create-meditation")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Meditation
              </Button>
            </div>

            {meditations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    You haven't created any standalone meditations yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meditations.map((meditation) => (
                  <Card key={meditation.id}>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{meditation.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {meditation.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {meditation.duration_minutes} min • {meditation.is_published ? "Published" : "Draft"}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from("standalone_meditations")
                                .update({ is_published: !meditation.is_published })
                                .eq("id", meditation.id);
                              
                              if (error) throw error;
                              toast.success(meditation.is_published ? "Meditation unpublished" : "Meditation published!");
                              loadTeacherData();
                            } catch (error: any) {
                              console.error("Error updating meditation:", error);
                              toast.error("Failed to update meditation");
                            }
                          }}
                        >
                          {meditation.is_published ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View your content performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Analytics features coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
