import React from "react";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import type { PfmeaRecord } from "@/services/types";

interface PfmeaManufacturingValidationCardProps {
  record: PfmeaRecord;
  onViewValidation?: () => void;
}

export const PfmeaManufacturingValidationCard: React.FC<PfmeaManufacturingValidationCardProps> = ({
  record,
  onViewValidation,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">
            Manufacturing Validation
          </h2>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Process Validation Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Validated
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Pilot Production Status</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              Completed
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Capability Study (Cp/Cpk)</span>
            <span className="font-mono font-extrabold text-foreground">1.67 / 1.58</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">MSA Reference</span>
            <span className="font-mono font-bold text-primary">{record.msaRef}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Control Plan Reference</span>
            <span className="font-mono font-bold text-primary">{record.controlPlanRef}</span>
          </div>

          <div className="flex justify-between items-center pt-1.5 border-t border-border/40">
            <span className="text-muted-foreground font-medium">Validation Score</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {record.validationScore} / 100
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onViewValidation}
        className="mt-3 w-full py-1 text-[11px] font-bold text-primary hover:underline flex items-center justify-center gap-1 transition-colors border border-border rounded bg-muted/20"
      >
        View Validation Details <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
