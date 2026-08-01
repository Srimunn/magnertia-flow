import React from "react";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  ListOrdered,
  CheckCircle2,
  Clock,
  Wrench,
  Users,
} from "lucide-react";
import type { RoutingOperation } from "@/services/types";

interface OperationRoutingTableProps {
  operations: RoutingOperation[];
  onAddOperation?: () => void;
}

export const OperationRoutingTable: React.FC<OperationRoutingTableProps> = ({
  operations,
  onAddOperation,
}) => {
  const totalSetup = operations.reduce((acc, curr) => acc + curr.setupTimeMins, 0);
  const totalCycle = operations.reduce((acc, curr) => acc + curr.cycleTimeMins, 0);
  const totalLabour = operations.reduce((acc, curr) => acc + curr.labourCount, 0);

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden text-xs">
      {/* Header Toolbar matching image 2 */}
      <div className="p-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground">
            2. Operation Routing
          </h2>
          <span className="text-xs text-muted-foreground font-normal">
            (Total {operations.length} Operations)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onAddOperation}
            className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Operation
          </button>

          <button className="px-2.5 py-1 border border-input bg-background hover:bg-accent text-xs font-medium rounded shadow-sm">
            Insert
          </button>
          <button className="px-2.5 py-1 border border-input bg-background hover:bg-accent text-xs font-medium rounded shadow-sm text-rose-600 dark:text-rose-400">
            Delete
          </button>

          <div className="flex items-center gap-1 border-l border-border pl-1.5 ml-1">
            <button className="p-1 border border-input bg-background hover:bg-accent rounded text-muted-foreground">
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 border border-input bg-background hover:bg-accent rounded text-muted-foreground">
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button className="px-2 py-1 border border-input bg-background hover:bg-accent rounded text-xs font-medium text-muted-foreground">
              Reorder
            </button>
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2 px-2 w-8 text-center">#</th>
              <th className="py-2 px-2.5 w-12 text-center">Seq.</th>
              <th className="py-2 px-3 min-w-[90px]">Operation No.</th>
              <th className="py-2 px-3 min-w-[200px]">Operation Name</th>
              <th className="py-2 px-3 min-w-[100px]">Work Centre</th>
              <th className="py-2 px-3 min-w-[150px]">Machine</th>
              <th className="py-2 px-3 text-center whitespace-nowrap">Setup Time (min)</th>
              <th className="py-2 px-3 text-center whitespace-nowrap">Cycle Time (min)</th>
              <th className="py-2 px-3 text-center w-16">Labour</th>
              <th className="py-2 px-3 text-center w-20">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {operations.map((op, idx) => (
              <tr key={op.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2 px-2 text-center text-muted-foreground">
                  <ListOrdered className="w-3 h-3 mx-auto text-muted-foreground/60" />
                </td>
                <td className="py-2 px-2.5 text-center font-bold text-muted-foreground">
                  {op.seq}
                </td>
                <td className="py-2 px-3 font-bold font-mono text-foreground">
                  {op.operationNo}
                </td>
                <td className="py-2 px-3">
                  <div className="font-semibold text-foreground">{op.operationName}</div>
                  {op.criticalOp && (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      Critical Operation
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 font-medium text-foreground">
                  {op.workCentre}
                </td>
                <td className="py-2 px-3 text-muted-foreground">
                  {op.machine}
                </td>
                <td className="py-2 px-3 text-center font-mono font-medium text-foreground">
                  {op.setupTimeMins}
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-foreground">
                  {op.cycleTimeMins.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-foreground">
                  {op.labourCount}
                </td>
                <td className="py-2 px-3 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer Totals */}
      <div className="p-3 bg-muted/40 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs font-bold gap-3">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-muted-foreground font-normal">Total Setup Time: </span>
            <span className="font-mono text-foreground">{totalSetup} min</span>
          </div>
          <div>
            <span className="text-muted-foreground font-normal">Total Cycle Time: </span>
            <span className="font-mono text-primary">{totalCycle.toFixed(1)} min</span>
          </div>
          <div>
            <span className="text-muted-foreground font-normal">Total Labour: </span>
            <span className="font-mono text-foreground">{totalLabour}</span>
          </div>
        </div>

        <span className="text-[10px] text-muted-foreground font-normal">
          Showing 1 - {operations.length} of {operations.length} operations
        </span>
      </div>
    </div>
  );
};
