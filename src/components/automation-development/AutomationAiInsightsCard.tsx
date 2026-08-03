import React from "react";
import { Sparkles, TrendingUp, ShieldCheck, Zap, Award, Lightbulb } from "lucide-react";

interface AutomationAiInsightsCardProps {
  onJumpToAiSection?: () => void;
}

export const AutomationAiInsightsCard: React.FC<AutomationAiInsightsCardProps> = ({
  onJumpToAiSection,
}) => {
  return (
    <div className="bg-card text-card-foreground border border-purple-500/30 rounded-lg p-4 shadow-sm space-y-3 bg-gradient-to-br from-purple-500/5 via-card to-card">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            AI Automation Insights
          </h3>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
          Live
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Cycle Time Optimization</span>
            <p className="text-[11px] text-muted-foreground">AI analysis shows potential to reduce cycle time by additional 10%.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Predictive Maintenance</span>
            <p className="text-[11px] text-muted-foreground">No critical issues predicted in next 30 days.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Energy Optimization</span>
            <p className="text-[11px] text-muted-foreground">Potential annual energy savings of ₹ 6,40,000.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Award className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Quality Improvement</span>
            <p className="text-[11px] text-muted-foreground">AI vision system accuracy 99.2%, reducing defects by 20%.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Smart Recommendation</span>
            <p className="text-[11px] text-muted-foreground">Consider adding torque monitoring for critical joints.</p>
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
