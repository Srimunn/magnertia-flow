import React from "react";
import type { PilotProductionRecord } from "@/services/types";

interface PilotProductionSummaryCardProps {
  record: PilotProductionRecord;
}

export const PilotProductionSummaryCard: React.FC<PilotProductionSummaryCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <h2 className="font-bold text-foreground text-xs pb-2 border-b border-border mb-2.5">
          8. Pilot Production Summary
        </h2>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Production Score</span>
            <span className="font-mono font-bold text-foreground">{record.productionScore} / 100</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Quality Score</span>
            <span className="font-mono font-bold text-foreground">{record.qualityScore} / 100</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Process Performance Score</span>
            <span className="font-mono font-bold text-foreground">{record.processPerformanceScore} / 100</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Readiness Score</span>
            <span className="font-mono font-bold text-foreground">{record.readinessScore} / 100</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">AI Health Score</span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{record.aiAssessment.healthScore} / 100</span>
          </div>

          <div className="pt-2 border-t border-border mt-2 flex justify-between items-center font-bold">
            <span className="text-foreground">Overall Pilot Readiness</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
              {record.overallPilotReadiness} / 100
            </span>
          </div>

          <div className="flex justify-between items-center pt-1.5">
            <span className="text-muted-foreground font-semibold">Recommendation</span>
            <span className="px-2.5 py-0.5 rounded font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
              {record.recommendation}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
