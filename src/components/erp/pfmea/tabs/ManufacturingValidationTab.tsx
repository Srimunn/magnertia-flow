import React from "react";
import { Factory, CheckCircle2, ShieldCheck } from "lucide-react";
import type { PfmeaRecord } from "@/services/types";

interface ManufacturingValidationTabProps {
  record: PfmeaRecord;
}

export const ManufacturingValidationTab: React.FC<ManufacturingValidationTabProps> = ({
  record,
}) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Manufacturing Validation, Process Capability & MSA Studies
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-checks pilot production trial runs, process capability studies (Cp / Cpk), measurement system analysis (Gage R&R), and Control Plan alignment.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-xs text-muted-foreground font-semibold">Validation Score:</span>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {record.validationScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Process & Pilot Validation</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Process Validation Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Validated
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pilot Production Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed (50 Units)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Capability Study (Cp / Cpk)</h3>
          <div className="text-center py-2">
            <span className="text-3xl font-black font-mono text-primary">{record.capacityCpk}</span>
            <span className="text-xs text-muted-foreground block font-semibold mt-1">Cpk Score (Six Sigma Compliant &gt; 1.33)</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">MSA & Control Plan References</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">MSA Reference</span>
              <span className="font-bold text-primary font-mono">{record.msaRef}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Control Plan Ref</span>
              <span className="font-bold text-primary font-mono">{record.controlPlanRef}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border space-y-2">
        <h3 className="font-bold text-foreground pb-2 border-b border-border">Validation Notes & Engineering Observations</h3>
        <p className="text-muted-foreground leading-relaxed">
          {record.validationNotes}
        </p>
      </div>
    </div>
  );
};
