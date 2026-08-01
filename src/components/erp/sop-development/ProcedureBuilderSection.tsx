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
  Clock,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Wrench,
  BookOpen,
  UserCheck,
} from "lucide-react";
import type { SopFormInput, SopStepItem } from "@/services/types";
import { toast } from "sonner";

export function ProcedureBuilderSection({
  form,
}: {
  form: UseFormReturn<SopFormInput>;
}) {
  const { watch, setValue } = form;

  const steps: SopStepItem[] = watch("steps") || [];
  const [editingStep, setEditingStep] = useState<SopStepItem | null>(null);

  const handleAddStep = () => {
    const nextNum = steps.length + 1;
    const newStep: SopStepItem = {
      id: `sop-step-${Date.now()}`,
      stepNumber: nextNum,
      description: `Step ${nextNum}: Standard Operating Procedure Step`,
      responsibleRole: "Operator",
      durationMins: 5,
      requiredDocuments: "SOP Document",
      notes: "Verify operational parameters",
      safetyCheck: "Wear standard PPE",
      qualityCheck: "Visual check passed",
    };
    const updated = [...steps, newStep];
    setValue("steps", updated);
    toast.success(`Procedure Step ${nextNum} added`);
  };

  const handleDuplicateStep = (step: SopStepItem) => {
    const nextNum = steps.length + 1;
    const dupStep: SopStepItem = {
      ...step,
      id: `sop-step-${Date.now()}`,
      stepNumber: nextNum,
      description: `${step.description} (Copy)`,
    };
    const updated = [...steps, dupStep];
    setValue("steps", updated);
    toast.info(`Duplicated Step ${step.stepNumber} to Step ${nextNum}`);
  };

  const handleDeleteStep = (id: string) => {
    const filtered = steps.filter((s) => s.id !== id);
    const renumbered = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setValue("steps", renumbered);
    toast.info("Procedure step removed");
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

  const totalDurationMins = steps.reduce((sum, s) => sum + (s.durationMins || 0), 0);

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <CardTitle className="text-base font-bold">Interactive Procedure Builder</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Configure sequential operating procedure steps, responsible roles, duration estimates, safety & quality checkpoints.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleAddStep}
            className="gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Procedure Step
          </Button>

          <Badge variant="outline" className="text-xs font-mono font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800">
            Total Duration: {totalDurationMins} Mins
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
                    value={st.description}
                    onChange={(e) => {
                      const updated = steps.map((s) =>
                        s.id === st.id ? { ...s, description: e.target.value } : s
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
                      value={st.durationMins}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const updated = steps.map((s) =>
                          s.id === st.id ? { ...s, durationMins: val } : s
                        );
                        setValue("steps", updated);
                      }}
                      className="w-10 bg-transparent text-right font-bold focus:outline-none"
                    />
                    <span>mins</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setEditingStep(st)}
                  >
                    Configure Step
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
                  <span className="font-semibold text-muted-foreground block flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-primary" /> Responsible Role:
                  </span>
                  <p className="text-foreground font-semibold">{st.responsibleRole}</p>
                </div>
                <div>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> Safety Check:
                  </span>
                  <p className="text-foreground">{st.safetyCheck || "Standard PPE"}</p>
                </div>
                <div>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 block flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Quality Checkpoint:
                  </span>
                  <p className="text-foreground">{st.qualityCheck || "Visual inspection"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Configure Step Modal */}
        <Dialog open={Boolean(editingStep)} onOpenChange={() => setEditingStep(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Configure Procedure Step {editingStep?.stepNumber} Details
              </DialogTitle>
            </DialogHeader>

            {editingStep && (
              <div className="space-y-3 py-2 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Procedure Description</label>
                  <Textarea
                    value={editingStep.description}
                    onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                    rows={2}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Responsible Role</label>
                    <Input
                      value={editingStep.responsibleRole}
                      onChange={(e) => setEditingStep({ ...editingStep, responsibleRole: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Duration (Minutes)</label>
                    <Input
                      type="number"
                      value={editingStep.durationMins}
                      onChange={(e) =>
                        setEditingStep({ ...editingStep, durationMins: parseInt(e.target.value) || 0 })
                      }
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Required Documents & References</label>
                  <Input
                    value={editingStep.requiredDocuments || ""}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, requiredDocuments: e.target.value })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-amber-600">Safety Check / EHS Protocol</label>
                    <Input
                      value={editingStep.safetyCheck || ""}
                      onChange={(e) => setEditingStep({ ...editingStep, safetyCheck: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-blue-600">Quality Checkpoint / Control Point</label>
                    <Input
                      value={editingStep.qualityCheck || ""}
                      onChange={(e) => setEditingStep({ ...editingStep, qualityCheck: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Operational Notes & Best Practices</label>
                  <Textarea
                    value={editingStep.notes || ""}
                    onChange={(e) => setEditingStep({ ...editingStep, notes: e.target.value })}
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setEditingStep(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveStepModal} className="bg-primary text-white font-semibold">
                Save Procedure Step
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
