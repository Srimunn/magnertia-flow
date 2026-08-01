import React from "react";
import type { PfmeaRecord } from "@/services/types";

interface PfmeaScoresHeaderProps {
  record: PfmeaRecord;
}

export const PfmeaScoresHeader: React.FC<PfmeaScoresHeaderProps> = ({ record }) => {
  const scoreRings = [
    {
      label: "Function Readiness Score",
      score: record.functionReadinessScore,
      status: "Good",
      color: "#10b981", // Emerald
    },
    {
      label: "Validation Score",
      score: record.validationScore,
      status: "Good",
      color: "#3b82f6", // Blue
    },
    {
      label: "AI Health Score",
      score: record.aiHealthScore,
      status: "Good",
      color: "#8b5cf6", // Purple
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-card border-b border-border text-xs">
      {/* 3 Circular Score Rings */}
      {scoreRings.map((item, idx) => {
        const radius = 22;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (item.score / 100) * circumference;

        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-background/50 shadow-sm"
          >
            <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  stroke={item.color}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-foreground">
                {item.score}
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-muted-foreground truncate">
                {item.label}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-foreground">{item.score}/100</span>
                <span
                  className="text-[10px] px-1.5 py-0.2 rounded font-medium"
                  style={{
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                  }}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Open High Risk Items Card */}
      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-amber-300/70 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
          {record.openHighRiskItems}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-muted-foreground">Open High-Risk Items</span>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Requires Action</span>
        </div>
      </div>

      {/* Overall PFMEA Readiness Score */}
      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-emerald-300/70 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
        <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-muted/30" fill="transparent" />
            <circle cx="28" cy="28" r="22" stroke="#10b981" strokeWidth="4" strokeDasharray={138} strokeDashoffset={138 - (record.overallPfmeaReadinessScore / 100) * 138} strokeLinecap="round" fill="transparent" />
          </svg>
          <span className="absolute text-xs font-extrabold text-foreground">{record.overallPfmeaReadinessScore}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-muted-foreground">Overall Readiness</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Good (84/100)</span>
        </div>
      </div>

      {/* Top RPN Stat Badges (Before & After Action) */}
      <div className="flex flex-col justify-center p-2.5 rounded-lg border border-border bg-background/50 shadow-sm">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-muted-foreground font-semibold">Top RPN (Before):</span>
          <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-xs">{record.topRpnBefore} Critical</span>
        </div>
        <div className="flex justify-between items-center text-[10px] mt-1 pt-1 border-t border-border/40">
          <span className="text-muted-foreground font-semibold">Top RPN (After):</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">{record.topRpnAfter} Medium</span>
        </div>
      </div>
    </div>
  );
};
