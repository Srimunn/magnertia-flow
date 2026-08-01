import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { ControlPlanRecord } from "@/services/types";

interface ControlPlanProcessControlCardProps {
  record: ControlPlanRecord;
  onViewDetails?: () => void;
}

export const ControlPlanProcessControlCard: React.FC<ControlPlanProcessControlCardProps> = ({
  record,
  onViewDetails,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">
            4. Process Control
          </h2>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Work Instruction Ref</span>
            <span className="font-mono font-bold text-primary">{record.workInstructionRef}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">SOP Reference</span>
            <span className="font-mono font-bold text-primary">{record.sopRef}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Control Device</span>
            <span className="font-semibold text-foreground">{record.controlDevice}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Error Proofing (Poka-Yoke)</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Preventive Maintenance</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Process Validation Status</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              Validated
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border/40">
            <span className="text-muted-foreground font-medium">Process Control Score</span>
            <span className="font-extrabold text-purple-600 dark:text-purple-400">
              {record.processControlScore} / 100
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="mt-3 w-full py-1 text-[11px] font-bold text-primary hover:underline flex items-center justify-center gap-1 transition-colors border border-border rounded bg-muted/20"
      >
        View Details <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
