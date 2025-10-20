import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "@/components/AudioPlayer";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function MeditationDetail() {
  const { meditationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meditation, setMeditation] = useState<any>(null);

  useEffect(() => {
    loadMeditation();
  }, [meditationId]);

  const loadMeditation = async () => {
    try {
      const { data, error } = await supabase
        .from("standalone_meditations")
        .select(`
          *,
          categories(name, icon),
          teachers(id, profiles(full_name))
        `)
        .eq("id", meditationId)
        .single();

      if (error) throw error;
      setMeditation(data);
    } catch (error: any) {
      console.error("Error loading meditation:", error);
      toast.error("Failed to load meditation");
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

  if (!meditation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Meditation not found</p>
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
          Back to Meditations
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{meditation.title}</CardTitle>
                <CardDescription className="text-base">
                  {meditation.description}
                </CardDescription>
              </div>
              {meditation.categories?.icon && (
                <span className="text-4xl ml-4">{meditation.categories.icon}</span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4">
              {meditation.categories && (
                <Badge variant="secondary">{meditation.categories.name}</Badge>
              )}
              <Badge variant="outline">{meditation.duration_minutes} minutes</Badge>
              <span className="text-sm text-muted-foreground">
                By {meditation.teachers?.profiles?.full_name || "Unknown"}
              </span>
            </div>
          </CardHeader>
        </Card>

        <AudioPlayer
          audioUrl={meditation.audio_url}
          title={meditation.title}
        />
      </div>
    </div>
  );
}
