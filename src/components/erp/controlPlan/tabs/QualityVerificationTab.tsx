import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import type { ControlPlanRecord } from "@/services/types";

interface QualityVerificationTabProps {
  record: ControlPlanRecord;
}

export const QualityVerificationTab: React.FC<QualityVerificationTabProps> = ({
  record,
}) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Quality Verification, SPC Capability & PPAP Submission
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitors incoming, in-process, and final inspection checkpoints, Control Plan audit readiness, Cp / Cpk capability, and PPAP level 3 documentation.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-950 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800">
          <span className="text-xs text-muted-foreground font-semibold">Validation Score:</span>
          <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
            {record.validationScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Inspection Checkpoints</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Incoming Quality Control (IQC)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">In-Process Quality Control (IPQC)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Final Quality Control (FQC)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Process Capability (Cp / Cpk)</h3>
          <div className="text-center py-2">
            <span className="text-3xl font-black font-mono text-primary">{record.processCapabilityCpk}</span>
            <span className="text-xs text-muted-foreground block font-semibold mt-1">Cpk Target Score (&gt; 1.33 Compliant)</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Audit & PPAP Cross-References</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Control Plan Audit</span>
              <span className="font-bold text-foreground">{record.controlPlanAudit}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">PPAP Reference</span>
              <span className="font-bold text-primary font-mono">{record.ppapRef}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
