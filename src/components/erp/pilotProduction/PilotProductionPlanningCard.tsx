import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { PilotProductionRecord } from "@/services/types";

interface PilotProductionPlanningCardProps {
  record: PilotProductionRecord;
}

export const PilotProductionPlanningCard: React.FC<PilotProductionPlanningCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">2. Production Planning</h2>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Production Order</span>
            <span className="font-mono font-bold text-primary cursor-pointer hover:underline">{record.productionOrder}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">BOM Reference</span>
            <span className="font-mono font-bold text-primary cursor-pointer hover:underline">{record.bomRef}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Routing Reference</span>
            <span className="font-mono font-bold text-primary cursor-pointer hover:underline">{record.routingRef}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Planned Quantity</span>
            <span className="font-mono font-bold text-foreground">{record.plannedQuantity.toLocaleString()} Units</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Actual Quantity</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{record.actualQuantity.toLocaleString()} Units</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Material Availability</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Available
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] font-semibold">Machine Allocation</span>
            <span className="font-mono text-[10px] text-foreground font-semibold block mt-0.5">{record.machineAllocation}</span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-border/40">
            <span className="text-muted-foreground font-semibold">Operator Assignment</span>
            <span className="font-mono font-bold text-primary cursor-pointer hover:underline">{record.operatorAssignment}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
