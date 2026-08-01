import React from "react";
import { FileCheck, ArrowRight } from "lucide-react";
import type { ApqpRecord } from "@/services/types";

interface ApqpDocumentControlPanelProps {
  record: ApqpRecord;
  onViewHistory?: () => void;
}

export const ApqpDocumentControlPanel: React.FC<ApqpDocumentControlPanelProps> = ({
  record,
  onViewHistory,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-xs space-y-2">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5 text-primary" />
          <h2 className="font-bold text-foreground text-xs">Document Control</h2>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[9px] border border-blue-300">
          Controlled
        </span>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">APQP Registration</span>
          <span className="font-bold text-foreground font-mono">{record.apqpNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Version</span>
          <span className="font-bold text-foreground">v{record.version.toFixed(1)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Effective Date</span>
          <span className="font-medium text-foreground">{record.effectiveDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Next Review Date</span>
          <span className="font-medium text-foreground">{record.nextReviewDate}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-muted-foreground shrink-0">Distribution</span>
          <span className="font-medium text-foreground text-right text-[10px] truncate max-w-[130px]" title={record.distribution.join(", ")}>
            {record.distribution.join(", ")}
          </span>
        </div>
      </div>

      <button
        onClick={onViewHistory}
        className="mt-2 w-full py-0.5 text-[10px] font-semibold text-primary hover:underline flex items-center justify-center gap-0.5"
      >
        View Revision History <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
