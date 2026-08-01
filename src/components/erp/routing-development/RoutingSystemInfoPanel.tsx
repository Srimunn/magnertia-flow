import React from "react";
import { Database, ArrowRight } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface RoutingSystemInfoPanelProps {
  record: RoutingRecord;
  onNavigateTab?: (tab: string) => void;
}

export const RoutingSystemInfoPanel: React.FC<RoutingSystemInfoPanelProps> = ({
  record,
  onNavigateTab,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-xs space-y-2">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-primary" />
          <h2 className="font-bold text-foreground text-xs">11. System Information</h2>
        </div>
      </div>

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Created By</span>
          <span className="font-semibold text-foreground">{record.createdBy}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Created Date</span>
          <span className="font-medium text-foreground">{record.createdDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Last Modified By</span>
          <span className="font-semibold text-foreground">{record.lastModifiedBy}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Last Modified Date</span>
          <span className="font-medium text-foreground">{record.lastModifiedDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Workflow Stage</span>
          <span className="font-bold text-primary">{record.workflowStage}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Version</span>
          <span className="font-bold text-foreground">v{record.routingVersion}</span>
        </div>
      </div>

      <button
        onClick={() => onNavigateTab?.("history")}
        className="mt-2 w-full py-0.5 text-[10px] font-semibold text-primary hover:underline flex items-center justify-center gap-0.5"
      >
        View Activity History <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
