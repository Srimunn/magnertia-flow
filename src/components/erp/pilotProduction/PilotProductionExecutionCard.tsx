import React from "react";
import type { PilotProductionRecord } from "@/services/types";

interface PilotProductionExecutionCardProps {
  record: PilotProductionRecord;
}

export const PilotProductionExecutionCard: React.FC<PilotProductionExecutionCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">3. Production Execution</h2>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Production Start</span>
            <span className="font-mono text-muted-foreground text-[10px]">{record.executionStart}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Production End</span>
            <span className="font-mono text-muted-foreground text-[10px]">{record.executionEnd}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Production Status</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              {record.productionStatus}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Machine Utilization (%)</span>
            <span className="font-mono font-bold text-foreground">{record.machineUtilization}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Cycle Time</span>
            <span className="font-mono font-bold text-foreground">{record.cycleTime} Min</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Throughput</span>
            <span className="font-mono font-bold text-foreground">{record.throughput} Units/Hour</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Downtime</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{record.downtime} Hours</span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-border/40 font-bold">
            <span className="text-foreground">OEE</span>
            <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-sm">{record.oee}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
