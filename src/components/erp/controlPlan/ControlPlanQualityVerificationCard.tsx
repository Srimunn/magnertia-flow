import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { ControlPlanRecord } from "@/services/types";

interface ControlPlanQualityVerificationCardProps {
  record: ControlPlanRecord;
  onViewDetails?: () => void;
}

export const ControlPlanQualityVerificationCard: React.FC<ControlPlanQualityVerificationCardProps> = ({
  record,
  onViewDetails,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">
            5. Quality Verification
          </h2>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Incoming Inspection</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">In-Process Inspection</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Final Inspection</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Control Plan Audit</span>
            <span className="font-semibold text-foreground">{record.controlPlanAudit}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Process Capability (Cp/Cpk)</span>
            <span className="font-mono font-bold text-foreground">{record.processCapabilityCpk}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">PPAP Reference</span>
            <span className="font-mono font-bold text-primary">{record.ppapRef}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border/40">
            <span className="text-muted-foreground font-medium">Validation Score</span>
            <span className="font-extrabold text-teal-600 dark:text-teal-400">
              {record.validationScore} / 100
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
