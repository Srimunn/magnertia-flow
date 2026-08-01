import React from "react";
import { Factory, Wrench, FileText, Download, CheckCircle2, FileCheck } from "lucide-react";
import type { BomEngineeringRecord } from "@/services/types";

interface ManufacturingReadinessTabProps {
  record: BomEngineeringRecord;
}

export const ManufacturingReadinessTab: React.FC<ManufacturingReadinessTabProps> = ({
  record,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Card */}
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Manufacturing Readiness & Assembly Planning
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Validates manufacturing processes, tooling availability, assembly sequence diagrams, and work instructions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800">
          <span className="text-xs text-muted-foreground font-semibold">Readiness Score:</span>
          <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400">
            {record.manufacturingReadinessScore}% Excellent
          </span>
        </div>
      </div>

      {/* Main Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <Factory className="w-4 h-4 text-orange-500" /> Manufacturing Process & Strategy
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Primary Process</span>
            <span className="text-sm font-extrabold text-foreground">{record.manufacturingProcess}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Make / Buy Decision</span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              {record.makeBuyDecision}
            </span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <FileText className="w-4 h-4 text-blue-500" /> Work Instructions & Documentation
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Work Instruction Reference</span>
            <span className="font-bold text-primary font-mono">{record.workInstructionRef}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Assembly Sequence File</span>
            <div className="flex items-center gap-2 mt-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-foreground">{record.assemblySequenceFile}</span>
              <button className="p-1 hover:bg-muted rounded text-primary">
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <Wrench className="w-4 h-4 text-purple-500" /> Tooling & Equipment Requirements
          </div>
          <div className="space-y-1">
            {record.toolingRequirements.map((tool, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="font-medium text-foreground">{tool}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manufacturing Notes Card */}
      <div className="bg-card p-4 rounded-lg border border-border text-xs">
        <h3 className="font-bold text-foreground pb-2 border-b border-border mb-2">
          Manufacturing Operations & Cleanroom Notes
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {record.manufacturingNotes}
        </p>
      </div>
    </div>
  );
};
