import React from "react";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import type { PfmeaAction } from "@/services/types";

interface PfmeaRecommendedActionsCardProps {
  actions: PfmeaAction[];
  onViewAll?: () => void;
}

export const PfmeaRecommendedActionsCard: React.FC<PfmeaRecommendedActionsCardProps> = ({
  actions,
  onViewAll,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">
            Recommended Actions (Top 5)
          </h2>
          <span className="text-[10px] text-muted-foreground font-semibold">
            Revised RPN Target
          </span>
        </div>

        <div className="space-y-2">
          {actions.slice(0, 5).map((act) => (
            <div key={act.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="min-w-0 flex-1 pr-2">
                <span className="font-bold text-foreground text-[11px] block truncate" title={act.action}>
                  {act.action}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span className="font-semibold text-foreground">{act.responsible}</span>
                  <span>•</span>
                  <span className="font-mono">{act.targetDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    act.status === "In Progress"
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {act.status}
                </span>
                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-xs w-6 text-right">
                  {act.rpnAfter}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onViewAll}
        className="mt-3 w-full py-1 text-[11px] font-bold text-primary hover:underline flex items-center justify-center gap-1 transition-colors border border-border rounded bg-muted/20"
      >
        View All Actions <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
