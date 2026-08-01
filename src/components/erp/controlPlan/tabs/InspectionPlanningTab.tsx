import React from "react";
import { FileCheck, CheckCircle2 } from "lucide-react";
import type { ControlPlanRecord } from "@/services/types";

interface InspectionPlanningTabProps {
  record: ControlPlanRecord;
}

export const InspectionPlanningTab: React.FC<InspectionPlanningTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Stage 2 - Inspection Planning, MSA Verification & Reaction Plans
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configures measuring equipment, gauge capability, sample sizes, inspection frequency, SPC charts, and out-of-spec reaction protocols.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-xs text-muted-foreground font-semibold">Inspection Readiness:</span>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {record.inspectionReadinessScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-500" /> Inspection & Equipment Setup
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Primary Inspection Method</span>
              <span className="font-bold text-foreground">{record.inspectionMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Measuring Equipment</span>
              <span className="font-semibold text-foreground">{record.measuringEquipment}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Sample Size per Check</span>
              <span className="font-mono font-bold text-foreground">{record.sampleSize} Units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Inspection Frequency</span>
              <span className="font-semibold text-foreground">{record.inspectionFrequency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">MSA Study Reference</span>
              <span className="font-mono font-bold text-primary">{record.msaRef}</span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Reaction Plan & Out-of-Spec Response Protocol
          </h3>
          <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded border border-border/40 font-medium">
            "{record.reactionPlan}"
          </p>
        </div>
      </div>
    </div>
  );
};
