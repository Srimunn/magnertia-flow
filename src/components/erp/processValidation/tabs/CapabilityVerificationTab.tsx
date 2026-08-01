import React from "react";
import { BarChart2, CheckCircle2 } from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";

interface CapabilityVerificationTabProps {
  record: ProcessValidationRecord;
}

export const CapabilityVerificationTab: React.FC<CapabilityVerificationTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Process Capability Verification & SPC Control Charts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verifies statistical process capability (Cp / Cpk), process stability, control chart limits, MSA gauge R&R, and capability readiness scores.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs text-muted-foreground font-semibold">Capability Score:</span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {record.capabilityScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border text-center space-y-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Process Potential (Cp)</span>
          <span className="text-3xl font-black font-mono text-primary">{record.cp}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">Upper Specification Limit Compliant</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center space-y-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Process Capability Index (Cpk)</span>
          <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{record.cpk}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">Target Score (&gt; 1.33 Compliant)</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Process Stability & SPC</span>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Process Stability</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{record.processStability}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SPC Control Charts</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">MSA & Gauge R&R</span>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">MSA Reference</span>
              <span className="font-mono font-bold text-primary">{record.msaRef}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gauge R&R Result</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{record.gaugeRrrResult}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
