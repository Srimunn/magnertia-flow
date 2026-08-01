import React from "react";
import { Factory, CheckCircle2, FileText, Download } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface ManufacturingValidationTabProps {
  record: RoutingRecord;
}

export const ManufacturingValidationTab: React.FC<ManufacturingValidationTabProps> = ({
  record,
}) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Manufacturing Process & Documentation Validation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-references Engineering BOMs, Work Instructions, SOP documents, and Inspection Plans.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800">
          <span className="text-xs text-muted-foreground font-semibold">Validation Score:</span>
          <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400">
            {record.manufacturingReadinessScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Reference Documents</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">BOM Reference</span>
              <span className="font-bold font-mono text-primary">{record.bomReference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Work Instruction Ref</span>
              <span className="font-bold font-mono text-foreground">{record.workInstructionRef}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SOP Document Ref</span>
              <span className="font-bold font-mono text-foreground">{record.sopRef}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Inspection Plan Ref</span>
              <span className="font-bold font-mono text-foreground">{record.inspectionPlanRef}</span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Pilot Run & Line Clearance</h3>
          <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Line Trial & Process Audit Validated
          </div>
          <p className="text-muted-foreground leading-relaxed mt-2">
            {record.validationNotes}
          </p>
        </div>
      </div>
    </div>
  );
};
