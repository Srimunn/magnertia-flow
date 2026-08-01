import React from "react";
import type { PfmeaRecord } from "@/services/types";
import { PfmeaFailureAnalysisTable } from "../PfmeaFailureAnalysisTable";

interface FailureAnalysisTabProps {
  record: PfmeaRecord;
  onAddFailureMode?: () => void;
}

export const FailureAnalysisTab: React.FC<FailureAnalysisTabProps> = ({
  record,
  onAddFailureMode,
}) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Stage 2 - Process Failure Mode, Effect, and Cause Analysis (AIAG & VDA)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Systematic evaluation of potential process failures, severity impact, occurrence probability, current controls, and detection ratings.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
          <span className="text-xs text-muted-foreground font-semibold">Top RPN (Before):</span>
          <span className="text-sm font-black text-rose-600 dark:text-rose-400">
            {record.topRpnBefore}
          </span>
        </div>
      </div>

      <PfmeaFailureAnalysisTable
        failureModes={record.failureModes}
        onAddFailureMode={onAddFailureMode}
      />
    </div>
  );
};
