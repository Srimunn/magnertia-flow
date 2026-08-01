import React from "react";
import { Calendar, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import type { ApqpMilestone } from "@/services/types";

interface ApqpMilestonesPanelProps {
  milestones: ApqpMilestone[];
  onViewAll?: () => void;
}

export const ApqpMilestonesPanel: React.FC<ApqpMilestonesPanelProps> = ({
  milestones,
  onViewAll,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-xs space-y-2.5">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <h2 className="font-bold text-foreground text-xs">Upcoming Milestones</h2>
        </div>
      </div>

      <div className="space-y-2 text-[11px]">
        {milestones.map((ms) => (
          <div key={ms.id} className="flex items-center justify-between py-1 px-1 rounded hover:bg-muted/40">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              {ms.status === "Completed" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              )}
              <span className="font-semibold text-foreground truncate">{ms.title}</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground shrink-0">{ms.targetDate}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onViewAll}
        className="mt-2 w-full py-0.5 text-[10px] font-semibold text-primary hover:underline flex items-center justify-center gap-0.5"
      >
        View All Milestones <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
