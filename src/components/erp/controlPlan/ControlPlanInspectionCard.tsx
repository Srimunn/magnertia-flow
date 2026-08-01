import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { ControlPlanRecord } from "@/services/types";

interface ControlPlanInspectionCardProps {
  record: ControlPlanRecord;
  onViewDetails?: () => void;
}

export const ControlPlanInspectionCard: React.FC<ControlPlanInspectionCardProps> = ({
  record,
  onViewDetails,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">
            3. Inspection & Monitoring Plan
          </h2>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Inspection Method</span>
            <span className="font-bold text-foreground">{record.inspectionMethod}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Measuring Equipment</span>
            <span className="font-semibold text-foreground">{record.measuringEquipment}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Sample Size</span>
            <span className="font-mono font-bold text-foreground">{record.sampleSize}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Inspection Frequency</span>
            <span className="font-semibold text-foreground">{record.inspectionFrequency}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">MSA Reference</span>
            <span className="font-mono font-bold text-primary">{record.msaRef}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">SPC Required</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Reaction Plan</span>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5" title={record.reactionPlan}>
              {record.reactionPlan}
            </p>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-border/40">
            <span className="text-muted-foreground font-medium">Inspection Readiness Score</span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400">
              {record.inspectionReadinessScore} / 100
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
