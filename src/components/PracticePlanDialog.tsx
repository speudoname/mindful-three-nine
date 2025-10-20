import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Settings } from "lucide-react";

export default function PracticePlanDialog({ existingPlan, onUpdate }: { existingPlan?: any; onUpdate: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState(existingPlan?.frequency || "daily");
  const [targetSessions, setTargetSessions] = useState(existingPlan?.target_sessions_per_week || 7);
  const [targetMinutes, setTargetMinutes] = useState(existingPlan?.target_minutes_per_week || 63);
  const [graceDays, setGraceDays] = useState(existingPlan?.grace_days || 1);

  useEffect(() => {
    if (existingPlan) {
      setFrequency(existingPlan.frequency);
      setTargetSessions(existingPlan.target_sessions_per_week || 7);
      setTargetMinutes(existingPlan.target_minutes_per_week || 63);
      setGraceDays(existingPlan.grace_days);
    }
  }, [existingPlan]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (existingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from("practice_plans")
          .update({
            frequency,
            target_sessions_per_week: targetSessions,
            target_minutes_per_week: targetMinutes,
            grace_days: graceDays,
          })
          .eq("id", existingPlan.id);

        if (error) throw error;
        toast.success("Practice plan updated!");
      } else {
        // Deactivate any existing plans first
        await supabase
          .from("practice_plans")
          .update({ is_active: false })
          .eq("user_id", user?.id);

        // Create new plan
        const { error } = await supabase
          .from("practice_plans")
          .insert({
            user_id: user?.id,
            frequency,
            target_sessions_per_week: targetSessions,
            target_minutes_per_week: targetMinutes,
            grace_days: graceDays,
            is_active: true,
          });

        if (error) throw error;
        toast.success("Practice plan created!");
      }

      setOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error("Error saving practice plan:", error);
      toast.error("Failed to save practice plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          {existingPlan ? "Edit Plan" : "Set Practice Plan"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{existingPlan ? "Edit Practice Plan" : "Create Practice Plan"}</DialogTitle>
          <DialogDescription>
            Set your meditation goals and practice frequency
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="every_other_day">Every Other Day</SelectItem>
                <SelectItem value="three_per_week">3x per Week</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_sessions">Target Sessions per Week</Label>
            <Input
              id="target_sessions"
              type="number"
              min="1"
              max="21"
              value={targetSessions}
              onChange={(e) => setTargetSessions(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_minutes">Target Minutes per Week</Label>
            <Input
              id="target_minutes"
              type="number"
              min="1"
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Suggested: {targetSessions * 9} minutes (9 min per session)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grace_days">Grace Days</Label>
            <Input
              id="grace_days"
              type="number"
              min="0"
              max="3"
              value={graceDays}
              onChange={(e) => setGraceDays(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Days you can skip without breaking your streak
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
