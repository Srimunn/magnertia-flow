import React from "react";
import type { PfmeaFailureMode } from "@/services/types";

interface PfmeaRiskPrioritySummaryProps {
  failureModes: PfmeaFailureMode[];
}

export const PfmeaRiskPrioritySummary: React.FC<PfmeaRiskPrioritySummaryProps> = ({
  failureModes,
}) => {
  const highCount = failureModes.filter((fm) => fm.rpnBefore >= 100).length;
  const mediumCount = failureModes.filter((fm) => fm.rpnBefore >= 70 && fm.rpnBefore < 100).length;
  const lowCount = failureModes.filter((fm) => fm.rpnBefore < 70).length;
  const total = failureModes.length || 1;

  const highPct = ((highCount / total) * 100).toFixed(1);
  const mediumPct = ((mediumCount / total) * 100).toFixed(1);
  const lowPct = ((lowCount / total) * 100).toFixed(1);

  const categories = [
    { label: "High (RPN ≥ 100)", count: highCount, pct: highPct, color: "#ef4444" },
    { label: "Medium (RPN 70-99)", count: mediumCount, pct: mediumPct, color: "#f59e0b" },
    { label: "Low (RPN < 70)", count: lowCount, pct: lowPct, color: "#10b981" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <h2 className="font-bold text-foreground text-xs pb-2 border-b border-border mb-3">
          Risk Priority Summary
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Circular Segmented Doughnut Chart */}
          <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="44" stroke="currentColor" strokeWidth="10" className="text-muted/20" fill="transparent" />
              <circle
                cx="56"
                cy="56"
                r="44"
                stroke="#ef4444"
                strokeWidth="10"
                strokeDasharray="276"
                strokeDashoffset={276 - (highCount / total) * 276}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-foreground">{failureModes.length}</span>
              <span className="text-[9px] font-bold text-muted-foreground">Failure Modes</span>
            </div>
          </div>

          {/* Breakdown Legend List */}
          <div className="flex-1 space-y-2 w-full text-[11px]">
            {categories.map((c, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-muted-foreground font-medium truncate">{c.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold font-mono text-foreground">{c.count}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">({c.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border mt-3 flex justify-between items-center text-[10px]">
        <span className="font-semibold text-muted-foreground">Total Failure Modes</span>
        <span className="font-extrabold text-foreground">{failureModes.length} Items</span>
      </div>
    </div>
  );
};
