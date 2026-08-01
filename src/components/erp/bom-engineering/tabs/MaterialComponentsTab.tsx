import React from "react";
import { Boxes, ShieldCheck, CheckCircle2, Factory, Clock, DollarSign } from "lucide-react";
import type { BomEngineeringRecord } from "@/services/types";

interface MaterialComponentsTabProps {
  record: BomEngineeringRecord;
}

export const MaterialComponentsTab: React.FC<MaterialComponentsTabProps> = ({
  record,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Material & Component Specification Matrix
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Governs material grades, specification standards, qualified manufacturers, vendor lists, and RoHS/REACH compliance status.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-xs text-muted-foreground font-semibold">Availability Score:</span>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {record.materialAvailabilityScore}% Good
          </span>
        </div>
      </div>

      {/* Main Material Master Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <Boxes className="w-4 h-4 text-primary" /> Primary Material Grade
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Material Grade</span>
            <span className="text-sm font-extrabold text-foreground">{record.materialGrade}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Specification Standard</span>
            <span className="font-semibold text-foreground">{record.materialSpecification}</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <Factory className="w-4 h-4 text-blue-500" /> Sourcing & Manufacturer
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">OEM Manufacturer</span>
            <span className="text-sm font-extrabold text-foreground">{record.manufacturer}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Approved Vendor</span>
            <span className="font-semibold text-foreground">{record.approvedVendor}</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Lead Time & Compliance
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Maximum Lead Time</span>
            <span className="text-sm font-extrabold text-foreground">{record.leadTimeDays} Days</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">RoHS / REACH Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Fully Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Component Detailed Material Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/20">
          <h3 className="text-xs font-bold text-foreground">Component Level Material Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Part Number</th>
                <th className="py-2.5 px-3">Material Grade</th>
                <th className="py-2.5 px-3">Specification</th>
                <th className="py-2.5 px-3">Manufacturer</th>
                <th className="py-2.5 px-3">Approved Vendor</th>
                <th className="py-2.5 px-3 text-center">RoHS/REACH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {record.items
                .filter((item) => item.materialGrade)
                .map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-bold font-mono text-foreground">
                      {item.partNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-foreground">
                      {item.materialGrade}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {item.materialSpecification}
                    </td>
                    <td className="py-2.5 px-3 text-foreground font-medium">
                      {item.manufacturer}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {item.approvedVendor}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Compliant
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
