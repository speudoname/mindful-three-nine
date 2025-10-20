import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUpload from "@/components/FileUpload";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [schedulingMode, setSchedulingMode] = useState("freeform");
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [sessions, setSessions] = useState<any[]>([{
    title: "",
    description: "",
    audioUrl: "",
    durationMinutes: 10,
    orderIndex: 0,
    unlockDay: 0,
    daypartWindow: "",
  }]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Load teacher profile
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (teacherError || !teacherData?.is_approved) {
        toast.error("You must be an approved teacher to create courses");
        navigate("/teacher");
        return;
      }

      setTeacher(teacherData);

      // Load categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = () => {
    setSessions([...sessions, {
      title: "",
      description: "",
      audioUrl: "",
      durationMinutes: 10,
      orderIndex: sessions.length,
      unlockDay: sessions.length,
      daypartWindow: "",
    }]);
  };

  const handleRemoveSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const handleSessionChange = (index: number, field: string, value: any) => {
    const newSessions = [...sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    setSessions(newSessions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || sessions.some(s => !s.title || !s.audioUrl)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      // Create course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .insert({
          teacher_id: teacher.id,
          title,
          description,
          intro_video_url: introVideoUrl || null,
          category_id: categoryId || null,
          scheduling_mode: schedulingMode,
          is_published: false,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create sessions
      const sessionsToInsert = sessions.map((session, index) => ({
        course_id: courseData.id,
        title: session.title,
        description: session.description || null,
        audio_url: session.audioUrl,
        duration_minutes: session.durationMinutes,
        order_index: index,
        unlock_day: schedulingMode === "linear" ? session.unlockDay : null,
        daypart_window: schedulingMode === "daypart" ? session.daypartWindow : null,
      }));

      const { error: sessionsError } = await supabase
        .from("course_sessions")
        .insert(sessionsToInsert);

      if (sessionsError) throw sessionsError;

      toast.success("Course created successfully!");
      navigate("/teacher");
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
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
      <div className="max-w-4xl mx-auto p-4 md:p-8">

        <Card>
          <CardHeader>
            <CardTitle>Create New Course</CardTitle>
            <CardDescription>
              Create a meditation course with multiple sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter course title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your course"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduling">Scheduling Mode</Label>
                  <Select value={schedulingMode} onValueChange={setSchedulingMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freeform">Freeform (All unlocked)</SelectItem>
                      <SelectItem value="linear">Linear (Daily unlock)</SelectItem>
                      <SelectItem value="daypart">Day-part windows</SelectItem>
                      <SelectItem value="challenge">Challenge mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Intro Video (Optional)</Label>
                  <FileUpload
                    bucket="intro-videos"
                    accept="video/*"
                    maxSize={100}
                    onUploadComplete={setIntroVideoUrl}
                    label="Upload Intro Video"
                  />
                  {introVideoUrl && (
                    <p className="text-sm text-muted-foreground mt-2">Video uploaded ✓</p>
                  )}
                </div>
              </div>

              {/* Sessions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">Course Sessions *</Label>
                  <Button type="button" onClick={handleAddSession} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Session
                  </Button>
                </div>

                {sessions.map((session, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Session {index + 1}</CardTitle>
                        {sessions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSession(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Session Title *</Label>
                        <Input
                          value={session.title}
                          onChange={(e) => handleSessionChange(index, "title", e.target.value)}
                          placeholder="Enter session title"
                          required
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={session.description}
                          onChange={(e) => handleSessionChange(index, "description", e.target.value)}
                          placeholder="Describe this session"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Audio File *</Label>
                        <FileUpload
                          bucket="course-audio"
                          accept="audio/*"
                          maxSize={50}
                          onUploadComplete={(url) => handleSessionChange(index, "audioUrl", url)}
                          label="Upload Audio"
                        />
                        {session.audioUrl && (
                          <p className="text-sm text-muted-foreground mt-2">Audio uploaded ✓</p>
                        )}
                      </div>

                      <div>
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={session.durationMinutes}
                          onChange={(e) => handleSessionChange(index, "durationMinutes", parseInt(e.target.value))}
                          min={1}
                        />
                      </div>

                      {schedulingMode === "linear" && (
                        <div>
                          <Label>Unlock Day</Label>
                          <Input
                            type="number"
                            value={session.unlockDay}
                            onChange={(e) => handleSessionChange(index, "unlockDay", parseInt(e.target.value))}
                            min={0}
                          />
                        </div>
                      )}

                      {schedulingMode === "daypart" && (
                        <div>
                          <Label>Day-part Window</Label>
                          <Select
                            value={session.daypartWindow}
                            onValueChange={(value) => handleSessionChange(index, "daypartWindow", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select window" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning</SelectItem>
                              <SelectItem value="afternoon">Afternoon</SelectItem>
                              <SelectItem value="evening">Evening</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/teacher")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
