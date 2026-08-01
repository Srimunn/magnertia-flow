import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { PilotProductionRecord } from "@/services/types";

interface PilotProductionReadinessCardProps {
  record: PilotProductionRecord;
}

export const PilotProductionReadinessCard: React.FC<PilotProductionReadinessCardProps> = ({
  record,
}) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const score = record.productionReadinessScore;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">6. Production Readiness</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px] items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Equipment Readiness: Ready
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tooling Readiness: Ready
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Operator Readiness: Ready
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Material Readiness: Ready
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Safety Readiness: Verified
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Documentation Complete
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-2 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50">
            <div className="relative flex items-center justify-center w-16 h-16 mb-1">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" className="text-muted/30" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="#059669"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-base font-black text-foreground">{score}</span>
                <span className="text-[8px] font-bold text-muted-foreground">/100</span>
              </div>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Production Readiness Score</span>
          </div>
        </div>
      </div>
    </div>
  );
};
