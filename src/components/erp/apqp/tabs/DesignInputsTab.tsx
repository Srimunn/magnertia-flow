import React from "react";
import { FileCheck, ShieldAlert, Layers, GitCommit } from "lucide-react";
import type { ApqpRecord } from "@/services/types";

interface DesignInputsTabProps {
  record: ApqpRecord;
}

export const DesignInputsTab: React.FC<DesignInputsTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Design & Process Technical Inputs (FMEA & Control Plan Matrix)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-references DFMEA, PFMEA, Control Plan, Engineering BOM, and Manufacturing Routing.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs text-muted-foreground font-semibold">Design Readiness:</span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {record.designReadinessScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <ShieldAlert className="w-4 h-4 text-rose-500" /> DFMEA Reference
          </div>
          <span className="font-mono font-bold text-primary block text-sm">{record.dfmeaRef}</span>
          <p className="text-muted-foreground text-[11px]">Design Failure Mode & Effects Analysis Rev 2.0 with 0 high severity RPN items.</p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> PFMEA Reference
          </div>
          <span className="font-mono font-bold text-primary block text-sm">{record.pfmeaRef}</span>
          <p className="text-muted-foreground text-[11px]">Process Failure Mode & Effects Analysis covering 12 operations on Line 2.</p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <FileCheck className="w-4 h-4 text-blue-500" /> Control Plan Reference
          </div>
          <span className="font-mono font-bold text-primary block text-sm">{record.controlPlanRef}</span>
          <p className="text-muted-foreground text-[11px]">Pre-launch and mass production control plan linked to inspection gates.</p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <Layers className="w-4 h-4 text-purple-500" /> Engineering BOM
          </div>
          <span className="font-mono font-bold text-primary block text-sm">{record.bomRef}</span>
          <p className="text-muted-foreground text-[11px]">Multi-level Engineering BOM with 86 component part numbers.</p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <GitCommit className="w-4 h-4 text-teal-500" /> Manufacturing Routing
          </div>
          <span className="font-mono font-bold text-primary block text-sm">{record.routingRef}</span>
          <p className="text-muted-foreground text-[11px]">12 sequential manufacturing operations, setup times, and work centres.</p>
        </div>
      </div>
    </div>
  );
};
