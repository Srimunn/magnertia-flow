import React from "react";
import { ListTodo, CheckCircle2, Clock } from "lucide-react";
import type { PfmeaRecord } from "@/services/types";

interface RecommendedActionsTabProps {
  record: PfmeaRecord;
}

export const RecommendedActionsTab: React.FC<RecommendedActionsTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Stage 3 - Recommended Corrective & Preventive Action Plan
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assigns action owners, target completion dates, tracks execution status, and verifies post-action RPN reduction.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs text-muted-foreground font-semibold">Top RPN (After Action):</span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {record.topRpnAfter}
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-3 min-w-[220px]">Recommended Action</th>
              <th className="py-2.5 px-3 min-w-[140px]">Responsible Person</th>
              <th className="py-2.5 px-3 min-w-[110px]">Target Date</th>
              <th className="py-2.5 px-3 text-center min-w-[100px]">Action Status</th>
              <th className="py-2.5 px-2 text-center w-12">Rev S</th>
              <th className="py-2.5 px-2 text-center w-12">Rev O</th>
              <th className="py-2.5 px-2 text-center w-12">Rev D</th>
              <th className="py-2.5 px-3 text-center font-bold text-emerald-600">Revised RPN</th>
              <th className="py-2.5 px-3 text-center min-w-[120px]">Effectiveness Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {record.recommendedActions.map((act) => (
              <tr key={act.id} className="hover:bg-muted/30">
                <td className="py-2.5 px-3 font-bold text-foreground">{act.action}</td>
                <td className="py-2.5 px-3 text-foreground font-medium">{act.responsible}</td>
                <td className="py-2.5 px-3 text-muted-foreground font-mono">{act.targetDate}</td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      act.status === "In Progress"
                        ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300"
                    }`}
                  >
                    {act.status === "In Progress" ? <Clock className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {act.status}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-600">6</td>
                <td className="py-2.5 px-2 text-center font-mono font-medium">2</td>
                <td className="py-2.5 px-2 text-center font-mono font-medium">2</td>
                <td className="py-2.5 px-3 text-center font-mono font-extrabold text-emerald-600 text-sm">
                  {act.rpnAfter}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
