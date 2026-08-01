import React from "react";
import { Layers } from "lucide-react";
import type { ApqpRecord } from "@/services/types";

interface ApqpProjectOverviewCardProps {
  record: ApqpRecord;
}

export const ApqpProjectOverviewCard: React.FC<ApqpProjectOverviewCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-foreground text-xs">1. Project Overview</h2>
          </div>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Product Family</span>
            <span className="font-bold text-foreground">{record.productFamily}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Product Model</span>
            <span className="font-bold text-foreground font-mono">{record.productModel}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Project Scope</span>
            <span className="font-medium text-foreground text-[10px] leading-tight block mt-0.5" title={record.projectScope}>
              {record.projectScope}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Customer Requirements</span>
            <span className="font-medium text-foreground text-[10px] leading-tight block mt-0.5" title={record.customerRequirements}>
              {record.customerRequirements}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-border/40">
            <span className="text-muted-foreground">Target SOP Date</span>
            <span className="font-bold text-foreground">{record.targetSopDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Program Status</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
              {record.programStatus}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Priority</span>
            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
              {record.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border mt-2 flex justify-between items-center">
        <span className="font-semibold text-muted-foreground text-[10px]">Overall APQP Score</span>
        <span className="font-extrabold text-primary text-xs">{record.overallApqpScore} / 100</span>
      </div>
    </div>
  );
};
