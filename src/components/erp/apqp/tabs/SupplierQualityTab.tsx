import React from "react";
import { Users, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ApqpRecord } from "@/services/types";

interface SupplierQualityTabProps {
  record: ApqpRecord;
}

export const SupplierQualityTab: React.FC<SupplierQualityTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Supplier Quality Management & PPAP Approval
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitors approved component suppliers, incoming quality control plans, supplier audit scores, and PPAP level 3 compliance.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800">
          <span className="text-xs text-muted-foreground font-semibold">Supplier Quality Score:</span>
          <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400">
            {record.supplierQualityScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" /> Supplier APQP & PPAP Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Approved Primary Supplier</span>
              <span className="font-bold text-foreground">{record.approvedSupplier}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Supplier APQP Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {record.supplierApqpStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Supplier PPAP Level</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                Level 3 ({record.supplierPpapStatus})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Supplier Audit Score</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {record.supplierAuditScore} / 100
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Incoming Quality & Risk Controls
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground block text-[10px]">Incoming Quality Plan</span>
              <span className="font-semibold text-primary font-mono">{record.incomingQualityPlanFile}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Supplier Quality Risk Assessment</span>
              <p className="text-foreground mt-0.5 leading-relaxed">
                {record.supplierRisks}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
