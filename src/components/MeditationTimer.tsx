import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Play, Pause, Square } from "lucide-react";

interface MeditationTimerProps {
  onBack: () => void;
}

const MeditationTimer = ({ onBack }: MeditationTimerProps) => {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // Presets based on 3/9 principle
  const durationPresets = [
    { value: 9, label: "9 min" },
    { value: 18, label: "18 min" },
    { value: 27, label: "27 min" },
    { value: 45, label: "45 min" }
  ];

  const intervalPresets = [
    { value: 3, label: "Every 3 min" },
    { value: 6, label: "Every 6 min" },
    { value: 9, label: "Every 9 min" },
    { value: 0, label: "No intervals" }
  ];

  // 9-second countdown before start
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Start the actual meditation
      setCountdown(null);
      setIsRunning(true);
      setTimeRemaining(totalTime);
    }
  }, [countdown, totalTime]);

  // Main meditation timer
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          
          // Check for interval bells
          if (selectedInterval && selectedInterval > 0) {
            const secondsElapsed = totalTime - newTime;
            const intervalSeconds = selectedInterval * 60;
            if (secondsElapsed > 0 && secondsElapsed % intervalSeconds === 0) {
              // TODO: Play interval sound
              console.log("Interval bell!");
            }
          }
          
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && isRunning) {
      // Meditation complete
      handleComplete();
    }
  }, [isRunning, isPaused, timeRemaining, selectedInterval, totalTime]);

  const startCountdown = () => {
    if (selectedDuration && selectedInterval !== null) {
      setTotalTime(selectedDuration * 60); // Convert to seconds
      setCountdown(9); // 9-second countdown
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    // Reset everything
    setIsRunning(false);
    setIsPaused(false);
    setCountdown(null);
    setTimeRemaining(0);
    setTotalTime(0);
  };

  const handleComplete = () => {
    // TODO: Track completion, update streaks
    console.log("Meditation complete!");
    handleStop();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Countdown view
  if (countdown !== null) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-12">
          <div className="text-9xl font-bold text-primary animate-glow mb-6">
            {countdown}
          </div>
          <p className="text-lg text-muted-foreground">Preparing your space...</p>
        </div>
      </div>
    );
  }

  // Active meditation view
  if (isRunning) {
    const progress = ((totalTime - timeRemaining) / totalTime) * 100;
    
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-12">
        {/* Main timer display */}
        <div className="relative">
          {/* Progress ring */}
          <svg className="w-64 h-64 mx-auto -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="4"
              opacity="0.3"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-bold text-foreground">
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={togglePause}
            className="w-20 h-20 rounded-full"
          >
            {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
          </Button>
          <Button
            size="lg"
            variant="destructive"
            onClick={handleStop}
            className="w-20 h-20 rounded-full"
          >
            <Square className="h-6 w-6" />
          </Button>
        </div>

        {isPaused && (
          <p className="text-sm text-muted-foreground animate-pulse">Paused</p>
        )}
      </div>
    );
  }

  // Setup view
  return (
    <Card className="w-full max-w-2xl mx-auto p-8 bg-card/50 backdrop-blur-sm border-primary/20">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Sacred Timer</h2>
          <p className="text-muted-foreground">Select your practice duration and interval reminders</p>
        </div>

        {/* Duration Selection */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-foreground">Practice Duration</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {durationPresets.map((preset) => (
              <Button
                key={preset.value}
                variant={selectedDuration === preset.value ? "default" : "outline"}
                onClick={() => setSelectedDuration(preset.value)}
                className={selectedDuration === preset.value ? "bg-gradient-sacred shadow-sacred" : ""}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Interval Selection */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-foreground">Interval Bells</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {intervalPresets.map((preset) => (
              <Button
                key={preset.value}
                variant={selectedInterval === preset.value ? "default" : "outline"}
                onClick={() => setSelectedInterval(preset.value)}
                className={selectedInterval === preset.value ? "bg-gradient-sacred shadow-sacred" : ""}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button
          size="lg"
          onClick={startCountdown}
          disabled={selectedDuration === null || selectedInterval === null}
          className="w-full bg-gradient-sacred hover:shadow-glow transition-all text-lg py-6"
        >
          Begin Practice
        </Button>
      </div>
    </Card>
  );
};

export default MeditationTimer;
