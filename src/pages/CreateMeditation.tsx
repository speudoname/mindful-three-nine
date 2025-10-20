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
import { Loader2, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function CreateMeditation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);

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
        toast.error("You must be an approved teacher to create meditations");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !audioUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("standalone_meditations")
        .insert({
          teacher_id: teacher.id,
          title,
          description,
          audio_url: audioUrl,
          duration_minutes: durationMinutes,
          category_id: categoryId || null,
          is_published: false,
        });

      if (error) throw error;

      toast.success("Meditation created successfully!");
      navigate("/teacher");
    } catch (error: any) {
      console.error("Error creating meditation:", error);
      toast.error("Failed to create meditation");
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

        <Card>
          <CardHeader>
            <CardTitle>Create Standalone Meditation</CardTitle>
            <CardDescription>
              Create a single meditation session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter meditation title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your meditation"
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
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                  min={1}
                />
              </div>

              <div>
                <Label>Audio File *</Label>
                <FileUpload
                  bucket="meditation-audio"
                  accept="audio/*"
                  maxSize={50}
                  onUploadComplete={setAudioUrl}
                  label="Upload Audio"
                />
                {audioUrl && (
                  <p className="text-sm text-muted-foreground mt-2">Audio uploaded ✓</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving || !audioUrl}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Meditation"
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
