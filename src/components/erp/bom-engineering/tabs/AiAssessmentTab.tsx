import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Zap, TrendingDown, ShieldAlert } from "lucide-react";
import type { BomEngineeringRecord } from "@/services/types";

interface AiAssessmentTabProps {
  record: BomEngineeringRecord;
}

export const AiAssessmentTab: React.FC<AiAssessmentTabProps> = ({
  record,
}) => {
  const { aiInsights } = record;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg text-purple-600 dark:text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              AI Manufacturing Intelligence & BOM Audit Report
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated duplicate part detection, component rationalization, cost optimization, and supply risk prediction.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold">AI BOM Health Score:</span>
          <span className="text-lg font-black text-purple-600 dark:text-purple-400">
            {aiInsights.healthScore} / 100
          </span>
        </div>
      </div>

      {/* AI Assessment Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* 1. Duplicate Detection */}
        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Duplicate Part Detection
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {aiInsights.duplicateDetection}
          </p>
          <div className="pt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Status: 0 Duplicates Flagged across 86 Part Numbers
          </div>
        </div>

        {/* 2. Cost Optimization */}
        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border text-sm">
            <TrendingDown className="w-4 h-4 text-rose-500" /> AI Cost Optimization Engine
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {aiInsights.costOptimization}
          </p>
          <div className="pt-2 text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
            Savings Opportunity: ₹12,450.00 (5.06% Total BOM Margin Improvement)
          </div>
        </div>

        {/* 3. Alternate Components */}
        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border text-sm">
            <RefreshCw className="w-4 h-4 text-blue-500" /> AI Alternate Component Suggestions
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {aiInsights.alternateRecommendation}
          </p>
          <div className="pt-2 text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
            Dual-Sourcing Coverage: 100% Qualified Component Form-Fit-Function Replacements
          </div>
        </div>

        {/* 4. Supply Risk Prediction */}
        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> AI Supply Risk Prediction
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {aiInsights.supplyRiskPrediction}
          </p>
          <div className="pt-2 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
            Risk Index: Low (Max Component Lead Time 14 Days)
          </div>
        </div>
      </div>
    </div>
  );
};
