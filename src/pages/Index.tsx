import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MeditationTimer from "@/components/MeditationTimer";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, signOut } = useAuth();
  const [showTimer, setShowTimer] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-card/30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-sacred flex items-center justify-center shadow-glow">
              <span className="text-xl font-bold">9</span>
            </div>
            <h1 className="text-xl font-semibold">Sacred Practice</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </header>

      {!showTimer ? (
        // Landing View
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            {/* Hero */}
            <div className="space-y-6 animate-breathe">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-sacred shadow-glow animate-glow mb-6">
                <span className="text-5xl font-bold">9</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Cultivate Your{" "}
                <span className="bg-gradient-sacred bg-clip-text text-transparent">
                  Inner Stillness
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A meditation practice built on sacred timing, personal mastery, and the rhythmic balance of 3 and 9.
              </p>
            </div>

            {/* Sacred Numbers Explanation */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { number: "3", title: "Balance", desc: "The foundation of harmony and rhythm" },
                { number: "9", title: "Completion", desc: "The sacred cycle of transformation" },
                { number: "27", title: "Mastery", desc: "Deep practice, profound stillness" }
              ].map((item, i) => (
                <Card key={i} className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-sacred">
                  <div className="text-4xl font-bold text-primary mb-3">{item.number}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="bg-gradient-sacred hover:shadow-glow transition-all text-lg px-8 py-6 h-auto"
                onClick={() => setShowTimer(true)}
              >
                Begin Your Practice
              </Button>
              <p className="text-sm text-muted-foreground">No distractions. Just you and stillness.</p>
            </div>
          </div>
        </main>
      ) : (
        // Timer View
        <main className="flex-1 flex items-center justify-center p-6">
          <MeditationTimer onBack={() => setShowTimer(false)} />
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 backdrop-blur-sm bg-card/30">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-muted-foreground">
          <p>Personal mastery through sacred rhythm</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
