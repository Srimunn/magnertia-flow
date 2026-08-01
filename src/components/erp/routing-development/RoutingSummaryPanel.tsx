import React from "react";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface RoutingSummaryPanelProps {
  record: RoutingRecord;
}

export const RoutingSummaryPanel: React.FC<RoutingSummaryPanelProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-xs space-y-2.5">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
          <h2 className="font-bold text-foreground text-xs">8. Routing Summary</h2>
        </div>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Routing Readiness Score</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {record.routingReadinessScore} / 100
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Resource Readiness Score</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
            {record.resourceReadinessScore} / 100
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Manufacturing Readiness Score</span>
          <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
            {record.manufacturingReadinessScore} / 100
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Quality Score</span>
          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
            {record.qualityScore} / 100
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Cost Score</span>
          <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
            {record.costScore} / 100
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-t border-b border-border my-1 bg-muted/30 px-2 rounded">
          <span className="font-bold text-foreground">Overall Routing Readiness Score</span>
          <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
            {record.overallReadinessScore} / 100
          </span>
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="font-semibold text-muted-foreground">Recommendation</span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-300 dark:border-emerald-800">
            {record.recommendation}
          </span>
        </div>
      </div>
    </div>
  );
};
