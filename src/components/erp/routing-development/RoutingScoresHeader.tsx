import React from "react";
import type { RoutingRecord } from "@/services/types";

interface RoutingScoresHeaderProps {
  record: RoutingRecord;
}

export const RoutingScoresHeader: React.FC<RoutingScoresHeaderProps> = ({ record }) => {
  const scores = [
    {
      label: "Routing Readiness",
      score: record.routingReadinessScore,
      status: record.routingReadinessScore >= 90 ? "Excellent" : "Good",
      color: "#059669", // Dark Emerald
    },
    {
      label: "Resource Readiness",
      score: record.resourceReadinessScore,
      status: record.resourceReadinessScore >= 90 ? "Excellent" : "Good",
      color: "#3b82f6", // Blue
    },
    {
      label: "Manufacturing Readiness",
      score: record.manufacturingReadinessScore,
      status: record.manufacturingReadinessScore >= 90 ? "Excellent" : "Good",
      color: "#f97316", // Orange
    },
    {
      label: "Quality Score",
      score: record.qualityScore,
      status: record.qualityScore >= 90 ? "Excellent" : "Good",
      color: "#8b5cf6", // Purple
    },
    {
      label: "Cost Score",
      score: record.costScore,
      status: record.costScore >= 90 ? "Excellent" : "Good",
      color: "#14b8a6", // Teal
    },
    {
      label: "Overall Routing Readiness",
      score: record.overallReadinessScore,
      status: record.overallReadinessScore >= 90 ? "Excellent" : "Good",
      color: "#10b981", // Emerald
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-card border-b border-border">
      {scores.map((item, idx) => {
        const radius = 22;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (item.score / 100) * circumference;

        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-background/50 shadow-sm hover:shadow transition-all"
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
    </div>
  );
};
