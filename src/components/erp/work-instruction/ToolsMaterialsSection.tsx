import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Layers, ShieldCheck, QrCode } from "lucide-react";
import type { WorkInstructionFormInput } from "@/services/types";

export function ToolsMaterialsSection({
  form,
}: {
  form: UseFormReturn<WorkInstructionFormInput>;
}) {
  const { watch } = form;

  const tools = watch("requiredTools") || ["Torque Screwdriver (0.5-2 Nm)", "Phillips Screwdriver", "Wire Cutter", "Multimeter"];
  const fixtures = watch("fixturesJigs") || ["PCB Assembly Jig", "Insulated Unit Enclosure"];
  const measuring = watch("measuringInstruments") || ["Digital Caliper", "Multimeter", "Torque Meter"];
  const materials = watch("materials") || ["PCB Assembly", "M3 Screws", "Power Cable Set", "First-Off Inspection Sticker"];
  const ppe = watch("ppeRequirements") || ["ESD Anti-static Wristband", "Safety Glasses", "Insulated Gloves"];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            3
          </span>
          <CardTitle className="text-base font-bold">Tools, Materials & PPE Requirements</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Calibrated tooling, fixtures, raw materials, consumable parts, barcode verification & PPE safety gear.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <span className="font-bold text-foreground block flex items-center gap-1.5 text-xs">
              <Wrench className="h-4 w-4 text-blue-600" /> Required Tools & Fixtures
            </span>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              {tools.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="font-semibold text-foreground">{t}</span>
                  <Badge variant="outline" className="text-[9px]">Calibrated ✓</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <span className="font-bold text-foreground block flex items-center gap-1.5 text-xs">
              <Layers className="h-4 w-4 text-emerald-600" /> Materials & Components
            </span>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              {materials.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="font-semibold text-foreground">{m}</span>
                  <span className="font-mono text-[10px] text-emerald-600 font-bold">In Stock</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <span className="font-bold text-foreground block flex items-center gap-1.5 text-xs">
              <ShieldCheck className="h-4 w-4 text-amber-600" /> Required PPE & Safety Gear
            </span>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              {ppe.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="font-semibold text-foreground">{p}</span>
                  <Badge className="bg-amber-500 text-white text-[9px]">Mandatory</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QrCode className="h-6 w-6 text-primary shrink-0" />
            <div>
              <span className="font-bold text-foreground block">Barcode / QR Code Tool Verification</span>
              <span className="text-[11px] text-muted-foreground">
                Operators must scan tool serial barcode before beginning Assembly Operation OP-20.
              </span>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-xs font-mono">
            Scan System Ready
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
