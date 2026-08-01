import React from "react";
import { ArrowRight, BarChart3 } from "lucide-react";
import type { PfmeaFailureMode } from "@/services/types";

interface PfmeaRpnDistributionChartProps {
  failureModes: PfmeaFailureMode[];
  onViewRiskAnalysis?: () => void;
}

export const PfmeaRpnDistributionChart: React.FC<PfmeaRpnDistributionChartProps> = ({
  failureModes,
  onViewRiskAnalysis,
}) => {
  // Compute High, Medium, Low counts for Before vs After
  const beforeHigh = failureModes.filter((fm) => fm.rpnBefore >= 100).length;
  const beforeMedium = failureModes.filter((fm) => fm.rpnBefore >= 70 && fm.rpnBefore < 100).length;
  const beforeLow = failureModes.filter((fm) => fm.rpnBefore < 70).length;

  const afterHigh = failureModes.filter((fm) => fm.rpnAfter >= 100).length;
  const afterMedium = failureModes.filter((fm) => fm.rpnAfter >= 70 && fm.rpnAfter < 100).length;
  const afterLow = failureModes.filter((fm) => fm.rpnAfter < 70).length;

  const maxVal = Math.max(beforeHigh, beforeMedium, beforeLow, afterHigh, afterMedium, afterLow, 5);

  const categories = [
    { label: "High (≥100)", before: beforeHigh, after: afterHigh },
    { label: "Medium (70-99)", before: beforeMedium, after: afterMedium },
    { label: "Low (<70)", before: beforeLow, after: afterLow },
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-3">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-foreground text-xs">
              RPN Distribution (Before vs After)
            </h2>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-semibold">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span className="text-muted-foreground">Before Action</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-muted-foreground">After Action</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-36 flex items-end justify-around gap-4 pt-4 px-2">
          {categories.map((cat, idx) => {
            const beforeHeight = (cat.before / maxVal) * 100;
            const afterHeight = (cat.after / maxVal) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="flex items-end gap-1.5 w-full justify-center h-full">
                  {/* Before Action Bar */}
                  <div className="w-5 bg-muted rounded-t relative group flex flex-col justify-end">
                    <div
                      className="bg-rose-500 rounded-t transition-all duration-700 relative flex justify-center"
                      style={{ height: `${Math.max(beforeHeight, 5)}%` }}
                    >
                      <span className="absolute -top-4 font-mono font-extrabold text-[10px] text-foreground">
                        {cat.before}
                      </span>
                    </div>
                  </div>

                  {/* After Action Bar */}
                  <div className="w-5 bg-muted rounded-t relative group flex flex-col justify-end">
                    <div
                      className="bg-emerald-500 rounded-t transition-all duration-700 relative flex justify-center"
                      style={{ height: `${Math.max(afterHeight, 5)}%` }}
                    >
                      <span className="absolute -top-4 font-mono font-extrabold text-[10px] text-foreground">
                        {cat.after}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-muted-foreground text-center truncate">
                  {cat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onViewRiskAnalysis}
        className="mt-3 w-full py-1 text-[11px] font-bold text-primary hover:underline flex items-center justify-center gap-1 transition-colors border border-border rounded bg-muted/20"
      >
        View Full Risk Analysis <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
