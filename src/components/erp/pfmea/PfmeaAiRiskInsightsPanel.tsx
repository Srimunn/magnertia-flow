import React from "react";
import { Sparkles, AlertTriangle, TrendingDown, RefreshCw, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import type { PfmeaAiAssessment } from "@/services/types";

interface PfmeaAiRiskInsightsPanelProps {
  aiAssessment: PfmeaAiAssessment;
  onViewAnalysis?: () => void;
}

export const PfmeaAiRiskInsightsPanel: React.FC<PfmeaAiRiskInsightsPanelProps> = ({
  aiAssessment,
  onViewAnalysis,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="font-bold text-foreground text-xs">AI Risk Insights</h2>
          </div>
          <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
            <span className="text-[9px] text-muted-foreground font-semibold">AI PFMEA Health Score</span>
            <span className="text-xs font-black text-purple-600 dark:text-purple-400">
              {aiAssessment.healthScore} / 100
            </span>
          </div>
        </div>

        <div className="space-y-2.5 text-[11px]">
          {/* High Risk Detected */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-900 dark:text-rose-200">High Risk Detected</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.failurePrediction}
              </p>
            </div>
          </div>

          {/* Top Risk Area */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900 dark:text-amber-200">Top Risk Area</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.riskPatternAnalysis}
              </p>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-blue-900 dark:text-blue-200">AI Recommendation</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.correctiveActionSuggestions}
              </p>
            </div>
          </div>

          {/* Risk Trend */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200">Risk Trend</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.preventiveRecommendations}
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
