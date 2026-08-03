import React from "react";
import { Sparkles, ShieldCheck, AlertTriangle, TrendingUp, Clock, Lightbulb } from "lucide-react";

interface PilotProductionAiInsightsCardProps {
  onJumpToAiSection?: () => void;
}

export const PilotProductionAiInsightsCard: React.FC<PilotProductionAiInsightsCardProps> = ({
  onJumpToAiSection,
}) => {
  return (
    <div className="bg-card text-card-foreground border border-purple-500/30 rounded-lg p-4 shadow-sm space-y-3 bg-gradient-to-br from-purple-500/5 via-card to-card">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            AI Production Insights
          </h3>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
          Live
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Row 1 */}
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">AI Quality Prediction</span>
            <p className="text-[11px] text-muted-foreground">Defect rate is predicted to remain below 1%.</p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">AI Bottleneck Detection</span>
            <p className="text-[11px] text-muted-foreground">Welding station (WC-05) may cause delays.</p>
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">AI Productivity Analysis</span>
            <p className="text-[11px] text-muted-foreground">Cycle time can be improved by 8.2%.</p>
          </div>
        </div>

        {/* Row 4 */}
        <div className="flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">AI Downtime Analysis</span>
            <p className="text-[11px] text-muted-foreground">Planned maintenance can reduce downtime by 12%.</p>
          </div>
        </div>

        {/* Row 5 */}
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">AI Optimization Recommendation</span>
            <p className="text-[11px] text-muted-foreground">
              Balance operator allocation between WC-03 and WC-04.
            </p>
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
