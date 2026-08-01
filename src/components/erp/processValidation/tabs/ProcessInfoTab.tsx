import React from "react";
import { Factory } from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";

interface ProcessInfoTabProps {
  record: ProcessValidationRecord;
}

export const ProcessInfoTab: React.FC<ProcessInfoTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Manufacturing Process & Equipment Parameters
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-references process flow diagrams, routing definitions, work centres, tooling jigs, and standard work instructions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Process Flow Ref</span>
          <span className="font-mono font-bold text-primary block text-sm">{record.processFlowRef}</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Routing Reference</span>
          <span className="font-mono font-bold text-primary block text-sm">{record.routingRef}</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Work Centre</span>
          <span className="font-mono font-bold text-foreground block text-sm">{record.workCentre}</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Machine / Equipment</span>
          <span className="font-bold text-foreground block text-sm">{record.machineEquipment}</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Tooling Reference</span>
          <span className="font-mono font-bold text-foreground block text-sm">{record.toolingRef}</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Work Instruction</span>
          <span className="font-mono font-bold text-primary block text-sm">{record.workInstructionRef}</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">SOP Reference</span>
          <span className="font-mono font-bold text-primary block text-sm">{record.sopRef}</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Process Step</span>
          <span className="font-bold text-foreground block text-sm">{record.processStep}</span>
        </div>
      </div>
    </div>
  );
};
