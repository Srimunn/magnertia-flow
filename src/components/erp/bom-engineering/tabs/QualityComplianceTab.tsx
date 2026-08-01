import React from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, Download } from "lucide-react";
import type { BomEngineeringRecord } from "@/services/types";

interface QualityComplianceTabProps {
  record: BomEngineeringRecord;
}

export const QualityComplianceTab: React.FC<QualityComplianceTabProps> = ({
  record,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Quality Management & Compliance Framework
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Governs critical safety components, inspection rules, regulatory compliance (ISO/IEC/RoHS), and full serial traceability.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800">
          <span className="text-xs text-muted-foreground font-semibold">Quality Score:</span>
          <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
            {record.qualityReadinessScore}% Good
          </span>
        </div>
      </div>

      {/* Critical Components & Traceability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Critical Safety Components
            </h3>
            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
              {record.criticalComponents.length} Critical Items
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {record.criticalComponents.map((comp, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-muted border border-border font-mono font-bold text-foreground"
              >
                {comp}
              </span>
            ))}
          </div>

          <div className="pt-2 border-t border-border mt-3">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Traceability Mandate</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Serial & Batch Level Traceability Required
            </span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-500" /> Inspection & Verification Rules
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {record.inspectionRequirement}
          </p>
        </div>
      </div>

      {/* Compliance Checklist Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/20">
          <h3 className="text-xs font-bold text-foreground">Regulatory Standards Compliance Audit</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Standard / Regulation</th>
                <th className="py-2.5 px-3">Audit Details & Proof</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {record.complianceChecklist.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-bold text-foreground">
                    {item.standard}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">
                    {item.details}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
