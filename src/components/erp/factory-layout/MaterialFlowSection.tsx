import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText, Truck, Route } from "lucide-react";
import type { FactoryLayoutFormInput } from "@/services/types";
import { toast } from "sonner";

export function MaterialFlowSection({
  form,
}: {
  form: UseFormReturn<FactoryLayoutFormInput>;
}) {
  const { watch, setValue } = form;

  const logisticsScore = watch("logisticsScore") ?? 85;

  const handlingEquipmentOptions = [
    "Forklift",
    "AGV",
    "AMR",
    "Overhead Crane",
    "Conveyor",
    "Pallet Truck",
    "Gantry Crane",
    "Robotic Material Handler",
  ];
  const selectedEq = watch("materialHandlingEq") || ["Forklift", "AGV", "Conveyor", "Overhead Crane"];

  const toggleEq = (item: string) => {
    if (selectedEq.includes(item)) {
      setValue("materialHandlingEq", selectedEq.filter((x) => x !== item));
    } else {
      setValue("materialHandlingEq", [...selectedEq, item]);
    }
  };

  const logisticsDocs = [
    { label: "Raw Material Flow", filename: "raw_material_flow_v1.2.pdf", size: "3.2 MB" },
    { label: "WIP Flow", filename: "wip_flow_v1.2.pdf", size: "2.8 MB" },
    { label: "Finished Goods Flow", filename: "fg_flow_v1.2.pdf", size: "2.4 MB" },
    { label: "Forklift Routes", filename: "forklift_routes_v1.2.pdf", size: "1.9 MB" },
    { label: "AGV/AMR Routes", filename: "agv_routes_v1.2.pdf", size: "2.1 MB" },
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <CardTitle className="text-base font-bold">Material Flow & Logistics Architecture</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Inbound raw material routing, WIP transport, AGV/AMR autonomous paths & material handling equipment.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-purple-600 dark:text-purple-400 block tracking-wider">
              Logistics Efficiency Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                {logisticsScore}
              </span>
              <span className="text-xs text-purple-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border border-border/80 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
            <div className="col-span-4">Flow Diagram / Route</div>
            <div className="col-span-5">Attached Schematic</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="divide-y divide-border/60 text-xs">
            {logisticsDocs.map((doc, idx) => (
              <div
                key={doc.label}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-white dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="col-span-4 font-semibold text-foreground flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[10px]">{idx + 1}.</span>
                  {doc.label}
                </div>

                <div className="col-span-5 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600 shrink-0" />
                  <span className="font-mono text-xs truncate text-primary font-medium cursor-pointer hover:underline">
                    {doc.filename}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {doc.size}
                  </Badge>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] gap-1 hover:text-primary"
                    onClick={() => toast.info(`Previewing ${doc.filename}`)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] gap-1 hover:text-purple-600"
                    onClick={() => toast.success(`Downloading ${doc.filename}`)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Material Handling Equipment Multi-select Pills */}
        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground block">Material Handling Equipment</label>
          <div className="flex flex-wrap items-center gap-2">
            {handlingEquipmentOptions.map((eq) => {
              const isSelected = selectedEq.includes(eq);
              return (
                <button
                  key={eq}
                  type="button"
                  onClick={() => toggleEq(eq)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "}
                  {eq}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
