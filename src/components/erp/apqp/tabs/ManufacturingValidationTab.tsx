import React from "react";
import { Factory, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ApqpRecord } from "@/services/types";

interface ManufacturingValidationTabProps {
  record: ApqpRecord;
}

export const ManufacturingValidationTab: React.FC<ManufacturingValidationTabProps> = ({
  record,
}) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Product & Process Validation (PPAP & Process Capability)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Evaluates prototype builds, pilot trial runs, Gage R&R MSA studies, Cp/Cpk process capability, and PPAP level submissions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-xs text-muted-foreground font-semibold">Validation Score:</span>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {record.validationReadinessScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Build Statuses</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Prototype Build</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pilot Build</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed (50 Units)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Production Trial Run</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Process Capability (Cp / Cpk)</h3>
          <div className="text-center py-2">
            <span className="text-3xl font-black font-mono text-primary">{record.processCapabilityCpk}</span>
            <span className="text-xs text-muted-foreground block font-semibold mt-1">Cpk Score (Six Sigma Compliant &gt; 1.33)</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">PPAP & Measurement Systems</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">MSA Status (Gage R&R)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Passed (&lt; 10% GR&R)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">PPAP Submission Status</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                {record.ppapStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
