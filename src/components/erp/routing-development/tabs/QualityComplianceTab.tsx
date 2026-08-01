import React from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface QualityComplianceTabProps {
  record: RoutingRecord;
}

export const QualityComplianceTab: React.FC<QualityComplianceTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Quality Assurance & Statistical Process Control (SPC)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Governs critical operations, in-process quality gates, SPC requirements, and regulatory audit compliance.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800">
          <span className="text-xs text-muted-foreground font-semibold">Quality Score:</span>
          <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
            {record.qualityScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Critical Operations Audit
          </h3>
          <div className="flex flex-wrap gap-2">
            {record.criticalOperations.map((op, idx) => (
              <span key={idx} className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold font-mono rounded border border-amber-300">
                {op} (Quality Gate)
              </span>
            ))}
          </div>
          <p className="text-muted-foreground leading-relaxed mt-2">
            {record.inspectionPointsNotes}
          </p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Regulatory Standards & Checklists
          </h3>
          <div className="space-y-2">
            {record.regulatoryStandards.map((std, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="font-medium text-foreground">{std}</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
