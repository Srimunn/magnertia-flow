import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Play, RefreshCw, CheckCircle2 } from "lucide-react";
import type { CapacityFormInput } from "@/services/types";
import { capacitySimulationService } from "@/services/capacitySimulationService";
import { toast } from "sonner";

export function CapacitySimulationSection({
  form,
}: {
  form: UseFormReturn<CapacityFormInput>;
}) {
  const { watch, setValue } = form;

  const [isRunning, setIsRunning] = useState(false);
  const simScore = watch("simulationScore") ?? 86;

  const handleRunSim = async () => {
    setIsRunning(true);
    toast.info("Executing Digital Twin Capacity Simulation...");
    try {
      const res = await capacitySimulationService.runCapacitySimulation(
        watch("planningId") || "CP-2024-00027",
        watch("activeScenario") || "Peak Demand (Q3)"
      );
      setValue("simulationScore", res.simulationScore);
      toast.success("Capacity Simulation completed successfully!");
    } catch (err) {
      toast.error("Simulation failed");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              5
            </span>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              Digital Twin Capacity Simulation
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Simulate peak demand scenarios, line loading surges & equipment expansion requirements.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-teal-600 dark:text-teal-400 block tracking-wider">
              Simulation Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                {simScore}
              </span>
              <span className="text-xs text-teal-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <span className="font-bold text-foreground block text-sm">Simulation Parameters</span>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Scenario Selection</label>
              <Select
                value={watch("activeScenario") || "Peak Demand (Q3)"}
                onValueChange={(val) => setValue("activeScenario", val)}
              >
                <SelectTrigger className="h-9 text-xs font-semibold bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Scenario" />
                </SelectTrigger>
                <SelectContent>
                  {["Peak Demand (Q3)", "Base Case (100% Demand)", "Stress Test (150% Loading)"].map((s) => (
                    <SelectItem key={s} value={s} className="text-xs font-medium">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="digitalTwinEnabled"
                checked={watch("digitalTwinEnabled") ?? true}
                onCheckedChange={(val) => setValue("digitalTwinEnabled", Boolean(val))}
              />
              <label htmlFor="digitalTwinEnabled" className="font-medium cursor-pointer">
                Connect Digital Twin Real-Time Feeds ✓
              </label>
            </div>

            <Button
              size="sm"
              onClick={handleRunSim}
              disabled={isRunning}
              className="w-full gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold shadow-xs"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Running Simulation...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Run Scenario Simulation
                </>
              )}
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
            <div>
              <span className="font-bold text-foreground block text-sm mb-1">
                Latest Simulation Result
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Scenario: <span className="font-bold text-foreground">{watch("activeScenario")}</span>
              </p>

              <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Simulation Passed
                  </span>
                  <Badge className="bg-emerald-600 text-white text-[10px]">Score {simScore}/100</Badge>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Expansion Requirement: Recommended (+1 Testing Rig at WS-70 to absorb surge).
                </p>
              </div>
            </div>

            <span className="text-[10px] text-muted-foreground italic text-right block">
              Last run on 18 Jun 2024
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
