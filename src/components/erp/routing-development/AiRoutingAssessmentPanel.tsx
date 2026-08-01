import React from "react";
import { Sparkles, AlertTriangle, TrendingDown, RefreshCw, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import type { RoutingAiAssessment } from "@/services/types";

interface AiRoutingAssessmentPanelProps {
  aiAssessment: RoutingAiAssessment;
  onViewAnalysis?: () => void;
}

export const AiRoutingAssessmentPanel: React.FC<AiRoutingAssessmentPanelProps> = ({
  aiAssessment,
  onViewAnalysis,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <h2 className="font-bold text-foreground text-xs">7. AI Routing Assessment</h2>
          </div>
          <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
            <span className="text-[9px] text-muted-foreground font-semibold">AI Health Score</span>
            <span className="text-xs font-black text-purple-600 dark:text-purple-400">
              {aiAssessment.healthScore} / 100
            </span>
          </div>
        </div>

        <div className="space-y-2 text-[11px]">
          {/* AI Routing Optimization */}
          <div className="flex items-start gap-2 p-1.5 rounded bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">AI Routing Optimization</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.routingOptimization}
              </p>
            </div>
          </div>

          {/* AI Bottleneck Prediction */}
          <div className="flex items-start gap-2 p-1.5 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">AI Bottleneck Prediction</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.bottleneckPrediction}
              </p>
            </div>
          </div>

          {/* AI Cycle Time Optimization */}
          <div className="flex items-start gap-2 p-1.5 rounded bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/40">
            <TrendingDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">AI Cycle Time Optimization</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.cycleTimeOptimization}
              </p>
            </div>
          </div>

          {/* AI Resource Optimization */}
          <div className="flex items-start gap-2 p-1.5 rounded bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/40">
            <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">AI Resource Optimization</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.resourceOptimization}
              </p>
            </div>
          </div>

          {/* AI Production Recommendation */}
          <div className="flex items-start gap-2 p-1.5 rounded bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">AI Production Recommendation</div>
              <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                {aiAssessment.productionRecommendation}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onViewAnalysis}
        className="mt-2 w-full py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center justify-center gap-1 transition-colors border border-purple-200 dark:border-purple-800 rounded bg-purple-50/40 dark:bg-purple-950/30"
      >
        View Full AI Analysis <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
