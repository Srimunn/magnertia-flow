import React from "react";
import { Activity, ArrowRight } from "lucide-react";
import type { ApqpActivityLog } from "@/services/types";

interface ApqpRecentActivitiesFeedProps {
  activities: ApqpActivityLog[];
  onViewHistory?: () => void;
}

export const ApqpRecentActivitiesFeed: React.FC<ApqpRecentActivitiesFeedProps> = ({
  activities,
  onViewHistory,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-500" />
            <h2 className="font-bold text-foreground text-xs">Recent Activities</h2>
          </div>
        </div>

        <div className="space-y-2.5">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-[11px] truncate">
                  {act.action}
                </div>
                <div className="text-[10px] text-muted-foreground flex justify-between items-center mt-0.5">
                  <span>By {act.user}</span>
                  <span className="font-mono">{act.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onViewHistory}
        className="mt-3 w-full py-1 text-[11px] font-bold text-primary hover:underline flex items-center justify-center gap-1 transition-colors border border-border rounded bg-muted/20"
      >
        View Activity History <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
