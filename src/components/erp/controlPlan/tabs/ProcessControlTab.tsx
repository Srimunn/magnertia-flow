import React from "react";
import { Factory, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ControlPlanRecord } from "@/services/types";

interface ProcessControlTabProps {
  record: ControlPlanRecord;
}

export const ProcessControlTab: React.FC<ProcessControlTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Stage 3 - Process Control & Poka-Yoke Error Proofing Validation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Validates shop floor digital work instructions, standard operating procedures (SOPs), automated error proofing (Poka-Yoke), and preventive maintenance schedules.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800">
          <span className="text-xs text-muted-foreground font-semibold">Process Control Score:</span>
          <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
            {record.processControlScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Standard Work & Instructions</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Work Instruction Ref</span>
              <span className="font-mono font-bold text-primary">{record.workInstructionRef}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SOP Reference</span>
              <span className="font-mono font-bold text-primary">{record.sopRef}</span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Poka-Yoke & Control Devices</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Control Device / Equipment</span>
              <span className="font-bold text-foreground">{record.controlDevice}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Error Proofing (Poka-Yoke)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Validated
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Maintenance & Validation</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Preventive Maintenance</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Process Validation Status</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                Validated
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
