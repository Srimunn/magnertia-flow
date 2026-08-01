import React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  RefreshCw,
  Zap,
  ArrowRight,
} from "lucide-react";
import type { BomAiInsights } from "@/services/types";

interface BomAiInsightsPanelProps {
  aiInsights: BomAiInsights;
  onViewAnalysis?: () => void;
}

export const BomAiInsightsPanel: React.FC<BomAiInsightsPanelProps> = ({
  aiInsights,
  onViewAnalysis,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <h2 className="font-bold text-foreground text-xs">AI BOM Insights</h2>
          </div>
          <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
            <span className="text-[9px] text-muted-foreground font-semibold">AI Score</span>
            <span className="text-xs font-black text-purple-600 dark:text-purple-400">
              {aiInsights.healthScore} / 100
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {/* Duplicate Detection */}
          <div className="flex items-start gap-2 p-1.5 rounded bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground text-[11px]">Duplicate Detection</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiInsights.duplicateDetection}
              </p>
            </div>
          </div>

          {/* Cost Optimization */}
          <div className="flex items-start gap-2 p-1.5 rounded bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/40">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground text-[11px]">Cost Optimization</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiInsights.costOptimization}
              </p>
            </div>
          </div>

          {/* Alternate Components */}
          <div className="flex items-start gap-2 p-1.5 rounded bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground text-[11px]">Alternate Components</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiInsights.alternateRecommendation}
              </p>
            </div>
          </div>

          {/* Supply Risk Prediction */}
          <div className="flex items-start gap-2 p-1.5 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground text-[11px]">Supply Risk Prediction</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiInsights.supplyRiskPrediction}
              </p>
            </div>
          </div>

          {/* Design Improvement */}
          <div className="flex items-start gap-2 p-1.5 rounded bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/40">
            <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground text-[11px]">Design Improvement</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiInsights.designImprovement}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onViewAnalysis}
        className="mt-2.5 w-full py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center justify-center gap-1 transition-colors border border-purple-200 dark:border-purple-800 rounded bg-purple-50/40 dark:bg-purple-950/30"
      >
        View AI Analysis <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
