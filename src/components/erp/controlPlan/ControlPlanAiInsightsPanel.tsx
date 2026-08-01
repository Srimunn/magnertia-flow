import React from "react";
import { Sparkles, ShieldCheck, TrendingDown, Zap, ArrowRight, AlertTriangle } from "lucide-react";
import type { ControlPlanAiAssessment } from "@/services/types";

interface ControlPlanAiInsightsPanelProps {
  aiAssessment: ControlPlanAiAssessment;
  onViewAnalysis?: () => void;
}

export const ControlPlanAiInsightsPanel: React.FC<ControlPlanAiInsightsPanelProps> = ({
  aiAssessment,
  onViewAnalysis,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="font-bold text-foreground text-xs">AI Control Insights</h2>
          </div>
          <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
            <span className="text-[9px] text-muted-foreground font-semibold">AI Health Score</span>
            <span className="text-xs font-black text-purple-600 dark:text-purple-400">
              {aiAssessment.healthScore} / 100
            </span>
          </div>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex items-start gap-2 p-1.5 rounded bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">AI Risk Prediction</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.riskPrediction}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-1.5 rounded bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/40">
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">AI Process Optimization</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.processOptimization}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-1.5 rounded bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/40">
            <TrendingDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">AI Inspection Optimization</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.inspectionOptimization}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-1.5 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">AI Defect Prediction</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.defectPrediction}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-1.5 rounded bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/40">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">AI Preventive Recommendation</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.preventiveRecommendation}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onViewAnalysis}
        className="mt-3 w-full py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center justify-center gap-1 transition-colors border border-purple-200 dark:border-purple-800 rounded bg-purple-50/40 dark:bg-purple-950/30"
      >
        View Full AI Analysis <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
