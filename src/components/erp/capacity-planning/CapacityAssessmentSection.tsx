import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CapacityFormInput } from "@/services/types";

export function CapacityAssessmentSection({
  form,
}: {
  form: UseFormReturn<CapacityFormInput>;
}) {
  const { register, watch } = form;

  const assessmentScore = watch("assessmentScore") ?? 88;

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <CardTitle className="text-base font-bold">Capacity Assessment & Operating Parameters</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Available machine/labor operating hours, line unit capacity, workstation throughput limits & equipment loading index.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400 block tracking-wider">
              Assessment Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 font-mono">
                {assessmentScore}
              </span>
              <span className="text-xs text-blue-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Available Machine Hours */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Available Machine Hours (hrs/month)</label>
            <Input
              type="number"
              {...register("availableMachineHours", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Available Labour Hours */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Available Labour Hours (hrs/month)</label>
            <Input
              type="number"
              {...register("availableLabourHours", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Production Line Capacity */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Production Line Capacity (units/year)</label>
            <Input
              type="number"
              {...register("productionLineCapacity", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Workstation Capacity */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Workstation Capacity (units/year)</label>
            <Input
              type="number"
              {...register("workstationCapacity", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Equipment Utilization */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Equipment Utilization (%)</label>
            <Input
              type="number"
              {...register("equipmentUtilization", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
