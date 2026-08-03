import React from "react";
import {
  calculateOverallLeanReadiness,
  getRecommendationSuggestion,
} from "@/lib/lean-manufacturing/scoring";
import type { RecommendationOption } from "@/lib/lean-manufacturing/types";

interface LeanSummaryCardProps {
  wasteSeverityScore: number;
  processEfficiencyScore: number;
  operationalScore: number;
  continuousImprovementScore: number;
  aiLeanHealthScore: number;
  expectedCostSaving: number;
  realizedCostSaving?: number;
  recommendation: RecommendationOption;
  onRecommendationChange: (rec: RecommendationOption) => void;
}

export const LeanSummaryCard: React.FC<LeanSummaryCardProps> = ({
  wasteSeverityScore,
  processEfficiencyScore,
  operationalScore,
  continuousImprovementScore,
  aiLeanHealthScore,
  expectedCostSaving,
  realizedCostSaving,
  recommendation,
  onRecommendationChange,
}) => {
  const overallLeanReadiness = calculateOverallLeanReadiness({
    processEfficiencyScore,
    operationalScore,
    continuousImprovementScore,
    aiLeanHealthScore,
    wasteSeverityScore,
  });

  const computedSuggestion = getRecommendationSuggestion(
    overallLeanReadiness,
    expectedCostSaving,
    realizedCostSaving
  );

  const miniBars = [
    { label: "Waste Reduction Score", score: wasteSeverityScore, color: "bg-rose-500", inverted: true },
    { label: "Process Efficiency Score", score: processEfficiencyScore, color: "bg-emerald-500" },
    { label: "Operational Score", score: operationalScore, color: "bg-blue-500" },
    { label: "Continuous Impr. Score", score: continuousImprovementScore, color: "bg-purple-500" },
    { label: "AI Lean Score", score: aiLeanHealthScore, color: "bg-indigo-500" },
  ];

  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm space-y-4">
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
        Lean Manufacturing Summary
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
        {/* Overall Lean Readiness */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-foreground block">Overall Lean Readiness</span>
            <span className="text-[10px] text-muted-foreground">Weighted Mean (Inverted Waste)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {overallLeanReadiness}/100
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
            onChange={(e) => onRecommendationChange(e.target.value as RecommendationOption)}
            className="w-full p-2 bg-background border border-input rounded-md font-bold text-xs text-foreground focus:ring-1 focus:ring-primary"
          >
            <option value="Pending">Pending</option>
            <option value="Scale Across Lines">Scale Across Lines</option>
            <option value="Pilot Test in Another Area">Pilot Test in Another Area</option>
            <option value="Sustain Current State">Sustain Current State</option>
            <option value="Rework Project">Rework Project</option>
          </select>
          <span className="text-[10px] text-muted-foreground italic block">
            AI Suggestion: <line-through className="line-through">{computedSuggestion}</line-through> (Executive Guidance Only)
          </span>
        </div>
      </div>
    </div>
  );
};
