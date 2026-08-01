import React from "react";
import { CheckSquare, CheckCircle2 } from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";

interface EquipmentReadinessTabProps {
  record: ProcessValidationRecord;
}

export const EquipmentReadinessTab: React.FC<EquipmentReadinessTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Equipment & Production Readiness Qualification
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verifies machine qualification, tool qualification, preventive maintenance, operator certification, and industrial safety audits.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs text-muted-foreground font-semibold">Production Readiness Score:</span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {record.productionReadinessScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Machine & Tooling Qualifications</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Machine Qualification</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                {record.machineQualification}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tool Qualification</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                {record.toolQualification}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Preventive Maintenance Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Operator Qualification & Training</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Operator Qualification</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                {record.operatorQualification}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Operator Training Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Safety & Ergonomics Audit</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Industrial Safety Audit</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Workstation Ergonomics</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
