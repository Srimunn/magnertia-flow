import React from "react";
import { Layers } from "lucide-react";
import type { ControlPlanRecord } from "@/services/types";

interface ControlPlanOverviewCardProps {
  record: ControlPlanRecord;
}

export const ControlPlanOverviewCard: React.FC<ControlPlanOverviewCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-foreground text-xs">1. Control Plan Overview</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-[11px]">
          <div>
            <span className="text-muted-foreground block text-[10px]">Product Family</span>
            <span className="font-bold text-foreground">{record.productFamily}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Production Line</span>
            <span className="font-bold text-foreground font-mono">{record.productionLine}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Work Centre</span>
            <span className="font-bold text-foreground font-mono">{record.workCentre}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Process Flow Ref</span>
            <span className="font-bold font-mono text-primary">{record.processFlowRef}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Routing Ref</span>
            <span className="font-bold font-mono text-primary">{record.routingRef}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Control Plan Type</span>
            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300">
              {record.controlPlanType}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Lifecycle Stage</span>
            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300">
              {record.lifecycleStage}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Priority</span>
            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300">
              {record.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
