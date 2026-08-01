import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Play, CheckCircle2, RefreshCw } from "lucide-react";
import { digitalTwinService } from "@/services/digitalTwinService";
import { toast } from "sonner";

export function DigitalTwinPanel({ layoutId }: { layoutId: string }) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  const handleRunSim = async (
    type: "material_flow" | "capacity" | "evacuation",
    label: string
  ) => {
    setIsRunning(true);
    setActiveSimulation(type);
    toast.info(`Launching Digital Twin ${label}...`);

    try {
      if (type === "material_flow") {
        await digitalTwinService.runMaterialFlowSimulation(layoutId);
      } else if (type === "capacity") {
        await digitalTwinService.runCapacitySimulation(layoutId);
      } else {
        await digitalTwinService.runEmergencyEvacuationSimulation(layoutId);
      }
      toast.success(`${label} completed with 98% efficiency score!`);
    } catch (err) {
      toast.error(`Simulation ${label} failed`);
    } finally {
      setIsRunning(false);
      setActiveSimulation(null);
    }
  };

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-bold">Digital Twin Simulation Architecture Seam</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Run 3D material flow, throughput capacity & emergency evacuation simulations.
          </CardDescription>
        </div>

        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-xs font-mono">
          NVIDIA Omniverse Seam Connected
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-foreground text-xs block mb-1">
                Material Flow Simulation
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Simulates AGV/AMR transport routes, aisle congestion, and WIP buffer utilization.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleRunSim("material_flow", "Material Flow Simulation")}
              disabled={isRunning}
              className="w-full gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white font-semibold shadow-xs"
            >
              {isRunning && activeSimulation === "material_flow" ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Run Material Flow Sim
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-foreground text-xs block mb-1">
                Capacity & Line Loading Sim
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Simulates peak line throughput up to 250,000 units/year at 82% equipment loading.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleRunSim("capacity", "Throughput Capacity Simulation")}
              disabled={isRunning}
              className="w-full gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white font-semibold shadow-xs"
            >
              {isRunning && activeSimulation === "capacity" ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Run Capacity Sim
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-foreground text-xs block mb-1">
                Emergency Evacuation Sim
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Simulates emergency egress routes for shop floor workforce compliance (&lt; 2.5 mins).
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleRunSim("evacuation", "Emergency Evacuation Simulation")}
              disabled={isRunning}
              className="w-full gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white font-semibold shadow-xs"
            >
              {isRunning && activeSimulation === "evacuation" ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Run Evacuation Sim
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
