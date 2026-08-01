import React from "react";
import { Layers } from "lucide-react";
import type { PilotProductionRecord } from "@/services/types";

interface PilotProductionOverviewCardProps {
  record: PilotProductionRecord;
}

export const PilotProductionOverviewCard: React.FC<PilotProductionOverviewCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-foreground text-xs">1. Pilot Production Overview</h2>
          </div>
        </div>

        <div className="space-y-2 text-[11px]">
          <div>
            <span className="text-muted-foreground block text-[10px] font-semibold">Pilot Objective</span>
            <p className="text-[11px] text-foreground mt-0.5 leading-snug">{record.objective}</p>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] font-semibold">Production Scope</span>
            <p className="text-[11px] text-foreground mt-0.5 leading-snug">{record.scope}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
            <div>
              <span className="text-muted-foreground block text-[10px] font-semibold">Production Location</span>
              <span className="font-bold text-foreground">{record.location}</span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] font-semibold">Pilot Team</span>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex -space-x-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold ring-1 ring-background">
                    RS
                  </div>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold ring-1 ring-background">
                    VK
                  </div>
                  <div className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[8px] font-bold ring-1 ring-background">
                    NR
                  </div>
                  <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-bold ring-1 ring-background">
                    AK
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground ml-1">+3</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
            <div>
              <span className="text-muted-foreground block text-[10px] font-semibold">Process Owner</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                  VS
                </div>
                <span className="font-bold text-foreground">{record.processOwnerName}</span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] font-semibold">Production Schedule</span>
              <span className="font-mono text-muted-foreground text-[10px] block">{record.startDate} to {record.endDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[10px]">
            <div>
              <span className="text-muted-foreground block">Lifecycle Stage</span>
              <span className="px-1.5 py-0.2 rounded font-bold text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {record.lifecycleStage}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Priority</span>
              <span className="px-1.5 py-0.2 rounded font-bold text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                {record.priority}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
