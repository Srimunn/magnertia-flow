import React from "react";
import type { ProcessValidationRecord } from "@/services/types";

interface ProcessValidationSystemInfoCardProps {
  record: ProcessValidationRecord;
}

export const ProcessValidationSystemInfoCard: React.FC<ProcessValidationSystemInfoCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs">
      <h2 className="font-bold text-foreground text-xs pb-2 border-b border-border mb-2.5">
        11. System Information
      </h2>

      <div className="space-y-2 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Created By</span>
          <span className="font-bold text-foreground">{record.createdBy}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Created Date</span>
          <span className="font-mono text-muted-foreground text-[10px]">{record.createdDate}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Last Modified By</span>
          <span className="font-bold text-foreground">{record.lastModifiedBy}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Last Modified Date</span>
          <span className="font-mono text-muted-foreground text-[10px]">{record.lastModifiedDate}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Workflow Stage</span>
          <span className="font-bold text-primary">{record.workflowStage}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Version</span>
          <span className="font-mono font-bold text-foreground">{record.version}</span>
        </div>
      </div>
    </div>
  );
};
