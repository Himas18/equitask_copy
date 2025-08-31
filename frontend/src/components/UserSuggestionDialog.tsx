import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Clock, User, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestAssignee } from "@/api";

interface UserSuggestion {
  user_id: string;
  name: string;
  current_workload: number;
  available_capacity: number;
  skill_match_count: number;
  status: string;
}

interface UserSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredSkills: string[];
  estimatedHours: number;
  onUserSelect: (userId: string, userName: string) => void;
}

const UserSuggestionDialog = ({
  open,
  onOpenChange,
  requiredSkills,
  estimatedHours,
  onUserSelect,
}: UserSuggestionDialogProps) => {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    if (!estimatedHours || estimatedHours <= 0) {
      toast({
        title: "Invalid hours",
        description: "Please enter estimated hours before getting suggestions",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await suggestAssignee({
        requiredSkills,
        estimatedHours,
      });
      setSuggestions(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching suggestions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (suggestion: UserSuggestion) => {
    onUserSelect(suggestion.user_id, suggestion.name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Suggested Users
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Based on workload, skills, and availability
            </div>
            <Button onClick={fetchSuggestions} disabled={loading}>
              {loading ? "Finding..." : "Get Suggestions"}
            </Button>
          </div>

          {suggestions.length === 0 && !loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Click "Get Suggestions" to find the best team member for this task
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <Card
                  key={suggestion.user_id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleUserSelect(suggestion)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1">
                              <Star className="h-4 w-4 text-warning fill-warning" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{suggestion.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {suggestion.available_capacity.toFixed(1)}h available
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {suggestion.skill_match_count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.skill_match_count} skill
                            {suggestion.skill_match_count !== 1 ? "s" : ""} match
                          </Badge>
                        )}
                        <Badge
                          variant={suggestion.status === "available" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {suggestion.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current workload: {suggestion.current_workload}h</span>
                        <span>
                          {index === 0 ? "Best match" : `#${index + 1} recommendation`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {suggestions.length === 0 && loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Finding the best team members...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSuggestionDialog;
