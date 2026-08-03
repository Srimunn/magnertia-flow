import React from "react";
import { Sparkles, ShieldCheck, AlertTriangle, TrendingUp, DollarSign, Lightbulb } from "lucide-react";

interface LeanAiInsightsCardProps {
  onJumpToAiSection?: () => void;
}

export const LeanAiInsightsCard: React.FC<LeanAiInsightsCardProps> = ({
  onJumpToAiSection,
}) => {
  return (
    <div className="bg-card text-card-foreground border border-purple-500/30 rounded-lg p-4 shadow-sm space-y-3 bg-gradient-to-br from-purple-500/5 via-card to-card">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            AI Lean Insights
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
            <span className="font-bold text-foreground block">Waste Detection</span>
            <p className="text-[11px] text-muted-foreground">Waiting and setup waste contributing ₹4.2 Lakhs loss.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Bottleneck Alert</span>
            <p className="text-[11px] text-muted-foreground">Setup Station-02 causing 32% delay.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Productivity Forecast</span>
            <p className="text-[11px] text-muted-foreground">Improvement of 18% expected in next 60 days.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <DollarSign className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Cost Saving Opportunity</span>
            <p className="text-[11px] text-muted-foreground">₹12.45 Lakhs annual saving potential.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Optimization Suggestion</span>
            <p className="text-[11px] text-muted-foreground">Implement SMED + Kanban + 5S to maximize OEE.</p>
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
