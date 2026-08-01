import React from "react";
import { Wrench, CheckCircle2 } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface ResourceAllocationCardProps {
  record: RoutingRecord;
}

export const ResourceAllocationCard: React.FC<ResourceAllocationCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h3 className="font-bold text-foreground text-xs">3. Resource Allocation</h3>
          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
            {record.resourceReadinessScore} / 100
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Required Machines</span>
            <span className="font-bold text-foreground">{record.requiredMachinesCount} Machines</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Required Tools</span>
            <span className="font-bold text-foreground">{record.requiredToolsCount} Tools</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Required Fixtures</span>
            <span className="font-bold text-foreground">{record.requiredFixturesCount} Fixtures</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Required Jigs</span>
            <span className="font-bold text-foreground">{record.requiredJigsCount} Jigs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Operator Skill Level</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
              {record.operatorSkillLevel}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Capacity Requirement</span>
            <span className="font-bold text-foreground">{record.capacityRequirementUnitsPerDay} Units/Day</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Resource Availability</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Available
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border mt-2 flex justify-between items-center">
        <span className="font-semibold text-muted-foreground text-[10px]">Resource Readiness Score</span>
        <span className="font-extrabold text-blue-600 dark:text-blue-400">{record.resourceReadinessScore} / 100</span>
      </div>
    </div>
  );
};
