import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { BeforeAfterMetric } from "@/lib/lean-manufacturing/types";

interface LeanBeforeAfterTableProps {
  metrics: BeforeAfterMetric[];
  score: number;
}

export const LeanBeforeAfterTable: React.FC<LeanBeforeAfterTableProps> = ({ metrics, score }) => {
  const renderImprovementCell = (m: BeforeAfterMetric) => {
    const isHigherBetter = m.polarity === "higher_is_better";
    const delta = m.improvementPct;
    const isGood = isHigherBetter ? delta > 0 : delta < 0;

    const arrow = delta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />;
    const colorClass = isGood
      ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200"
      : "text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200";

    const formattedDelta = delta > 0 ? `+${delta.toFixed(2)}%` : `${delta.toFixed(2)}%`;

    return (
      <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded border ${colorClass}`}>
        {formattedDelta} {arrow}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
            <tr>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3">Before (Baseline)</th>
              <th className="px-4 py-3">After (Improved)</th>
              <th className="px-4 py-3 text-right">Improvement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card">
            {metrics.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-foreground">{row.metric}</td>
                <td className="px-4 py-3 font-medium text-muted-foreground">
                  {row.before !== null && row.before !== undefined ? row.before : "–"}
                </td>
                <td className="px-4 py-3 font-bold text-foreground">{row.after}</td>
                <td className="px-4 py-3 text-right">{renderImprovementCell(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 border-t border-border flex justify-end">
        <span className="text-xs font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded border border-blue-200">
          Operational Score: {score}/100
        </span>
      </div>
    </div>
  );
};
