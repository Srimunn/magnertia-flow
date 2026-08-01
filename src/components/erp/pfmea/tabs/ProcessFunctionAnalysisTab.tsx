import React from "react";
import { Kanban, FileCheck, Layers } from "lucide-react";
import type { PfmeaRecord } from "@/services/types";

interface ProcessFunctionAnalysisTabProps {
  record: PfmeaRecord;
}

export const ProcessFunctionAnalysisTab: React.FC<ProcessFunctionAnalysisTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Stage 1 - Process Function Analysis & Requirement Definition
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Defines process steps, process functions, engineering requirements, special characteristics (KCC/KPC), and associated SOP / Work Instructions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs text-muted-foreground font-semibold">Function Readiness Score:</span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {record.functionReadinessScore} / 100
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-3 w-16">Step No.</th>
              <th className="py-2.5 px-3 min-w-[160px]">Process Step</th>
              <th className="py-2.5 px-3 min-w-[200px]">Process Function</th>
              <th className="py-2.5 px-3 min-w-[200px]">Process Requirement</th>
              <th className="py-2.5 px-3 min-w-[140px]">Special Characteristics</th>
              <th className="py-2.5 px-3 min-w-[140px]">Related Work Instruction</th>
              <th className="py-2.5 px-3 min-w-[120px]">Related SOP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {record.failureModes.map((fm) => (
              <tr key={fm.id} className="hover:bg-muted/30">
                <td className="py-2.5 px-3 font-bold font-mono text-muted-foreground">{fm.stepNo}</td>
                <td className="py-2.5 px-3 font-bold text-foreground">{fm.processStep}</td>
                <td className="py-2.5 px-3 text-foreground">
                  Ensure accurate {fm.processStep.toLowerCase()} according to design specs.
                </td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  Zero defects, 100% compliance with ISO 9001 and IATF 16949 tolerances.
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300">
                    {fm.severity >= 8 ? "Critical (KPC)" : "Major (KCC)"}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-primary">WI-ENCL-0{fm.stepNo}</td>
                <td className="py-2.5 px-3 font-mono text-foreground">SOP-PROD-12{fm.stepNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
