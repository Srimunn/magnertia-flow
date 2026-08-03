import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProcessValidationPlanCardProps {
  record: ProcessValidationRecord;
}

export const ProcessValidationPlanCard: React.FC<ProcessValidationPlanCardProps> = ({
  record,
}) => {
  const { trialRunSummary, defectDistribution } = record;

  const steps = [
    { name: "Plan", shortName: "Plan", status: "Completed" },
    { name: "Trial Production", shortName: "Trial", status: "Completed" },
    { name: "Data Collection", shortName: "Data", status: "In Progress" },
    { name: "Analysis", shortName: "Analysis", status: "Pending" },
    { name: "Report", shortName: "Report", status: "Pending" },
    { name: "Approval", shortName: "Approval", status: "Pending" },
  ];

  const completedSteps = steps.filter((s) => s.status === "Completed").length;
  const currentStep = steps.find((s) => s.status === "In Progress") || steps[0];
  const progressPercent = Math.round(
    ((completedSteps + (currentStep.status === "In Progress" ? 0.5 : 0)) / steps.length) * 100
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="h-full bg-card border border-border/80 rounded-xl shadow-xs p-3.5 flex flex-col justify-between text-xs overflow-hidden">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-border/60 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h2 className="font-bold text-foreground text-xs tracking-tight">Validation Plan</h2>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Clock className="w-3 h-3" />
              Stage 3 of 6
            </span>
          </div>

          {/* Stepper Progress Section */}
          <div className="mb-3.5 bg-muted/30 p-2.5 rounded-lg border border-border/40">
            <div className="flex justify-between items-center text-[10px] mb-2">
              <span className="text-muted-foreground font-semibold">Validation Progress</span>
              <span className="font-mono font-bold text-foreground">{progressPercent}%</span>
            </div>

            {/* Stepper Nodes Track */}
            <div className="relative flex items-center justify-between w-full">
              {/* Background Connecting Line */}
              <div className="absolute top-2.5 left-[8%] right-[8%] h-0.5 bg-border z-0" />
              {/* Active Progress Line */}
              <div
                className="absolute top-2.5 left-[8%] h-0.5 bg-emerald-500 z-0 transition-all duration-300"
                style={{ width: `${(completedSteps / (steps.length - 1)) * 84}%` }}
              />

              {/* 6 Step Nodes */}
              {steps.map((st, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <div className="flex-1 min-w-0 flex flex-col items-center relative z-10 cursor-pointer">
                      {st.status === "Completed" ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-2 ring-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : st.status === "In Progress" ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-blue-500/20 shadow-xs animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          {idx + 1}
                        </div>
                      )}
                      <span className="text-[9px] font-bold text-foreground mt-1 truncate max-w-full px-0.5">
                        {st.shortName}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p className="font-bold">{idx + 1}. {st.name}</p>
                    <p className="text-[10px] text-muted-foreground">Status: {st.status}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Bottom Split: Trial Run Summary & Defect Distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Trial Run Summary */}
            <div className="space-y-1.5 text-[11px] bg-card p-2.5 rounded-lg border border-border/50">
              <span className="font-bold text-foreground text-[11px] block border-b border-border/40 pb-1 mb-1">
                Trial Run Summary
              </span>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-[10.5px]">Total Parts</span>
                <span className="font-mono font-bold text-foreground">{trialRunSummary.totalPartsProduced.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-[10.5px]">Conforming</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{trialRunSummary.conformingParts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-[10.5px]">Non-Conforming</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{trialRunSummary.nonConformingParts}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border/30">
                <span className="text-muted-foreground text-[10.5px]">Current FPY</span>
                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{trialRunSummary.currentFpy}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-[10.5px]">Defect Rate</span>
                <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400">{trialRunSummary.defectRate}%</span>
              </div>
            </div>

            {/* Defect Distribution (Top 5) */}
            <div className="bg-card p-2.5 rounded-lg border border-border/50">
              <span className="font-bold text-foreground text-[11px] block border-b border-border/40 pb-1 mb-1">
                Defect Distribution (Top 5)
              </span>
              <div className="space-y-1.5 pt-0.5">
                {defectDistribution.map((d, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div className="space-y-0.5 cursor-pointer">
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 min-w-0 pr-1">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                            <span className="text-muted-foreground font-medium truncate">{d.category}</span>
                          </div>
                          <span className="font-mono font-bold text-foreground shrink-0">
                            {d.count} ({d.percentage}%)
                          </span>
                        </div>
                        <div className="h-1 w-full bg-muted/60 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${d.percentage}%`, backgroundColor: d.color }}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      <p className="font-bold">{d.category}</p>
                      <p className="text-[10px] text-muted-foreground">{d.count} defects ({d.percentage}%)</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
