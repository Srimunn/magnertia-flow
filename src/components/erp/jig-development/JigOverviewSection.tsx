import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Layers, Box, Cpu, Factory, AlertCircle } from "lucide-react";
import type { JigFormInput } from "@/services/types";

export function JigOverviewSection({
  form,
}: {
  form: UseFormReturn<JigFormInput>;
}) {
  const { register, watch, setValue, formState: { errors } } = form;

  const jigCategoryOptions = [
    "Drilling Jig",
    "Welding Jig",
    "Tapping Jig",
    "Reaming Jig",
    "Boring Jig",
    "Milling Jig",
    "Inspection Jig",
    "Assembly Jig",
    "Robotic Jig",
    "Modular Jig",
    "Special Purpose Jig",
  ];

  const manufacturingProcessOptions = [
    "CNC Milling",
    "CNC Drilling",
    "CNC Turning",
    "Grinding",
    "EDM",
    "Wire Cut EDM",
    "Heat Treatment",
    "Surface Coating",
    "Precision Assembly",
    "Calibration",
  ];

  const developmentStageOptions = [
    "Jig Concept",
    "CAD Design",
    "Manufacturing",
    "Assembly",
    "Trial Validation",
    "Installation",
    "Commissioning",
    "Production Release",
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            1
          </span>
          <CardTitle className="text-base font-bold">Jig Overview</CardTitle>
        </div>
        <CardDescription className="text-xs">
          General identity, classification, manufacturing context, and operational parameters.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Preview Asset */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80"
                alt="Jig Visual Assembly Render"
                className="w-full h-full object-cover rounded-md opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-primary/90 text-white text-[10px] font-semibold">
                  3D Render Concept
                </Badge>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center font-medium">
              Top Cover Drilling Jig Assembly — CAD v1.2
            </p>
          </div>

          {/* Right Column: Form Fields Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Jig Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Jig Name <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("jigName")}
                placeholder="e.g. EV Charger Top Cover Drilling Jig"
                className="h-9 text-xs"
              />
              {errors.jigName && (
                <span className="text-destructive text-[11px] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.jigName.message}
                </span>
              )}
            </div>

            {/* Jig Category */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Jig Category <span className="text-destructive">*</span>
              </label>
              <Select
                value={watch("jigCategory") || "Drilling Jig"}
                onValueChange={(val) => setValue("jigCategory", val as any)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {jigCategoryOptions.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Manufacturing Plant */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Manufacturing Plant <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("manufacturingPlant")}
                placeholder="e.g. Magnertia Plant - 01"
                className="h-9 text-xs"
              />
            </div>

            {/* Production Line */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Production Line <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("productionLine")}
                placeholder="e.g. EV Charger Assembly Line - A"
                className="h-9 text-xs"
              />
            </div>

            {/* Workstation */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Workstation <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("workstation")}
                placeholder="e.g. WS-12: Drilling Station"
                className="h-9 text-xs"
              />
            </div>

            {/* Manufacturing Process */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Manufacturing Process <span className="text-destructive">*</span>
              </label>
              <Select
                value={watch("manufacturingProcess") || "CNC Milling & Drilling"}
                onValueChange={(val) => setValue("manufacturingProcess", val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Process" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturingProcessOptions.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Development Stage */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Development Stage <span className="text-destructive">*</span>
              </label>
              <Select
                value={watch("developmentStage") || "Trial Validation"}
                onValueChange={(val) => setValue("developmentStage", val as any)}
              >
                <SelectTrigger className="h-9 text-xs font-semibold text-primary">
                  <SelectValue placeholder="Select Stage" />
                </SelectTrigger>
                <SelectContent>
                  {developmentStageOptions.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Priority <span className="text-destructive">*</span>
              </label>
              <Select
                value={watch("priority") || "High"}
                onValueChange={(val) => setValue("priority", val as any)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  {["Low", "Medium", "High", "Critical"].map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Jig Purpose */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Jig Purpose <span className="text-destructive">*</span>
              </label>
              <Textarea
                {...register("jigPurpose")}
                rows={3}
                placeholder="Describe operational objective and accuracy requirements..."
                className="text-xs min-h-[70px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
