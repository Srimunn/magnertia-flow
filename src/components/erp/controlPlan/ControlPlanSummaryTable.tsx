import React from "react";
import { ArrowRight } from "lucide-react";
import type { ControlPlanSummaryRow } from "@/services/types";

interface ControlPlanSummaryTableProps {
  summaryRows: ControlPlanSummaryRow[];
  onViewFullControlPlan?: () => void;
}

export const ControlPlanSummaryTable: React.FC<ControlPlanSummaryTableProps> = ({
  summaryRows,
  onViewFullControlPlan,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden text-xs">
      <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center">
        <h2 className="text-sm font-bold text-foreground">
          7. Process Control Plan (Summary Table)
        </h2>
        <button
          onClick={onViewFullControlPlan}
          className="font-bold text-primary hover:underline flex items-center gap-1 text-xs"
        >
          View Full Control Plan <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-2 w-10 text-center">Step No.</th>
              <th className="py-2.5 px-3 min-w-[90px]">Operation</th>
              <th className="py-2.5 px-3 min-w-[140px]">Characteristic</th>
              <th className="py-2.5 px-3 min-w-[140px]">Specification</th>
              <th className="py-2.5 px-3 min-w-[140px]">Control Method</th>
              <th className="py-2.5 px-3 min-w-[140px]">Inspection Method</th>
              <th className="py-2.5 px-3 min-w-[110px]">Frequency</th>
              <th className="py-2.5 px-2 text-center min-w-[80px]">Sample Size</th>
              <th className="py-2.5 px-3 min-w-[140px]">Control Device / Equipment</th>
              <th className="py-2.5 px-3 min-w-[160px]">Response Plan</th>
              <th className="py-2.5 px-3 min-w-[120px]">Responsible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {summaryRows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-2 text-center font-bold text-muted-foreground">{row.stepNo}</td>
                <td className="py-2.5 px-3 font-bold font-mono text-primary">{row.operationNo}</td>
                <td className="py-2.5 px-3 font-bold text-foreground">{row.characteristic}</td>
                <td className="py-2.5 px-3 font-mono text-foreground">{row.specification}</td>
                <td className="py-2.5 px-3 text-muted-foreground">{row.controlMethod}</td>
                <td className="py-2.5 px-3 text-muted-foreground">{row.inspectionMethod}</td>
                <td className="py-2.5 px-3 font-medium text-foreground">{row.frequency}</td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-foreground">{row.sampleSize}</td>
                <td className="py-2.5 px-3 text-foreground font-semibold">{row.controlDevice}</td>
                <td className="py-2.5 px-3 text-amber-700 dark:text-amber-300 font-medium text-[11px]">{row.responsePlan}</td>
                <td className="py-2.5 px-3 text-foreground font-medium">{row.responsible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
