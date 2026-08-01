import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CapacityFormInput } from "@/services/types";

export function ResourcePlanningSection({
  form,
}: {
  form: UseFormReturn<CapacityFormInput>;
}) {
  const { register, watch } = form;

  const resourceScore = watch("resourceScore") ?? 86;

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <CardTitle className="text-base font-bold">Resource Planning & Allocation</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Machine unit allocation, workforce staffing, raw material stock, tooling readiness & utility power coverage.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">
              Resource Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                {resourceScore}
              </span>
              <span className="text-xs text-emerald-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Allocated Machines / Total */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Allocated Machines</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                {...register("allocatedMachines", { valueAsNumber: true })}
                className="h-9 text-xs font-mono"
              />
              <span className="text-slate-400 font-bold">/</span>
              <Input
                type="number"
                {...register("totalMachines", { valueAsNumber: true })}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Allocated Workforce / Total */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Allocated Workforce (Operators)</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                {...register("allocatedWorkforce", { valueAsNumber: true })}
                className="h-9 text-xs font-mono"
              />
              <span className="text-slate-400 font-bold">/</span>
              <Input
                type="number"
                {...register("totalWorkforce", { valueAsNumber: true })}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Material Availability */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Material Availability (%)</label>
            <Input
              type="number"
              {...register("materialAvailability", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Tool Availability */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Tool Availability (%)</label>
            <Input
              type="number"
              {...register("toolAvailability", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Utility Availability */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Utility Power Availability (%)</label>
            <Input
              type="number"
              {...register("utilityAvailability", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Shift Pattern */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Shift Pattern</label>
            <Input
              {...register("shiftPattern")}
              placeholder="e.g. 3 Shifts / Day (24x7)"
              className="h-9 text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
