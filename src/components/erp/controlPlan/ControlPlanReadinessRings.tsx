import React from "react";
import type { ControlPlanRecord } from "@/services/types";

interface ControlPlanReadinessRingsProps {
  record: ControlPlanRecord;
}

export const ControlPlanReadinessRings: React.FC<ControlPlanReadinessRingsProps> = ({
  record,
}) => {
  const rings = [
    { label: "Characteristics", score: record.characteristicReadinessScore, color: "#10b981" },
    { label: "Inspection", score: record.inspectionReadinessScore, color: "#3b82f6" },
    { label: "Process Control", score: record.processControlScore, color: "#8b5cf6" },
    { label: "Validation", score: record.validationScore, color: "#14b8a6" },
    { label: "Overall Readiness", score: record.overallControlPlanReadinessScore, color: "#059669" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-xs">
      <h3 className="font-bold text-foreground mb-2 text-xs border-b border-border pb-1.5">
        Readiness Overview
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {rings.map((r, idx) => {
          const radius = 20;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (r.score / 100) * circumference;

          return (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center w-12 h-12 mb-1">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3.5" className="text-muted/30" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke={r.color}
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-[11px] font-extrabold text-foreground">{r.score}</span>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground truncate max-w-[80px]" title={r.label}>
                {r.label}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Good</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
