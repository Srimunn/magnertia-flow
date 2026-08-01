import React from "react";
import { Sparkles, AlertTriangle, ShieldCheck, TrendingDown, Zap } from "lucide-react";
import type { PfmeaRecord } from "@/services/types";

interface AiRiskAssessmentTabProps {
  record: PfmeaRecord;
}

export const AiRiskAssessmentTab: React.FC<AiRiskAssessmentTabProps> = ({ record }) => {
  const { aiAssessment } = record;

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg text-purple-600 dark:text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              AI Risk Assessment & Predictive Failure Analytics
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated failure mode prediction, process risk pattern analysis, corrective action recommendations, and health score calculations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold">AI PFMEA Health Score:</span>
          <span className="text-lg font-black text-purple-600 dark:text-purple-400">
            {aiAssessment.healthScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> AI Failure Prediction
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {aiAssessment.failurePrediction}
          </p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border text-sm">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> AI Risk Pattern Analysis
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {aiAssessment.riskPatternAnalysis}
          </p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border text-sm">
            <Zap className="w-4 h-4 text-blue-500" /> AI Corrective Action Suggestions
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {aiAssessment.correctiveActionSuggestions}
          </p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border text-sm">
            <TrendingDown className="w-4 h-4 text-emerald-500" /> AI Process Optimization & Preventive Recommendations
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {aiAssessment.processOptimization} {aiAssessment.preventiveRecommendations}
          </p>
        </div>
      </div>
    </div>
  );
};
