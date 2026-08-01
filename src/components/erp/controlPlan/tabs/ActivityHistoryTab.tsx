import React from "react";
import { History, Database } from "lucide-react";
import type { ControlPlanRecord } from "@/services/types";

interface ActivityHistoryTabProps {
  record: ControlPlanRecord;
}

export const ActivityHistoryTab: React.FC<ActivityHistoryTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border space-y-3">
        <h2 className="text-sm font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" /> System Information & Audit Governance (MAICW System Log)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Created By</span>
            <span className="font-bold text-foreground">{record.createdBy}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Created Date</span>
            <span className="font-semibold text-foreground">{record.createdDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Last Modified By</span>
            <span className="font-bold text-foreground">{record.lastModifiedBy}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Last Modified Date</span>
            <span className="font-semibold text-foreground">{record.lastModifiedDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Workflow Stage</span>
            <span className="font-bold text-primary">{record.workflowStage}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Control Plan Version</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">v{record.version}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <History className="w-4 h-4 text-purple-500" /> Lifecycle Audit Log & Stage Execution History
          </h3>
          <span className="text-[10px] text-muted-foreground font-mono">
            {record.auditTrail.length} Logged Events
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-3 min-w-[140px]">Timestamp</th>
              <th className="py-2.5 px-3 min-w-[120px]">User / System</th>
              <th className="py-2.5 px-3 min-w-[160px]">Action</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right min-w-[160px]">Control Plan Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {record.auditTrail.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30">
                <td className="py-2.5 px-3 font-mono text-muted-foreground">{log.timestamp}</td>
                <td className="py-2.5 px-3 font-bold text-foreground">{log.user}</td>
                <td className="py-2.5 px-3 font-semibold text-primary">{log.action}</td>
                <td className="py-2.5 px-3 text-muted-foreground">{log.description}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted border border-border">
                    {log.stage || "System Sync"}
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
