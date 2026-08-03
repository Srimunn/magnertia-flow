import React from "react";
import { Sparkles, TrendingUp, ShieldCheck, Wrench, Eye, Zap } from "lucide-react";

interface RoboticsAiInsightsCardProps {
  onJumpToAiSection?: () => void;
}

export const RoboticsAiInsightsCard: React.FC<RoboticsAiInsightsCardProps> = ({
  onJumpToAiSection,
}) => {
  return (
    <div className="bg-card text-card-foreground border border-purple-500/30 rounded-lg p-4 shadow-sm space-y-3 bg-gradient-to-br from-purple-500/5 via-card to-card">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            AI Robotics Insights
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
            <p className="text-[11px] text-muted-foreground">AI recommends path smoothing to reduce cycle time by 12%.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Collision Risk</span>
            <p className="text-[11px] text-muted-foreground">No collision risk detected in current path.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Wrench className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Predictive Maintenance</span>
            <p className="text-[11px] text-muted-foreground">Joint 2 bearing may require replacement in 24 days.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Eye className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Vision System</span>
            <p className="text-[11px] text-muted-foreground">Vision accuracy is 98.7%, defects detection improved by 16%.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-foreground block">Energy Optimization</span>
            <p className="text-[11px] text-muted-foreground">AI suggests optimizing idle time, saving 8.4% energy.</p>
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
