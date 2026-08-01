import React from "react";
import { Factory, CheckCircle2 } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface ManufacturingValidationCardProps {
  record: RoutingRecord;
}

export const ManufacturingValidationCard: React.FC<ManufacturingValidationCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h3 className="font-bold text-foreground text-xs">4. Manufacturing Validation</h3>
          <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold text-[10px]">
            {record.manufacturingReadinessScore} / 100
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">BOM Reference</span>
            <span className="font-bold font-mono text-primary">{record.bomReference}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Work Instruction Ref</span>
            <span className="font-semibold text-foreground">{record.workInstructionRef}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">SOP Reference</span>
            <span className="font-semibold text-foreground">{record.sopRef}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Inspection Plan</span>
            <span className="font-semibold text-foreground">{record.inspectionPlanRef}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Process Validation</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Validated
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Validation Notes</span>
            <span className="font-medium text-foreground text-[10px] truncate block" title={record.validationNotes}>
              {record.validationNotes}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border mt-2 flex justify-between items-center">
        <span className="font-semibold text-muted-foreground text-[10px]">Manufacturing Readiness Score</span>
        <span className="font-extrabold text-orange-600 dark:text-orange-400">{record.manufacturingReadinessScore} / 100</span>
      </div>
    </div>
  );
};
