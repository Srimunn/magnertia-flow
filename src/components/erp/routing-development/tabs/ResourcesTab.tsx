import React from "react";
import { Wrench, CheckCircle2, Factory, ShieldCheck, Gauge } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface ResourcesTabProps {
  record: RoutingRecord;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Manufacturing Resource Allocation Matrix
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Governs assigned machines, specialized tooling, holding fixtures, alignment jigs, and operator skill level certification.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-xs text-muted-foreground font-semibold">Resource Readiness:</span>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {record.resourceReadinessScore} / 100
          </span>
        </div>
      </div>

      {/* Grid of Resource Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Required Machines */}
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <Factory className="w-4 h-4 text-blue-500" /> Assigned Machines ({record.requiredMachines.length})
          </h3>
          <ul className="space-y-1.5">
            {record.requiredMachines.map((m, idx) => (
              <li key={idx} className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Required Tools */}
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" /> Tooling ({record.requiredToolsCount})
          </h3>
          <ul className="space-y-1.5">
            {record.requiredTools.map((t, idx) => (
              <li key={idx} className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Required Fixtures */}
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-500" /> Fixtures ({record.requiredFixturesCount})
          </h3>
          <ul className="space-y-1.5">
            {record.requiredFixtures.map((f, idx) => (
              <li key={idx} className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Required Jigs */}
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-500" /> Calibration Jigs ({record.requiredJigsCount})
          </h3>
          <ul className="space-y-1.5">
            {record.requiredJigs.map((j, idx) => (
              <li key={idx} className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {j}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
