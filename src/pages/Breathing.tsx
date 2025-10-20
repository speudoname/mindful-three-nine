import Navigation from "@/components/Navigation";
import BreathingExercise from "@/components/BreathingExercise";

export default function Breathing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <BreathingExercise />
      </main>
    </div>
  );
}
