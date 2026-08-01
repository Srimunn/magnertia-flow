import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";

interface ProcessValidationQualityCardProps {
  record: ProcessValidationRecord;
  onViewDetails?: () => void;
}

export const ProcessValidationQualityCard: React.FC<ProcessValidationQualityCardProps> = ({
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

        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="space-y-2">
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Incoming Inspection
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Validation Inspection
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Final Inspection
            </div>
            <div className="pt-1">
              <span className="text-muted-foreground block text-[10px]">Defect Rate</span>
              <span className="font-mono font-bold text-foreground">{record.defectRate}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground block text-[10px]">First Pass Yield (FPY)</span>
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{record.fpy}%</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Scrap Rate</span>
              <span className="font-mono font-bold text-foreground">{record.scrapRate}%</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Rework Rate</span>
              <span className="font-mono font-bold text-foreground">{record.reworkRate}%</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Validation Score</span>
              <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400">{record.validationScore} / 100</span>
            </div>
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
