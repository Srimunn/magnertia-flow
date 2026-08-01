import React from "react";
import { FileCheck, Activity, Plus } from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";

interface ValidationPlanTabProps {
  record: ProcessValidationRecord;
  onLogTrialRun?: () => void;
}

export const ValidationPlanTab: React.FC<ValidationPlanTabProps> = ({
  record,
  onLogTrialRun,
}) => {
  const { trialRunSummary, defectDistribution } = record;

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Validation Protocol, Trial Production & Acceptance Criteria
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Defines validation protocol parameters, statistical sample sizes, trial run quantities, and defect distribution models.
          </p>
        </div>
        <button
          onClick={onLogTrialRun}
          className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded shadow flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Log Trial Production Run
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-500" /> Validation Parameters & Protocol
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Validation Protocol Document</span>
              <span className="font-mono font-bold text-primary">{record.validationProtocolFile}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Validation Method</span>
              <span className="font-bold text-foreground">{record.validationMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Sample Size per Batch</span>
              <span className="font-mono font-bold text-foreground">{record.sampleSize} Units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Planned Trial Run Quantity</span>
              <span className="font-mono font-bold text-foreground">{record.trialRunQuantity} Units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Schedule Window</span>
              <span className="font-mono text-muted-foreground">{record.startDate} - {record.endDate}</span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Acceptance Criteria & Quality Gate
          </h3>
          <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded border border-border/40 font-medium">
            "{record.acceptanceCriteria}"
          </p>
        </div>
      </div>
    </div>
  );
};
