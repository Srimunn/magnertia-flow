import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ControlPlanRecord } from "@/services/types";

interface ControlPlanAiCardProps {
  record: ControlPlanRecord;
  onViewAnalysis?: () => void;
}

export const ControlPlanAiCard: React.FC<ControlPlanAiCardProps> = ({
  record,
  onViewAnalysis,
}) => {
  const { aiAssessment } = record;

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <h2 className="font-bold text-foreground text-xs">
              6. AI Control Plan Assessment
            </h2>
          </div>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div>
            <span className="text-muted-foreground block text-[10px] font-semibold">AI Risk Prediction</span>
            <span className="font-medium text-foreground text-[10px] block">{aiAssessment.riskPrediction}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] font-semibold">AI Process Optimization</span>
            <span className="font-medium text-foreground text-[10px] block">{aiAssessment.processOptimization}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] font-semibold">AI Inspection Optimization</span>
            <span className="font-medium text-foreground text-[10px] block">{aiAssessment.inspectionOptimization}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] font-semibold">AI Defect Prediction</span>
            <span className="font-medium text-foreground text-[10px] block">{aiAssessment.defectPrediction}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] font-semibold">AI Preventive Recommendation</span>
            <span className="font-medium text-foreground text-[10px] block">{aiAssessment.preventiveRecommendation}</span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-border/40">
            <span className="text-muted-foreground font-medium">AI Control Health Score</span>
            <span className="font-extrabold text-purple-600 dark:text-purple-400">
              {aiAssessment.healthScore} / 100
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onViewAnalysis}
        className="mt-3 w-full py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center justify-center gap-1 transition-colors border border-purple-200 dark:border-purple-800 rounded bg-purple-50/40 dark:bg-purple-950/30"
      >
        View AI Analysis <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
