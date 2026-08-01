import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CapacityFormInput } from "@/services/types";

export function CapacityPerformanceSection({
  form,
}: {
  form: UseFormReturn<CapacityFormInput>;
}) {
  const { register, watch } = form;

  const perfScore = watch("performanceScore") ?? 84;

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              6
            </span>
            <CardTitle className="text-base font-bold">Production Performance Metrics</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Overall equipment effectiveness, line efficiency, delivery performance & manufacturing cost per unit.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400 block tracking-wider">
              Performance Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">
                {perfScore}
              </span>
              <span className="text-xs text-amber-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Line Efficiency */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Line Efficiency (%)</label>
            <Input
              type="number"
              {...register("lineEfficiency", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Delivery Performance */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Delivery Performance (%)</label>
            <Input
              type="number"
              {...register("deliveryPerformance", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Cost Per Unit */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Manufacturing Cost / Unit (₹)</label>
            <Input
              type="number"
              {...register("costPerUnit", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* OEE Percentage */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Overall OEE (%)</label>
            <Input
              type="number"
              {...register("oeePercentage", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
