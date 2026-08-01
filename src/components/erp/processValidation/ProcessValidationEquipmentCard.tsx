import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";

interface ProcessValidationEquipmentCardProps {
  record: ProcessValidationRecord;
  onViewDetails?: () => void;
}

export const ProcessValidationEquipmentCard: React.FC<ProcessValidationEquipmentCardProps> = ({
  record,
  onViewDetails,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">
            Equipment & Production Readiness
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground block text-[10px]">Machine Qualification</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                {record.machineQualification}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Tool Qualification</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                {record.toolQualification}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Preventive Maintenance Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground block text-[10px]">Operator Qualification</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                {record.operatorQualification}
              </span>
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Training Status
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Safety Verification
            </div>
            <div className="pt-1">
              <span className="text-muted-foreground block text-[10px]">Production Readiness Score</span>
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{record.productionReadinessScore} / 100</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="mt-3 w-full py-1 text-[11px] font-bold text-primary hover:underline flex items-center justify-center gap-1 transition-colors border border-border rounded bg-muted/20"
      >
        View Details <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
