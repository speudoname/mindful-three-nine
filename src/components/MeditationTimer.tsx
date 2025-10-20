import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Play, Pause, RotateCcw, ChevronLeft } from "lucide-react";

interface MeditationTimerProps {
  onBack?: () => void;
}

const MeditationTimer = ({ onBack }: MeditationTimerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Timer state
  const [duration, setDuration] = useState(9);
  const [interval, setInterval] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(-1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);

  // Presets
  const durationPresets = [9, 18, 27];
  const intervalPresets = [3, 6, 9];

  // Start countdown
  const startCountdown = () => {
    setCountdown(9);
    setShowSettings(false);
  };

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => window.clearTimeout(timer);
    } else if (countdown === 0) {
      startMeditation();
    }
  }, [countdown]);

  // Start meditation session
  const startMeditation = async () => {
    setCountdown(-1);
    setTimeRemaining(duration * 60);
    setIsRunning(true);
    setIsPaused(false);

    // Create session in database
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .insert({
          user_id: user?.id,
          session_type: 'timer',
          duration_minutes: duration,
          interval_minutes: interval,
          status: 'started'
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to start session tracking",
        variant: "destructive"
      });
    }
  };

  // Complete session
  const handleComplete = async () => {
    setIsRunning(false);
    const minutesMeditated = duration;

    if (sessionId) {
      await supabase
        .from('meditation_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_minutes_meditated: minutesMeditated
        })
        .eq('id', sessionId);

      // Update streak and check for badges
      try {
        const today = new Date().toISOString().split('T')[0];
        await supabase.rpc('update_streak', {
          _user_id: user?.id,
          _activity_date: today,
          _streak_type: 'meditation'
        });
        await supabase.rpc('update_streak', {
          _user_id: user?.id,
          _activity_date: today,
          _streak_type: 'overall'
        });
        await supabase.rpc('check_and_award_badges', {
          _user_id: user?.id
        });
      } catch (error) {
        console.error('Error updating streak/badges:', error);
      }
    }

    toast({
      title: "Session Complete",
      description: `You meditated for ${minutesMeditated} minutes`,
    });

    setShowSettings(true);
    setSessionId(null);
  };

  // Timer tick effect
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      const timer = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);

      return () => window.clearInterval(timer);
    } else if (isRunning && timeRemaining === 0) {
      handleComplete();
    }
  }, [isRunning, isPaused, timeRemaining]);

  // Pause/Resume
  const togglePause = async () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      if (sessionId) {
        await supabase
          .from('meditation_sessions')
          .update({ status: 'resumed', resumed_at: new Date().toISOString() })
          .eq('id', sessionId);
      }
    } else {
      // Pause
      setIsPaused(true);
      if (sessionId) {
        await supabase
          .from('meditation_sessions')
          .update({ status: 'paused', paused_at: new Date().toISOString() })
          .eq('id', sessionId);
      }
    }
  };

  // Reset/Abandon
  const handleReset = async () => {
    if (isRunning && sessionId) {
      const minutesMeditated = Math.floor((duration * 60 - timeRemaining) / 60);
      await supabase
        .from('meditation_sessions')
        .update({
          status: 'abandoned',
          abandoned_at: new Date().toISOString(),
          total_minutes_meditated: minutesMeditated
        })
        .eq('id', sessionId);
    }

    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setCountdown(-1);
    setSessionId(null);
    setShowSettings(true);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = duration > 0 ? ((duration * 60 - timeRemaining) / (duration * 60)) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {showSettings && countdown === -1 && !isRunning && (
        <Card className="p-8 bg-card/50 backdrop-blur-sm space-y-6">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-4"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          <div className="text-center space-y-2 mb-6">
            <h2 className="text-3xl font-bold">Sacred Timer</h2>
            <p className="text-muted-foreground">Configure your meditation practice</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="duration" className="text-base mb-3 block">Duration (minutes)</Label>
              <div className="flex gap-2 mb-3">
                {durationPresets.map(preset => (
                  <Button
                    key={preset}
                    variant={duration === preset ? "default" : "outline"}
                    onClick={() => setDuration(preset)}
                    className="flex-1"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              <Input
                id="duration"
                type="number"
                min="1"
                max="120"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div>
              <Label htmlFor="interval" className="text-base mb-3 block">Interval Reminders (minutes)</Label>
              <div className="flex gap-2 mb-3">
                {intervalPresets.map(preset => (
                  <Button
                    key={preset}
                    variant={interval === preset ? "default" : "outline"}
                    onClick={() => setInterval(preset)}
                    className="flex-1"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              <Input
                id="interval"
                type="number"
                min="1"
                max="30"
                value={interval}
                onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          </div>

          <Button
            onClick={startCountdown}
            size="lg"
            className="w-full bg-gradient-sacred hover:shadow-glow"
          >
            Begin Practice
          </Button>
        </Card>
      )}

      {countdown > 0 && (
        <div className="text-center animate-scale-in">
          <div className="text-9xl font-bold text-primary animate-pulse">
            {countdown}
          </div>
          <p className="text-lg text-muted-foreground mt-4">Preparing your space...</p>
        </div>
      )}

      {isRunning && countdown === -1 && (
        <div className="space-y-8">
          {/* Circular Progress */}
          <div className="relative w-80 h-80 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="150"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="160"
                cy="160"
                r="150"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 150}`}
                strokeDashoffset={`${2 * Math.PI * 150 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{formatTime(timeRemaining)}</div>
                <div className="text-sm text-muted-foreground">
                  {isPaused ? 'Paused' : 'Remaining'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={togglePause}
              className="w-32"
            >
              {isPaused ? <Play className="mr-2 h-5 w-5" /> : <Pause className="mr-2 h-5 w-5" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="w-32"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationTimer;
