import React from "react";
import { Sparkles, ShieldCheck, AlertTriangle, TrendingUp, Cpu, Gauge } from "lucide-react";

interface MassProductionAiInsightsCardProps {
  onJumpToAiSection?: () => void;
}

export const MassProductionAiInsightsCard: React.FC<MassProductionAiInsightsCardProps> = ({
  onJumpToAiSection,
}) => {
  return (
    <div className="bg-card text-card-foreground border border-purple-500/30 rounded-lg p-4 shadow-sm space-y-3 bg-gradient-to-br from-purple-500/5 via-card to-card">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            AI Readiness Insights
          </h3>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
          Live
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">AI Production Risk</span>
            <p className="text-[11px] text-muted-foreground">Low risk. All critical parameters within control.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Gauge className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">AI Capacity Prediction</span>
            <p className="text-[11px] text-muted-foreground">Demand can be met with 15% buffer capacity.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">AI Bottleneck Prediction</span>
            <p className="text-[11px] text-muted-foreground">
              Welding station WC-05 may become a bottleneck at 92% load.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">AI Quality Prediction</span>
            <p className="text-[11px] text-muted-foreground">Defect rate expected to remain below 0.45%.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">AI Demand Forecast</span>
            <p className="text-[11px] text-muted-foreground">High demand expected in Q3-2024 (Increase 18%).</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 pt-2 text-right">
        <button
          onClick={onJumpToAiSection}
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
        >
          View Full AI Analysis →
        </button>
      </div>
    </div>
  );
};
