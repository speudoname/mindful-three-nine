import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BreathingPreset {
  id: string;
  name: string;
  description: string;
  purpose: string;
  inhale_seconds: number;
  hold_seconds: number;
  exhale_seconds: number;
  recommended_rounds: number;
}

type BreathingPhase = "inhale" | "hold" | "exhale" | "idle";

export default function BreathingExercise() {
  const { user } = useAuth();
  const [presets, setPresets] = useState<BreathingPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<BreathingPreset | null>(null);
  const [customInhale, setCustomInhale] = useState(4);
  const [customHold, setCustomHold] = useState(4);
  const [customExhale, setCustomExhale] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("idle");
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    const { data, error } = await supabase
      .from("breathing_presets")
      .select("*")
      .order("name");
    
    if (error) {
      toast.error("Failed to load breathing presets");
      return;
    }
    
    setPresets(data || []);
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
      setPhaseTimer((prev) => {
        if (prev <= 1) {
          moveToNextPhase();
          return getPhaseLength();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentPhase]);

  const getPhaseLength = () => {
    const inhale = selectedPreset?.inhale_seconds || customInhale;
    const hold = selectedPreset?.hold_seconds || customHold;
    const exhale = selectedPreset?.exhale_seconds || customExhale;

    switch (currentPhase) {
      case "inhale":
        return inhale;
      case "hold":
        return hold;
      case "exhale":
        return exhale;
      default:
        return 0;
    }
  };

  const moveToNextPhase = () => {
    if (currentPhase === "inhale") {
      setCurrentPhase("hold");
    } else if (currentPhase === "hold") {
      setCurrentPhase("exhale");
    } else if (currentPhase === "exhale") {
      setCurrentRound((prev) => prev + 1);
      setCurrentPhase("inhale");
    }
  };

  const startBreathing = async () => {
    if (!user) {
      toast.error("Please sign in to track your practice");
      return;
    }

    const inhale = selectedPreset?.inhale_seconds || customInhale;
    const hold = selectedPreset?.hold_seconds || customHold;
    const exhale = selectedPreset?.exhale_seconds || customExhale;
    const patternName = selectedPreset?.name || `Custom (${inhale}-${hold}-${exhale})`;

    const { data, error } = await supabase
      .from("breathing_sessions")
      .insert({
        user_id: user.id,
        pattern_name: patternName,
        inhale_seconds: inhale,
        hold_seconds: hold,
        exhale_seconds: exhale,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to start breathing session");
      return;
    }

    setSessionId(data.id);
    setIsActive(true);
    setCurrentPhase("inhale");
    setPhaseTimer(inhale);
    setCurrentRound(1);
    setTotalSeconds(0);
  };

  const stopBreathing = async () => {
    if (sessionId) {
      await supabase
        .from("breathing_sessions")
        .update({
          rounds_completed: currentRound,
          total_duration_seconds: totalSeconds,
          completed_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
    }

    setIsActive(false);
    setCurrentPhase("idle");
    setPhaseTimer(0);
    setCurrentRound(0);
    setTotalSeconds(0);
    setSessionId(null);
    toast.success(`Session complete! ${currentRound} rounds in ${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`);
  };

  const getCircleScale = () => {
    if (currentPhase === "inhale") return 1;
    if (currentPhase === "exhale") return 0.5;
    return 0.75;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2 text-center">Breathing Exercises</h1>
      <p className="text-muted-foreground text-center mb-8">
        Guided breathing patterns for relaxation, focus, and energy
      </p>

      {!isActive ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Preset Patterns</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {presets.map((preset) => (
                <Card
                  key={preset.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedPreset?.id === preset.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedPreset(preset)}
                >
                  <h3 className="font-semibold text-lg mb-2">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {preset.description}
                  </p>
                  <p className="text-sm font-medium text-primary mb-2">
                    Purpose: {preset.purpose}
                  </p>
                  <p className="text-sm">
                    Pattern: {preset.inhale_seconds}s inhale → {preset.hold_seconds}s hold → {preset.exhale_seconds}s exhale
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: {preset.recommended_rounds} rounds
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Custom Pattern</h2>
            <Card className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="inhale">Inhale (seconds)</Label>
                  <Input
                    id="inhale"
                    type="number"
                    min="1"
                    max="15"
                    value={customInhale}
                    onChange={(e) => setCustomInhale(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="hold">Hold (seconds)</Label>
                  <Input
                    id="hold"
                    type="number"
                    min="0"
                    max="15"
                    value={customHold}
                    onChange={(e) => setCustomHold(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="exhale">Exhale (seconds)</Label>
                  <Input
                    id="exhale"
                    type="number"
                    min="1"
                    max="15"
                    value={customExhale}
                    onChange={(e) => setCustomExhale(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={() => setSelectedPreset(null)}
                variant="outline"
                className="mt-4 w-full"
              >
                Use Custom Pattern
              </Button>
            </Card>
          </div>

          <Button onClick={startBreathing} size="lg" className="w-full">
            Start Breathing Exercise
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <div
              className="absolute w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/50 transition-all duration-[3000ms] ease-in-out"
              style={{
                transform: `scale(${getCircleScale()})`,
                opacity: 0.8,
              }}
            />
            <div className="z-10 text-center">
              <p className="text-6xl font-bold">{phaseTimer}</p>
              <p className="text-xl mt-2 capitalize">{currentPhase}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold">Round {currentRound}</p>
            <p className="text-muted-foreground mt-2">
              Total Time: {formatTime(totalSeconds)}
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>{selectedPreset?.name || "Custom Pattern"}</p>
            <p>
              {selectedPreset?.inhale_seconds || customInhale}s →{" "}
              {selectedPreset?.hold_seconds || customHold}s →{" "}
              {selectedPreset?.exhale_seconds || customExhale}s
            </p>
          </div>

          <Button onClick={stopBreathing} variant="destructive" size="lg">
            Stop & Complete
          </Button>
        </div>
      )}
    </div>
  );
}
