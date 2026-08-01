import React from "react";
import { Plus, GitCommit, CheckCircle2, Clock, AlertTriangle, Users } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface OperationsTabProps {
  record: RoutingRecord;
  onAddOperation: () => void;
}

export const OperationsTab: React.FC<OperationsTabProps> = ({
  record,
  onAddOperation,
}) => {
  return (
    <div className="space-y-4 text-xs">
      {/* Header Banner */}
      <div className="bg-card p-4 rounded-lg border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Manufacturing Operation Sequencing & Line Balancing
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Defines the complete step-by-step production routing sequence, setup times, machine cycle times, and operator allocations.
          </p>
        </div>
        <button
          onClick={onAddOperation}
          className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded shadow flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Operation
        </button>
      </div>

      {/* Operations List Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">Seq</th>
                <th className="py-2.5 px-3 min-w-[90px]">Op No.</th>
                <th className="py-2.5 px-3 min-w-[180px]">Operation Name</th>
                <th className="py-2.5 px-3 min-w-[100px]">Work Centre</th>
                <th className="py-2.5 px-3 min-w-[150px]">Machine</th>
                <th className="py-2.5 px-3 text-center">Setup (min)</th>
                <th className="py-2.5 px-3 text-center">Cycle (min)</th>
                <th className="py-2.5 px-3 text-center">Labour</th>
                <th className="py-2.5 px-3">Description & Special Rules</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {record.operations.map((op) => (
                <tr key={op.id} className="hover:bg-muted/30">
                  <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">{op.seq}</td>
                  <td className="py-2.5 px-3 font-bold font-mono text-foreground">{op.operationNo}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground">{op.operationName}</td>
                  <td className="py-2.5 px-3 font-medium text-foreground">{op.workCentre}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{op.machine}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium">{op.setupTimeMins}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-foreground">{op.cycleTimeMins.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">{op.labourCount}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-[11px]">
                    {op.description}
                    {op.criticalOp && (
                      <span className="inline-block ml-2 px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[9px] font-bold">
                        Critical Gate
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
