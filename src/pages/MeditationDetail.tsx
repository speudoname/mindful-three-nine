import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePremiumContent } from "@/hooks/usePremiumContent";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/PremiumBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "@/components/AudioPlayer";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Coins, Lock } from "lucide-react";
import Navigation from "@/components/Navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MeditationDetail() {
  const { meditationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { purchased, purchasing, purchaseContent } = usePremiumContent('meditation', meditationId);
  const [loading, setLoading] = useState(true);
  const [meditation, setMeditation] = useState<any>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    loadMeditation();
  }, [meditationId]);

  useEffect(() => {
    // Update canPlay when meditation or purchased status changes
    if (meditation) {
      setCanPlay(meditation.token_cost === 0 || purchased);
    }
  }, [meditation, purchased]);

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

  const handleUnlock = async () => {
    const success = await purchaseContent(meditation.token_cost);
    if (success) {
      setShowPurchaseDialog(false);
      setCanPlay(true);
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
    <div className="min-h-screen bg-background">
      <Navigation showBack />
      <div className="max-w-4xl mx-auto p-4 md:p-8">
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
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <PremiumBadge tokenCost={meditation.token_cost} purchased={purchased} />
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

        {!canPlay ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Premium Content</h3>
                <p className="text-muted-foreground mb-4">
                  This meditation requires {meditation.token_cost} tokens to unlock
                </p>
              </div>
              <Button onClick={() => setShowPurchaseDialog(true)} disabled={purchasing}>
                <Coins className="mr-2 h-4 w-4" />
                Unlock for {meditation.token_cost} tokens
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AudioPlayer
            audioUrl={meditation.audio_url}
            title={meditation.title}
          />
        )}

        {/* Purchase Confirmation Dialog */}
        <AlertDialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Unlock Premium Meditation
              </AlertDialogTitle>
              <AlertDialogDescription>
                This meditation costs {meditation?.token_cost} tokens. Once purchased, you'll have lifetime access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnlock} disabled={purchasing}>
                {purchasing ? 'Processing...' : `Unlock for ${meditation?.token_cost} tokens`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
