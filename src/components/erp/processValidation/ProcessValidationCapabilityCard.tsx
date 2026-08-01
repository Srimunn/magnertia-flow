import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";

interface ProcessValidationCapabilityCardProps {
  record: ProcessValidationRecord;
  onViewDetails?: () => void;
}

export const ProcessValidationCapabilityCard: React.FC<ProcessValidationCapabilityCardProps> = ({
  record,
  onViewDetails,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">
            4. Process Capability Verification
          </h2>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Cp</span>
            <span className="font-mono font-black text-foreground text-sm">{record.cp}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Cpk</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">{record.cpk}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Process Stability</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              {record.processStability}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">SPC Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">MSA Reference</span>
            <span className="font-mono font-bold text-primary">{record.msaRef}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Gauge R&R Result</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
              {record.gaugeRrrResult}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Capability Status</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              {record.capabilityStatus}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-border/40">
            <span className="text-muted-foreground font-medium">Capability Score</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {record.capabilityScore} / 100
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
