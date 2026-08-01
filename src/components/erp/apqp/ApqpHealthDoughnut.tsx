import React from "react";
import type { ApqpRecord } from "@/services/types";

interface ApqpHealthDoughnutProps {
  record: ApqpRecord;
}

export const ApqpHealthDoughnut: React.FC<ApqpHealthDoughnutProps> = ({ record }) => {
  const scores = [
    { label: "Design Readiness", score: record.designScore, color: "#10b981" }, // Emerald
    { label: "Validation Score", score: record.validationScore, color: "#3b82f6" }, // Blue
    { label: "Supplier Quality Score", score: record.supplierQualityScore, color: "#f97316" }, // Orange
    { label: "Risk Score", score: record.riskScore, color: "#ef4444" }, // Red
    { label: "APQP Health Score", score: record.apqpHealthScore, color: "#8b5cf6" }, // Purple
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <h2 className="font-bold text-foreground text-xs pb-2 border-b border-border mb-3">
          Overall APQP Health
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Circular Segmented Gauge */}
          <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="44"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/20"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="44"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray="276"
                strokeDashoffset={276 - (record.overallApqpScore / 100) * 276}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-foreground">{record.overallApqpScore}</span>
              <span className="text-[9px] font-bold text-muted-foreground">/ 100</span>
              <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">Good</span>
            </div>
          </div>

          {/* Breakdown Legend List */}
          <div className="flex-1 space-y-1.5 w-full">
            {scores.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-muted-foreground font-medium truncate">{s.label}</span>
                </div>
                <span className="font-bold font-mono text-foreground shrink-0">{s.score}/100</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border mt-3 flex justify-between items-center">
        <span className="font-semibold text-muted-foreground text-[10px]">Overall Project Readiness</span>
        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{record.overallProjectReadiness} / 100</span>
      </div>
    </div>
  );
};
