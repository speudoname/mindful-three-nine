import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Target, Plus } from "lucide-react";

export default function GoalDialog({ existingGoal, onUpdate }: { existingGoal?: any; onUpdate: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(existingGoal?.title || "");
  const [description, setDescription] = useState(existingGoal?.description || "");
  const [goalType, setGoalType] = useState(existingGoal?.goal_type || "total_sessions");
  const [targetValue, setTargetValue] = useState(existingGoal?.target_value || 30);
  const [deadline, setDeadline] = useState(existingGoal?.deadline?.split("T")[0] || "");

  useEffect(() => {
    if (existingGoal) {
      setTitle(existingGoal.title);
      setDescription(existingGoal.description || "");
      setGoalType(existingGoal.goal_type);
      setTargetValue(existingGoal.target_value);
      setDeadline(existingGoal.deadline?.split("T")[0] || "");
    }
  }, [existingGoal]);

  const handleSave = async () => {
    if (!title.trim() || targetValue <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const goalData = {
        user_id: user?.id,
        title,
        description,
        goal_type: goalType,
        target_value: targetValue,
        deadline: deadline || null,
        is_active: true,
      };

      if (existingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from("goals")
          .update(goalData)
          .eq("id", existingGoal.id);

        if (error) throw error;
        toast.success("Goal updated!");
      } else {
        // Create new goal
        const { error } = await supabase
          .from("goals")
          .insert(goalData);

        if (error) throw error;
        toast.success("Goal created!");
      }

      setOpen(false);
      setTitle("");
      setDescription("");
      setGoalType("total_sessions");
      setTargetValue(30);
      setDeadline("");
      onUpdate();
    } catch (error: any) {
      console.error("Error saving goal:", error);
      toast.error("Failed to save goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existingGoal ? (
          <Button variant="ghost" size="sm">Edit</Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {existingGoal ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
          <DialogDescription>
            Set a personal goal to track your meditation progress
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Meditate 30 times this month"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description or motivation"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal_type">Goal Type</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger id="goal_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_sessions">Total Sessions</SelectItem>
                <SelectItem value="total_minutes">Total Minutes</SelectItem>
                <SelectItem value="streak_days">Streak Days</SelectItem>
                <SelectItem value="weekly_sessions">Weekly Sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_value">Target Value *</Label>
            <Input
              id="target_value"
              type="number"
              min="1"
              value={targetValue}
              onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              {goalType === "total_sessions" && "Number of sessions to complete"}
              {goalType === "total_minutes" && "Total minutes to meditate"}
              {goalType === "streak_days" && "Days to maintain streak"}
              {goalType === "weekly_sessions" && "Sessions per week"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
