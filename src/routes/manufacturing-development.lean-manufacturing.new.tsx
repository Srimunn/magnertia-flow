import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, ArrowRight, Check, RefreshCw, Zap } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { leanManufacturingService } from "@/services/leanManufacturingService";
import type { LeanManufacturing } from "@/lib/lean-manufacturing/types";
import { MOCK_LEAN_RECORD_123 } from "@/lib/leanManufacturingFns.server";

export const Route = createFileRoute("/manufacturing-development/lean-manufacturing/new")({
  head: () => ({
    meta: [{ title: "New Lean Project · Magnertia ERP" }],
  }),
  component: LeanManufacturingNewPage,
});

function LeanManufacturingNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [plant, setPlant] = useState("Plant-01");
  const [line, setLine] = useState("Assembly Line-02");
  const [projectTitle, setProjectTitle] = useState("Reduce Changeover Time in Assembly Line");
  const [projectNumber, setProjectNumber] = useState("LM-ENCL-LN02-002");
  const [category, setCategory] = useState<any>("Productivity Improvement");
  const [objective, setObjective] = useState("Reduce changeover time from 120 min to 45 min and improve OEE.");
  const [expectedSaving, setExpectedSaving] = useState(1245000);
  const [timelineStart, setTimelineStart] = useState("2024-05-01");
  const [timelineEnd, setTimelineEnd] = useState("2024-06-30");

  const createMutation = useMutation({
    mutationFn: async () => {
      const idNum = Math.floor(10000 + Math.random() * 90000);
      const timestamp = new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const newRecord: LeanManufacturing = {
        ...MOCK_LEAN_RECORD_123,
        id: `LEAN-2024-${idNum}`,
        formCode: `LMRF-2024-${Math.floor(10 + Math.random() * 90)}`,
        leanProjectTitle: projectTitle,
        leanProjectNumber: projectNumber,
        plant,
        productionLine: line,
        improvementCategory: category,
        improvementObjective: objective,
        expectedCostSaving: expectedSaving,
        timelineStart,
        timelineEnd,
        createdDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        workflowStatus: "Draft",
        currentStateSnapshot: {
          mes: { oee: 68.2, cycleTime: 320, downtime: 15.4, productionLosses: "Setup delays at Station-02" },
          qms: { fpy: 89.1, defectRate: 2.1, scrapRate: 3.2 },
          inventory: { wipInventory: "1,200 units", materialFlow: "Batch push system" },
          supplyChain: { leadTime: 8.2, supplierPerformance: 92.5 },
          snapshotAt: timestamp,
        },
      };
      await leanManufacturingService.saveRecord(newRecord);
      return newRecord;
    },
    onSuccess: (record) => {
      toast.success(`Lean Project ${record.id} created! Operational baseline snapshotted.`);
      navigate({
        to: "/manufacturing-development/lean-manufacturing/$id",
        params: { id: record.id },
      });
    },
  });

  return (
    <AppShell title="New Lean Manufacturing Project">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Manufacturing Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Lean Manufacturing</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-semibold">New Wizard</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Lean Continuous Improvement Project</h1>
          <p className="text-xs text-muted-foreground">
            3-Step Creation Wizard: Target Scope & Baseline Snapshot → Category & Objectives → Review & Create
          </p>
        </div>

        {/* Wizard Stepper */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: 1, title: "1. Scope & Baseline Snapshot" },
            { num: 2, title: "2. Improvement Category & Goal" },
            { num: 3, title: "3. Review & Create Project" },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 rounded-lg border text-xs font-bold transition-colors ${
                step === s.num
                  ? "bg-primary text-primary-foreground border-primary"
                  : step > s.num
                  ? "bg-muted text-foreground border-border"
                  : "bg-muted/30 text-muted-foreground border-border/60"
              }`}
            >
              {s.title}
            </div>
          ))}
        </div>

        {/* Step 1: Scope & Baseline Snapshot */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 1: Select Plant, Production Line & Timeline
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Target Plant</label>
                <select
                  value={plant}
                  onChange={(e) => setPlant(e.target.value)}
                  className="w-full p-2.5 bg-background border border-input rounded-md font-semibold text-foreground"
                >
                  <option value="Plant-01">Plant-01</option>
                  <option value="Plant-02">Plant-02</option>
                  <option value="Plant-03">Plant-03</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Production Line</label>
                <select
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                  className="w-full p-2.5 bg-background border border-input rounded-md font-semibold text-foreground"
                >
                  <option value="Assembly Line-01">Assembly Line-01</option>
                  <option value="Assembly Line-02">Assembly Line-02</option>
                  <option value="Assembly Line-03">Assembly Line-03</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Timeline Start</label>
                <input
                  type="date"
                  value={timelineStart}
                  onChange={(e) => setTimelineStart(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Timeline End</label>
                <input
                  type="date"
                  value={timelineEnd}
                  onChange={(e) => setTimelineEnd(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                />
              </div>
            </div>

            {/* Auto-Pulled Baseline Snapshot Preview */}
            <div className="p-4 bg-muted/40 rounded-lg border border-border space-y-2 text-xs">
              <span className="font-bold text-foreground block">Auto-Pulled Baseline Operational Snapshot (MES/QMS)</span>
              <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                <div>
                  MES OEE: <span className="font-bold text-foreground">68.20%</span>
                </div>
                <div>
                  QMS FPY: <span className="font-bold text-foreground">89.10%</span>
                </div>
                <div>
                  Cycle Time: <span className="font-bold text-foreground">320 sec</span>
                </div>
                <div>
                  Lead Time: <span className="font-bold text-foreground">8.20 hr</span>
                </div>
                <div>
                  Scrap Rate: <span className="font-bold text-foreground">3.20%</span>
                </div>
                <div>
                  Downtime: <span className="font-bold text-foreground">15.40%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-md shadow flex items-center gap-2 hover:bg-primary/90"
              >
                Next: Category & Goals <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Improvement Category & Goals */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 2: Define Improvement Category & Goals
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Project Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Project Number</label>
                <input
                  type="text"
                  value={projectNumber}
                  onChange={(e) => setProjectNumber(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Improvement Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                >
                  <option value="Productivity Improvement">Productivity Improvement</option>
                  <option value="Quality Improvement">Quality Improvement</option>
                  <option value="Cost Reduction">Cost Reduction</option>
                  <option value="Delivery Improvement">Delivery Improvement</option>
                  <option value="Safety Improvement">Safety Improvement</option>
                  <option value="Sustainability">Sustainability</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Expected Cost Saving (INR)</label>
                <input
                  type="number"
                  value={expectedSaving}
                  onChange={(e) => setExpectedSaving(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-extrabold text-emerald-600"
                />
              </div>

              <div className="col-span-2">
                <label className="text-muted-foreground font-semibold block mb-1">Improvement Objective</label>
                <textarea
                  rows={2}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-input bg-background text-foreground font-semibold text-xs rounded-md hover:bg-accent"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-md shadow flex items-center gap-2 hover:bg-primary/90"
              >
                Next: Review & Confirm <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Create */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 3: Confirm & Create Lean Project
            </h2>

            <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block">Project Title:</span>
                  <span className="font-extrabold text-foreground">{projectTitle}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Project Number:</span>
                  <span className="font-bold text-foreground">{projectNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Plant / Line:</span>
                  <span className="font-bold text-foreground">
                    {plant} ({line})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Expected Cost Saving:</span>
                  <span className="font-extrabold text-emerald-600">₹{expectedSaving.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Timeline:</span>
                  <span className="font-bold text-foreground">
                    {timelineStart} to {timelineEnd}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Improvement Category:</span>
                  <span className="font-bold text-blue-600">{category}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-input bg-background text-foreground font-semibold text-xs rounded-md hover:bg-accent"
              >
                Back
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Confirm & Create Lean Record
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
