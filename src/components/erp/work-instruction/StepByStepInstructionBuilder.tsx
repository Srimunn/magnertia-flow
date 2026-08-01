import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Clock,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Mic,
  ShieldAlert,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import type { WorkInstructionFormInput, WorkInstructionStepItem } from "@/services/types";
import { toast } from "sonner";

export function StepByStepInstructionBuilder({
  form,
}: {
  form: UseFormReturn<WorkInstructionFormInput>;
}) {
  const { watch, setValue } = form;

  const steps: WorkInstructionStepItem[] = watch("steps") || [];
  const [editingStep, setEditingStep] = useState<WorkInstructionStepItem | null>(null);

  const handleAddStep = () => {
    const nextNum = steps.length + 1;
    const newStep: WorkInstructionStepItem = {
      id: `step-${Date.now()}`,
      stepNumber: nextNum,
      instruction: `Step ${nextNum}: Assembly Operation`,
      keyPoints: "Verify alignment and torque specification.",
      timeSeconds: 30,
      safetyNotes: "Wear ESD protection",
      qualityChecks: "Check visual alignment",
      requiredTools: "Torque Screwdriver",
      requiredMaterials: "Fasteners Kit",
    };
    const updated = [...steps, newStep];
    setValue("steps", updated);
    toast.success(`Step ${nextNum} added`);
  };

  const handleDuplicateStep = (step: WorkInstructionStepItem) => {
    const nextNum = steps.length + 1;
    const dupStep: WorkInstructionStepItem = {
      ...step,
      id: `step-${Date.now()}`,
      stepNumber: nextNum,
      instruction: `${step.instruction} (Copy)`,
    };
    const updated = [...steps, dupStep];
    setValue("steps", updated);
    toast.info(`Duplicated Step ${step.stepNumber} to Step ${nextNum}`);
  };

  const handleDeleteStep = (id: string) => {
    const filtered = steps.filter((s) => s.id !== id);
    const renumbered = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setValue("steps", renumbered);
    toast.info("Step removed");
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    )
      return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;

    const renumbered = newSteps.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setValue("steps", renumbered);
  };

  const handleSaveStepModal = () => {
    if (!editingStep) return;
    const updated = steps.map((s) => (s.id === editingStep.id ? editingStep : s));
    setValue("steps", updated);
    setEditingStep(null);
    toast.success(`Step ${editingStep.stepNumber} updated`);
  };

  const totalTimeSec = steps.reduce((sum, s) => sum + (s.timeSeconds || 0), 0);

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <CardTitle className="text-base font-bold">Interactive Step-by-Step Instruction Builder</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Author, reorder, and configure assembly steps, visual references, safety notes, quality checks & time estimates.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleAddStep}
            className="gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add New Step
          </Button>

          <Badge variant="outline" className="text-xs font-mono font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800">
            Total Cycle: {totalTimeSec} Sec
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        <div className="space-y-3">
          {steps.map((st, idx) => (
            <div
              key={st.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col gap-0.5 text-slate-400 cursor-grab">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveStep(idx, "up")}
                      className="hover:text-primary disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === steps.length - 1}
                      onClick={() => handleMoveStep(idx, "down")}
                      className="hover:text-primary disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  <span className="h-7 w-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs font-mono">
                    {st.stepNumber}
                  </span>

                  <Input
                    value={st.instruction}
                    onChange={(e) => {
                      const updated = steps.map((s) =>
                        s.id === st.id ? { ...s, instruction: e.target.value } : s
                      );
                      setValue("steps", updated);
                    }}
                    className="h-8 text-xs font-bold w-full max-w-md bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 rounded px-2 py-1 font-mono text-[11px]">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <input
                      type="number"
                      value={st.timeSeconds}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const updated = steps.map((s) =>
                          s.id === st.id ? { ...s, timeSeconds: val } : s
                        );
                        setValue("steps", updated);
                      }}
                      className="w-10 bg-transparent text-right font-bold focus:outline-none"
                    />
                    <span>sec</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setEditingStep(st)}
                  >
                    Configure Details
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDuplicateStep(st)}
                    title="Duplicate Step"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-red-50"
                    onClick={() => handleDeleteStep(st.id)}
                    title="Delete Step"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
                <div>
                  <span className="font-semibold text-muted-foreground block">Key Points:</span>
                  <p className="text-foreground">{st.keyPoints}</p>
                </div>
                <div>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> Safety Notes:
                  </span>
                  <p className="text-foreground">{st.safetyNotes || "Standard PPE required"}</p>
                </div>
                <div>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 block flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Quality Checks:
                  </span>
                  <p className="text-foreground">{st.qualityChecks || "Visual check passed"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Configure Details Modal */}
        <Dialog open={Boolean(editingStep)} onOpenChange={() => setEditingStep(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                Configure Step {editingStep?.stepNumber} Details
              </DialogTitle>
            </DialogHeader>

            {editingStep && (
              <div className="space-y-3 py-2 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Instruction Title / Description</label>
                  <Textarea
                    value={editingStep.instruction}
                    onChange={(e) => setEditingStep({ ...editingStep, instruction: e.target.value })}
                    rows={2}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Duration (Seconds)</label>
                    <Input
                      type="number"
                      value={editingStep.timeSeconds}
                      onChange={(e) =>
                        setEditingStep({ ...editingStep, timeSeconds: parseInt(e.target.value) || 0 })
                      }
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Visual Reference URL</label>
                    <Input
                      value={editingStep.visualReferenceUrl || ""}
                      onChange={(e) =>
                        setEditingStep({ ...editingStep, visualReferenceUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Key Points & Critical Quality Characteristics</label>
                  <Input
                    value={editingStep.keyPoints}
                    onChange={(e) => setEditingStep({ ...editingStep, keyPoints: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-amber-600">Safety Notes / ESD Hazards</label>
                    <Input
                      value={editingStep.safetyNotes || ""}
                      onChange={(e) => setEditingStep({ ...editingStep, safetyNotes: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-blue-600">Quality Checklist Points</label>
                    <Input
                      value={editingStep.qualityChecks || ""}
                      onChange={(e) => setEditingStep({ ...editingStep, qualityChecks: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Required Tools & Torque Settings</label>
                    <Input
                      value={editingStep.requiredTools || ""}
                      onChange={(e) => setEditingStep({ ...editingStep, requiredTools: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Required Materials & Fasteners</label>
                    <Input
                      value={editingStep.requiredMaterials || ""}
                      onChange={(e) =>
                        setEditingStep({ ...editingStep, requiredMaterials: e.target.value })
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setEditingStep(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveStepModal} className="bg-primary text-white font-semibold">
                Save Step Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
