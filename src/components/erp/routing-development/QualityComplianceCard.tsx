import React from "react";
import { ShieldCheck, CheckCircle2, FileText } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface QualityComplianceCardProps {
  record: RoutingRecord;
}

export const QualityComplianceCard: React.FC<QualityComplianceCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h3 className="font-bold text-foreground text-xs">5. Quality & Compliance</h3>
          <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
            {record.qualityScore} / 100
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Critical Operations</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {record.criticalOperations.join(", ")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Inspection Points</span>
            <span className="font-bold text-foreground">{record.inspectionPointsCount} Points Defined</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">SPC Required</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Yes
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Traceability Required</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Yes
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Regulatory Standards</span>
            <span className="font-bold text-foreground text-[10px] truncate max-w-[120px]">
              {record.regulatoryStandards.join(", ")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Quality Checklist</span>
            <span className="font-bold text-primary flex items-center gap-1">
              <FileText className="w-3 h-3" /> {record.qualityChecklistFile}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border mt-2 flex justify-between items-center">
        <span className="font-semibold text-muted-foreground text-[10px]">Quality Score</span>
        <span className="font-extrabold text-purple-600 dark:text-purple-400">{record.qualityScore} / 100</span>
      </div>
    </div>
  );
};
