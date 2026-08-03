import React from "react";
import {
  calculateOverallPilotReadiness,
  calculateRecommendation,
} from "@/lib/pilot-production/scoring";

interface PilotProductionSummaryCardProps {
  productionScore: number;
  qualityScore: number;
  performanceScore: number;
  readinessScore: number;
  aiHealthScore: number;
  overrideRecommendation?: string | null;
}

export const PilotProductionSummaryCard: React.FC<PilotProductionSummaryCardProps> = ({
  productionScore,
  qualityScore,
  performanceScore,
  readinessScore,
  aiHealthScore,
  overrideRecommendation,
}) => {
  const overallReadiness = calculateOverallPilotReadiness({
    productionScore,
    qualityScore,
    performanceScore,
    readinessScore,
    aiHealthScore,
  });

  const computedRecommendation = calculateRecommendation(
    overallReadiness,
    qualityScore,
    aiHealthScore
  );

  const finalRecommendation = overrideRecommendation || computedRecommendation;
  const isOverridden = !!overrideRecommendation && overrideRecommendation !== computedRecommendation;

  const getRecommendationBadgeClass = (rec: string) => {
    switch (rec) {
      case "Release for Mass Production":
        return "bg-emerald-600 text-white";
      case "Minor Improvements Recommended":
        return "bg-amber-500 text-white";
      case "Additional Pilot Recommended":
        return "bg-rose-600 text-white";
      case "Not Recommended for Release":
        return "bg-slate-800 text-white";
      default:
        return "bg-emerald-600 text-white";
    }
  };

  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
        Section 8 · Pilot Production Summary
      </h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Production Score</span>
          <span className="font-bold px-2 py-0.5 bg-muted rounded">{productionScore}/100</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Quality Score</span>
          <span className="font-bold px-2 py-0.5 bg-muted rounded">{qualityScore}/100</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Process Performance Score</span>
          <span className="font-bold px-2 py-0.5 bg-muted rounded">{performanceScore}/100</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Readiness Score</span>
          <span className="font-bold px-2 py-0.5 bg-muted rounded">{readinessScore}/100</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">AI Health Score</span>
          <span className="font-bold px-2 py-0.5 bg-muted rounded">{aiHealthScore}/100</span>
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-3">
        {/* Overall Pilot Readiness */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-foreground block">Overall Pilot Readiness</span>
            <span className="text-[10px] text-muted-foreground">Weighted Mean</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-blue-600 dark:text-blue-400">
              {overallReadiness}/100
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Good
            </span>
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Recommendation
          </span>
          <div className="flex flex-col gap-1">
            <span
              className={`px-3 py-1.5 rounded-md font-bold text-xs text-center shadow-sm ${getRecommendationBadgeClass(
                finalRecommendation
              )}`}
            >
              {finalRecommendation}
            </span>
            {isOverridden && (
              <span className="text-[10px] text-muted-foreground italic text-center">
                Computed: <span className="line-through">{computedRecommendation}</span> (Reviewer Override)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
