import React from "react";
import {
  calculateOverallMassProductionReadiness,
  calculateRecommendation,
  getScoreBand,
} from "@/lib/mass-production-readiness/scoring";
import type { PpapStatusType } from "@/lib/mass-production-readiness/types";

interface MassProductionSummaryCardProps {
  manufacturingScore: number;
  qualityScore: number;
  supplyChainScore: number;
  operationsScore: number;
  aiReadinessScore: number;
  ppapStatus: PpapStatusType;
  overrideRecommendation?: string | null;
}

export const MassProductionSummaryCard: React.FC<MassProductionSummaryCardProps> = ({
  manufacturingScore,
  qualityScore,
  supplyChainScore,
  operationsScore,
  aiReadinessScore,
  ppapStatus,
  overrideRecommendation,
}) => {
  const overallReadiness = calculateOverallMassProductionReadiness({
    manufacturingScore,
    qualityScore,
    supplyChainScore,
    operationalScore: operationsScore,
    aiReadinessScore,
  });

  const computedRec = calculateRecommendation(overallReadiness, qualityScore, ppapStatus);
  const finalRec = overrideRecommendation || computedRec;
  const isOverridden = !!overrideRecommendation && overrideRecommendation !== computedRec;

  const band = getScoreBand(overallReadiness);

  const getRecommendationBadgeClass = (rec: string) => {
    switch (rec) {
      case "Release for Mass Production":
        return "bg-emerald-600 text-white";
      case "Minor Improvements Recommended":
        return "bg-amber-500 text-white";
      case "Additional Validation Recommended":
        return "bg-orange-600 text-white";
      case "Not Recommended for Release":
        return "bg-slate-800 text-white";
      default:
        return "bg-emerald-600 text-white";
    }
  };

  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm space-y-4">
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
        Executive Summary
      </h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Manufacturing Score</span>
          <span className="font-bold px-2 py-0.5 bg-muted rounded">{manufacturingScore}/100</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Quality Score</span>
          <span className="font-bold px-2 py-0.5 bg-muted rounded">{qualityScore}/100</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Supply Chain Score</span>
          <span className="font-bold px-2 py-0.5 bg-muted rounded">{supplyChainScore}/100</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Operations Score</span>
          <span className="font-bold px-2 py-0.5 bg-muted rounded">{operationsScore}/100</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">AI Readiness Score</span>
          <span className="font-bold px-2 py-0.5 bg-muted rounded">{aiReadinessScore}/100</span>
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-3">
        {/* Overall Mass Production Readiness */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-foreground block">Overall Mass Production Readiness</span>
            <span className="text-[10px] text-muted-foreground">Weighted Mean</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {overallReadiness}/100
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${band.colorClass}`}>
              {band.label}
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
                finalRec
              )}`}
            >
              {finalRec}
            </span>
            {isOverridden && (
              <span className="text-[10px] text-muted-foreground italic text-center">
                Computed: <line-through className="line-through">{computedRec}</line-through> (Executive Override)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
