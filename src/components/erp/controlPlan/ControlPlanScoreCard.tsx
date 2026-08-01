import React from "react";
import type { ControlPlanRecord } from "@/services/types";

interface ControlPlanScoreCardProps {
  record: ControlPlanRecord;
}

export const ControlPlanScoreCard: React.FC<ControlPlanScoreCardProps> = ({
  record,
}) => {
  const scores = [
    { label: "Characteristic Readiness Score", score: record.characteristicReadinessScore },
    { label: "Inspection Readiness Score", score: record.inspectionReadinessScore },
    { label: "Process Control Score", score: record.processControlScore },
    { label: "Validation Score", score: record.validationScore },
    { label: "AI Health Score", score: record.aiHealthScore },
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <h2 className="font-bold text-foreground text-xs pb-2 border-b border-border mb-2.5">
          Summary Score Card
        </h2>

        <div className="space-y-2 text-[11px]">
          {scores.map((s, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">{s.label}</span>
              <span className="font-mono font-bold text-foreground">{s.score} /100</span>
            </div>
          ))}

          <div className="pt-2 border-t border-border mt-2 flex justify-between items-center font-bold">
            <span className="text-foreground">Overall Control Plan Readiness Score</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
              {record.overallControlPlanReadinessScore} /100
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
