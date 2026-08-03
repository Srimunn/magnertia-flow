import React from "react";
import {
  calculateOverallRoboticsReadiness,
  getRecommendationSuggestion,
} from "@/lib/robotics-integration/scoring";
import type { RoboticsRecommendationOption } from "@/lib/robotics-integration/types";

interface RoboticsSummaryCardProps {
  cellReadinessScore: number;
  integrationScore: number;
  programmingScore: number;
  validationScore: number;
  commissioningScore: number;
  aiHealthScore: number;
  recommendation: RoboticsRecommendationOption;
  onRecommendationChange: (rec: RoboticsRecommendationOption) => void;
}

export const RoboticsSummaryCard: React.FC<RoboticsSummaryCardProps> = ({
  cellReadinessScore,
  integrationScore,
  programmingScore,
  validationScore,
  commissioningScore,
  aiHealthScore,
  recommendation,
  onRecommendationChange,
}) => {
  const overallReadiness = calculateOverallRoboticsReadiness({
    cellReadinessScore,
    integrationScore,
    programmingScore,
    validationScore,
    commissioningScore,
    aiHealthScore,
  });

  const computedSuggestion = getRecommendationSuggestion(
    overallReadiness,
    validationScore,
    commissioningScore
  );

  const miniBars = [
    { label: "Integration Score", score: integrationScore, color: "bg-blue-500" },
    { label: "Programming Score", score: programmingScore, color: "bg-emerald-500" },
    { label: "Validation Score", score: validationScore, color: "bg-emerald-500" },
    { label: "Commissioning Score", score: commissioningScore, color: "bg-orange-500" },
    { label: "AI Health Score", score: aiHealthScore, color: "bg-indigo-500" },
  ];

  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm space-y-4">
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
        Robotics Project Summary
      </h3>

      {/* Mini Bar Breakdown */}
      <div className="space-y-2.5 text-xs">
        {miniBars.map((bar, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground font-semibold">{bar.label}</span>
              <span className="font-extrabold text-foreground">{bar.score}/100</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${bar.color}`}
                style={{ width: `${bar.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 space-y-3">
        {/* Overall Robotics Readiness */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-foreground block">Overall Readiness</span>
            <span className="text-[10px] text-muted-foreground">Weighted Mean</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {overallReadiness}/100
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Very Good
            </span>
          </div>
        </div>

        {/* User-Selected Recommendation Dropdown + Computed Suggestion Hint */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Recommendation (User-Selected)
          </label>
          <select
            value={recommendation}
            onChange={(e) => onRecommendationChange(e.target.value as RoboticsRecommendationOption)}
            className="w-full p-2 bg-background border border-input rounded-md font-bold text-xs text-foreground focus:ring-1 focus:ring-primary"
          >
            <option value="Pending">Pending</option>
            <option value="Approve Robotics Integration">Approve Robotics Integration</option>
            <option value="Deploy After Minor Improvements">Deploy After Minor Improvements</option>
            <option value="Redesign & Revalidate">Redesign & Revalidate</option>
            <option value="Reject Project">Reject Project</option>
          </select>
          <span className="text-[10px] text-muted-foreground italic block">
            AI Suggestion: <span className="line-through">{computedSuggestion}</span> (Executive Guidance Only)
          </span>
        </div>
      </div>
    </div>
  );
};
