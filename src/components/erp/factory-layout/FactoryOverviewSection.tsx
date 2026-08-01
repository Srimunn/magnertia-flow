import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import type { FactoryLayoutFormInput } from "@/services/types";

export function FactoryOverviewSection({
  form,
}: {
  form: UseFormReturn<FactoryLayoutFormInput>;
}) {
  const { register, watch, setValue, formState: { errors } } = form;

  const plantTypeOptions = [
    "Greenfield Factory",
    "Brownfield Factory",
    "Assembly Plant",
    "Manufacturing Plant",
    "Electronics Factory",
    "Automotive Factory",
    "Warehouse & Distribution Centre",
    "Smart Factory",
  ];

  const industrySegmentOptions = [
    "Electric Vehicles",
    "Automotive",
    "Electronics",
    "Renewable Energy",
    "Industrial Equipment",
    "Aerospace",
    "Medical Devices",
    "Consumer Products",
  ];

  const developmentStageOptions = [
    "Site Planning",
    "Concept Layout",
    "Detailed Layout",
    "Simulation",
    "Validation",
    "Construction",
    "Commissioning",
    "Operational Handover",
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            1
          </span>
          <CardTitle className="text-base font-bold">Factory Overview</CardTitle>
        </div>
        <CardDescription className="text-xs">
          High-level facility identity, plant classification, land dimensions, capacity & strategic objectives.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Factory Render Asset */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80"
                alt="Factory Aerial Master Plan Render"
                className="w-full h-full object-cover rounded-md opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-primary/90 text-white text-[10px] font-semibold">
                  3D Digital Twin Layout
                </Badge>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center font-medium">
              Magnertia EV Plant — Pune Facility Master Plan v1.2
            </p>
          </div>

          {/* Right Column: Form Fields Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Factory Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Factory Name <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("factoryName")}
                placeholder="e.g. Magnertia EV Plant"
                className="h-9 text-xs"
              />
              {errors.factoryName && (
                <span className="text-destructive text-[11px] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.factoryName.message}
                </span>
              )}
            </div>

            {/* Plant Type */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Plant Type <span className="text-destructive">*</span>
              </label>
              <Select
                value={watch("plantType") || "Greenfield Factory"}
                onValueChange={(val) => setValue("plantType", val as any)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Plant Type" />
                </SelectTrigger>
                <SelectContent>
                  {plantTypeOptions.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Industry Segment */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Industry Segment <span className="text-destructive">*</span>
              </label>
              <Select
                value={watch("industrySegment") || "Electric Vehicles"}
                onValueChange={(val) => setValue("industrySegment", val as any)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Segment" />
                </SelectTrigger>
                <SelectContent>
                  {industrySegmentOptions.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Total Land Area */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Total Land Area (m²) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                {...register("totalLandArea", { valueAsNumber: true })}
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* Built-up Area */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Built-up Area (m²) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                {...register("builtUpArea", { valueAsNumber: true })}
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* Production Capacity */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Production Capacity (units/year) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                {...register("productionCapacity", { valueAsNumber: true })}
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* Development Stage */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Development Stage <span className="text-destructive">*</span>
              </label>
              <Select
                value={watch("developmentStage") || "Detailed Layout"}
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
            <div className="space-y-1 sm:col-span-2">
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

            {/* Factory Objective */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-foreground flex items-center gap-1">
                Factory Objective <span className="text-destructive">*</span>
              </label>
              <Textarea
                {...register("factoryObjective")}
                rows={3}
                placeholder="Describe operational objective, lean manufacturing principles & expansion scope..."
                className="text-xs min-h-[70px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
