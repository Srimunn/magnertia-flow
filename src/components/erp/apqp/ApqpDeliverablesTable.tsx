import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import type { ApqpDeliverable } from "@/services/types";

interface ApqpDeliverablesTableProps {
  deliverables: ApqpDeliverable[];
}

export const ApqpDeliverablesTable: React.FC<ApqpDeliverablesTableProps> = ({
  deliverables,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden text-xs">
      <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center">
        <h2 className="text-sm font-bold text-foreground">
          2. Phase Key Deliverables
        </h2>
        <span className="text-xs text-muted-foreground font-normal">
          ({deliverables.length} APQP Phases)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-3 min-w-[100px]">Phase</th>
              <th className="py-2.5 px-3 min-w-[220px]">Key Deliverables</th>
              <th className="py-2.5 px-3 min-w-[120px]">Owner</th>
              <th className="py-2.5 px-3 min-w-[100px]">Target Date</th>
              <th className="py-2.5 px-3 text-center min-w-[100px]">Status</th>
              <th className="py-2.5 px-3 text-center min-w-[120px]">Completion %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {deliverables.map((d) => (
              <tr key={d.phaseNumber} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-3 font-bold text-foreground">
                  Phase {d.phaseNumber}
                </td>
                <td className="py-2.5 px-3 font-semibold text-foreground">
                  {d.keyDeliverables}
                </td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                      {d.owner.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span>{d.owner}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-muted-foreground font-mono">
                  {d.targetDate}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.status === "Completed"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                        : d.status === "In Progress"
                        ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {d.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                    {d.status === "In Progress" && <Clock className="w-3 h-3" />}
                    {d.status}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          d.completionPercentage === 100
                            ? "bg-emerald-500"
                            : d.completionPercentage > 0
                            ? "bg-blue-500"
                            : "bg-muted-foreground/30"
                        }`}
                        style={{ width: `${d.completionPercentage}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-foreground text-[10px] w-8 text-right">
                      {d.completionPercentage}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
