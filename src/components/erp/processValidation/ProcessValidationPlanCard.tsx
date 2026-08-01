import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";

interface ProcessValidationPlanCardProps {
  record: ProcessValidationRecord;
}

export const ProcessValidationPlanCard: React.FC<ProcessValidationPlanCardProps> = ({
  record,
}) => {
  const { trialRunSummary, defectDistribution } = record;

  const steps = [
    { name: "Plan", status: "Completed" },
    { name: "Trial Production", status: "Completed" },
    { name: "Data Collection", status: "In Progress" },
    { name: "Analysis", status: "Pending" },
    { name: "Report", status: "Pending" },
    { name: "Approval", status: "Pending" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">3. Validation Plan</h2>
        </div>

        {/* 6-Step Stepper */}
        <div className="mb-4">
          <span className="text-[10px] text-muted-foreground font-semibold block mb-2">Progress</span>
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-border -z-0" />
            {steps.map((st, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10">
                {st.status === "Completed" ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                ) : st.status === "In Progress" ? (
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center ring-2 ring-blue-300">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {idx + 1}
                  </div>
                )}
                <span className="text-[9px] font-bold text-foreground mt-1 truncate max-w-[65px]" title={st.name}>
                  {st.name}
                </span>
                <span className="text-[8px] text-muted-foreground font-medium">{st.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Split: Trial Run Summary & Defect Distribution Doughnut */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
          {/* Trial Run Summary */}
          <div className="space-y-1.5 text-[11px]">
            <span className="font-bold text-foreground text-[11px] block border-b border-border/40 pb-1">
              Trial Run Summary
            </span>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Parts Produced</span>
              <span className="font-mono font-bold text-foreground">{trialRunSummary.totalPartsProduced.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Conforming Parts</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{trialRunSummary.conformingParts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Non-Conforming Parts</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{trialRunSummary.nonConformingParts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current FPY</span>
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{trialRunSummary.currentFpy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Defect Rate</span>
              <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400">{trialRunSummary.defectRate}%</span>
            </div>
          </div>

          {/* Defect Distribution (Top 5) Doughnut Simulation */}
          <div>
            <span className="font-bold text-foreground text-[11px] block border-b border-border/40 pb-1 mb-1.5">
              Defect Distribution (Top 5)
            </span>
            <div className="space-y-1">
              {defectDistribution.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground font-medium truncate">{d.category}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground shrink-0">
                    {d.count} ({d.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
