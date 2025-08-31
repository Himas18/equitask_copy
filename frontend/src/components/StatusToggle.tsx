import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const StatusToggle = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatus = profile?.status || 'available';

  const updateStatus = async (newStatus: 'available' | 'busy') => {
    if (!profile?.user_id) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Your status has been changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'available' 
      ? 'bg-success/10 text-success border-success/20' 
      : 'bg-warning/10 text-warning border-warning/20';
  };

  const getStatusIcon = (status: string) => {
    return status === 'available' ? CheckCircle : Clock;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`text-xs font-medium border transition-all duration-200 ${getStatusColor(currentStatus)}`}
      >
        {React.createElement(getStatusIcon(currentStatus), { className: "h-3 w-3 mr-1" })}
        {currentStatus === 'available' ? 'Available' : 'Busy'}
      </Badge>
      
      <div className="flex gap-1">
        <Button
          variant={currentStatus === 'available' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateStatus('available')}
          disabled={isUpdating || currentStatus === 'available'}
          className="text-xs h-auto py-1 px-2"
        >
          Available
        </Button>
        <Button
          variant={currentStatus === 'busy' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateStatus('busy')}
          disabled={isUpdating || currentStatus === 'busy'}
          className="text-xs h-auto py-1 px-2"
        >
          Busy
        </Button>
      </div>
    </div>
  );
};

export default StatusToggle;