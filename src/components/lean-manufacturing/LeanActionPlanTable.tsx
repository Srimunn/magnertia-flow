import React from "react";
import { Plus, Trash2, User, AlertCircle } from "lucide-react";
import type { ActionPlanRow, ActionPlanStatusType } from "@/lib/lean-manufacturing/types";
import { formatIndianCurrency } from "@/lib/lean-manufacturing/scoring";

interface LeanActionPlanTableProps {
  actionPlan: ActionPlanRow[];
  expectedCostSaving: number;
  onUpdateRow: (index: number, updated: ActionPlanRow) => void;
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  onCostSavingChange: (saving: number) => void;
}

export const LeanActionPlanTable: React.FC<LeanActionPlanTableProps> = ({
  actionPlan,
  expectedCostSaving,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  onCostSavingChange,
}) => {
  const getStatusBadgeClass = (status: ActionPlanStatusType) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
      case "In Progress":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300";
      case "Required — Revision":
        return "bg-rose-50 text-rose-900 border-rose-500 dark:bg-rose-950 dark:text-rose-200 font-black";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Action Plan Activities ({actionPlan.length})
        </span>
        <button
          onClick={onAddRow}
          className="px-3 py-1 bg-primary text-primary-foreground font-semibold text-xs rounded-md shadow flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Activity
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
            <tr>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">Lean Tool</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card">
            {actionPlan.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={`hover:bg-muted/30 transition-colors ${
                  row.isRevisionRequired ? "bg-rose-50/50 dark:bg-rose-950/20 border-l-4 border-l-rose-500" : ""
                }`}
              >
                {/* Activity Name */}
                <td className="px-4 py-2.5">
                  <input
                    type="text"
                    value={row.activity}
                    onChange={(e) => onUpdateRow(idx, { ...row, activity: e.target.value })}
                    className="w-full bg-transparent border-none font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded p-1"
                  />
                  {row.isRevisionRequired && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-rose-600 ml-1">
                      <AlertCircle className="w-3 h-3" /> Mandatory Revision Activity
                    </span>
                  )}
                </td>

                {/* Lean Tool */}
                <td className="px-4 py-2.5">
                  <select
                    value={row.leanTool}
                    onChange={(e) => onUpdateRow(idx, { ...row, leanTool: e.target.value })}
                    className="bg-background border border-input rounded px-2 py-1 text-xs font-semibold text-foreground"
                  >
                    <option value="5S">5S</option>
                    <option value="SMED">SMED</option>
                    <option value="Kaizen">Kaizen</option>
                    <option value="Kanban">Kanban</option>
                    <option value="TPM">TPM</option>
                    <option value="Poka-Yoke">Poka-Yoke</option>
                    <option value="Standard Work">Standard Work</option>
                    <option value="VSM">VSM</option>
                    <option value="JIT">JIT</option>
                    <option value="Jidoka">Jidoka</option>
                    <option value="Heijunka">Heijunka</option>
                    <option value="Other">Other</option>
                  </select>
                </td>

                {/* Owner */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={row.owner}
                      onChange={(e) => onUpdateRow(idx, { ...row, owner: e.target.value })}
                      className="w-32 bg-transparent border-none font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded p-1"
                    />
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-2.5">
                  <select
                    value={row.status}
                    onChange={(e) =>
                      onUpdateRow(idx, { ...row, status: e.target.value as ActionPlanStatusType })
                    }
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border cursor-pointer ${getStatusBadgeClass(
                      row.status
                    )}`}
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    {row.isRevisionRequired && <option value="Required — Revision">Required — Revision</option>}
                  </select>
                </td>

                {/* Due Date */}
                <td className="px-4 py-2.5">
                  <input
                    type="text"
                    value={row.dueDate}
                    onChange={(e) => onUpdateRow(idx, { ...row, dueDate: e.target.value })}
                    className="w-28 bg-transparent border-none font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded p-1"
                  />
                </td>

                {/* Action Column */}
                <td className="px-4 py-2.5 text-right">
                  <button
                    disabled={row.isRevisionRequired && row.status !== "Completed"}
                    onClick={() => onDeleteRow(idx)}
                    className="p-1 text-muted-foreground hover:text-rose-600 rounded disabled:opacity-30 transition-colors"
                    title={row.isRevisionRequired ? "Mandatory revision row cannot be deleted until Completed" : "Delete Row"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">Expected Cost Saving:</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={expectedCostSaving}
              onChange={(e) => onCostSavingChange(parseFloat(e.target.value) || 0)}
              className="w-36 px-2.5 py-1 bg-background border border-input rounded text-xs font-extrabold text-emerald-600 focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              ({formatIndianCurrency(expectedCostSaving)})
            </span>
          </div>
        </div>

        <div className="text-xs font-bold text-muted-foreground">
          Total Activities:{" "}
          <span className="text-foreground font-extrabold">
            {actionPlan.length.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
};
