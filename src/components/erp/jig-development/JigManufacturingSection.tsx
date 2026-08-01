import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Factory, Settings, Cpu, ShieldCheck } from "lucide-react";
import type { JigFormInput } from "@/services/types";

export function JigManufacturingSection({
  form,
}: {
  form: UseFormReturn<JigFormInput>;
}) {
  const { register, watch, setValue } = form;

  const manufacturingScore = watch("manufacturingReadinessScore") ?? 85;

  const machinesAvailable = ["CNC VMC 1", "CNC VMC 2", "Grinding M/C", "EDM WireCut", "Precision CMM"];
  const selectedMachines = watch("machineAllocation") || ["CNC VMC 1", "CNC VMC 2"];

  const toggleMachine = (m: string) => {
    if (selectedMachines.includes(m)) {
      setValue("machineAllocation", selectedMachines.filter((x) => x !== m));
    } else {
      setValue("machineAllocation", [...selectedMachines, m]);
    }
  };

  const surfaceTreatmentOptions = [
    "Ground",
    "Hard Chrome",
    "Nitrided",
    "Black Oxide",
    "Anodized",
    "Powder Coated",
    "Polished",
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <CardTitle className="text-base font-bold">Jig Manufacturing</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Machining process, CNC programming, machine allocation, heat treatment & surface coating.
          </CardDescription>
        </div>

        {/* Score Card Badge */}
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">
              Manufacturing Readiness Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                {manufacturingScore}
              </span>
              <span className="text-xs text-emerald-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Manufacturing Process */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Manufacturing Process</label>
            <Input
              {...register("manufacturingProcess")}
              placeholder="e.g. CNC Milling & Drilling"
              className="h-9 text-xs"
            />
          </div>

          {/* CNC Program */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">CNC Program Code</label>
            <Input
              {...register("cncProgram")}
              placeholder="e.g. ev_drl_jig.nc"
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Lead Time */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Manufacturing Lead Time (Days)</label>
            <Input
              type="number"
              {...register("manufacturingLeadTime", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Surface Treatment */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Surface Treatment</label>
            <Select
              value={watch("surfaceTreatment") || "Black Oxide"}
              onValueChange={(val) => setValue("surfaceTreatment", val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select Treatment" />
              </SelectTrigger>
              <SelectContent>
                {surfaceTreatmentOptions.map((st) => (
                  <SelectItem key={st} value={st} className="text-xs">
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Material Requirement */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Material Requirement</label>
            <Input
              {...register("materialRequirements")}
              placeholder="e.g. AISI 1045, EN24"
              className="h-9 text-xs"
            />
          </div>

          {/* Heat Treatment Checkbox */}
          <div className="space-y-1 flex flex-col justify-center">
            <label className="font-semibold text-foreground mb-1">Heat Treatment</label>
            <div className="flex items-center gap-2 h-9 px-3 border border-border rounded-md bg-slate-50 dark:bg-slate-800/50">
              <Checkbox
                id="heatTreatment"
                checked={watch("heatTreatment") ?? true}
                onCheckedChange={(val) => setValue("heatTreatment", Boolean(val))}
              />
              <label htmlFor="heatTreatment" className="text-xs font-medium cursor-pointer">
                Hardened & Tempered (58-62 HRC)
              </label>
            </div>
          </div>

          {/* Machine Allocation Multi-select Pills */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
            <label className="font-semibold text-foreground block">Machine Allocation</label>
            <div className="flex flex-wrap items-center gap-2">
              {machinesAvailable.map((m) => {
                const isSelected = selectedMachines.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMachine(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {m}
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
