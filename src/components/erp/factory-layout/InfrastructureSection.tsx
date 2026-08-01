import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { FactoryLayoutFormInput } from "@/services/types";

export function InfrastructureSection({
  form,
}: {
  form: UseFormReturn<FactoryLayoutFormInput>;
}) {
  const { register, watch, setValue } = form;

  const infraScore = watch("infrastructureScore") ?? 86;

  const availableProdAreas = ["Machining", "Stamping", "Testing", "Packing", "Welding", "Painting"];
  const selectedProdAreas = watch("productionAreas") || ["Machining", "Assembly", "Testing", "Packing"];

  const toggleProdArea = (item: string) => {
    if (selectedProdAreas.includes(item)) {
      setValue("productionAreas", selectedProdAreas.filter((x) => x !== item));
    } else {
      setValue("productionAreas", [...selectedProdAreas, item]);
    }
  };

  const availableAssyAreas = ["SMT", "Panel Assembly", "Final Assembly", "Sub-Assembly"];
  const selectedAssyAreas = watch("assemblyAreas") || ["SMT", "Panel Assembly", "Final Assembly"];

  const toggleAssyArea = (item: string) => {
    if (selectedAssyAreas.includes(item)) {
      setValue("assemblyAreas", selectedAssyAreas.filter((x) => x !== item));
    } else {
      setValue("assemblyAreas", [...selectedAssyAreas, item]);
    }
  };

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <CardTitle className="text-base font-bold">Manufacturing Infrastructure</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Shop floor allocation, production zones, warehousing capacity & maintenance workshops.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">
              Infrastructure Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                {infraScore}
              </span>
              <span className="text-xs text-emerald-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Warehouse Capacity */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Warehouse Capacity (m²)</label>
            <Input
              type="number"
              {...register("warehouseCapacityM2", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Loading Bays */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Loading & Unloading Bays</label>
            <Input
              type="number"
              {...register("loadingUnloadingBays", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Maintenance Workshop Checkbox */}
          <div className="space-y-1 flex flex-col justify-center">
            <label className="font-semibold text-foreground mb-1">Maintenance Workshop</label>
            <div className="flex items-center gap-2 h-9 px-3 border border-border rounded-md bg-slate-50 dark:bg-slate-800/50">
              <Checkbox
                id="maintenanceWorkshop"
                checked={watch("maintenanceWorkshop") ?? true}
                onCheckedChange={(val) => setValue("maintenanceWorkshop", Boolean(val))}
              />
              <label htmlFor="maintenanceWorkshop" className="text-xs font-medium cursor-pointer">
                Dedicated Tool & Maintenance Bay ✓
              </label>
            </div>
          </div>

          {/* Production Areas Pills */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
            <label className="font-semibold text-foreground block">Production Areas</label>
            <div className="flex flex-wrap items-center gap-2">
              {availableProdAreas.map((p) => {
                const isSelected = selectedProdAreas.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleProdArea(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assembly Areas Pills */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
            <label className="font-semibold text-foreground block">Assembly Areas</label>
            <div className="flex flex-wrap items-center gap-2">
              {availableAssyAreas.map((a) => {
                const isSelected = selectedAssyAreas.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAssyArea(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
