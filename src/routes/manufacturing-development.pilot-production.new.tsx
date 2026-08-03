import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, ArrowRight, Check, RefreshCw, FileCheck, Layers, Package } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { pilotProductionService } from "@/services/pilotProductionService";
import type { PilotProductionRecord } from "@/lib/pilot-production/types";
import { MOCK_PILOT_RECORD_78 } from "@/lib/pilotProductionFns.server";

export const Route = createFileRoute("/manufacturing-development/pilot-production/new")({
  head: () => ({
    meta: [{ title: "New Pilot Production · Magnertia ERP" }],
  }),
  component: PilotProductionNewPage,
});

function PilotProductionNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [pvRef, setPvRef] = useState("PV-ENCL-AW-001");
  const [batchTitle, setBatchTitle] = useState("Autonomous W-EVSE Pilot Production");
  const [batchNumber, setBatchNumber] = useState("PB-ENCL-AW-002");
  const [product, setProduct] = useState("Autonomous W-EVSE");
  const [revision, setRevision] = useState("REV-2.1");
  const [line, setLine] = useState("Line-02");
  const [plannedQty, setPlannedQty] = useState(1000);
  const [scheduleStart, setScheduleStart] = useState("2024-06-20");
  const [scheduleEnd, setScheduleEnd] = useState("2024-06-28");

  const createMutation = useMutation({
    mutationFn: async () => {
      const idNum = Math.floor(10000 + Math.random() * 90000);
      const newRecord: PilotProductionRecord = {
        ...MOCK_PILOT_RECORD_78,
        id: `PILOT-2024-${idNum}`,
        formCode: `PPFD-2024-${Math.floor(10 + Math.random() * 90)}`,
        pilotBatchTitle: batchTitle,
        pilotBatchNumber: batchNumber,
        product,
        productRevision: revision,
        productionLine: line,
        plannedQuantity: plannedQty,
        scheduleStart,
        scheduleEnd,
        processValidationRef: pvRef,
        createdDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        workflowStatus: "Draft",
      };
      await pilotProductionService.saveRecord(newRecord);
      return newRecord;
    },
    onSuccess: (record) => {
      toast.success(`Pilot Production ${record.id} created!`);
      navigate({
        to: "/manufacturing-development/pilot-production/$id",
        params: { id: record.id },
      });
    },
  });

  return (
    <AppShell title="New Pilot Production">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Manufacturing Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Pilot Production</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-semibold">New Wizard</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Pilot Production Batch</h1>
          <p className="text-xs text-muted-foreground">
            3-Step Creation Wizard: Select Process Validation → Define Trial Parameters → Confirm & Create
          </p>
        </div>

        {/* Wizard Stepper */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: 1, title: "1. Select Upstream Reference" },
            { num: 2, title: "2. Define Trial Batch" },
            { num: 3, title: "3. Review & Create" },
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

        {/* Step 1: Upstream Selection */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 1: Select Process Validation Reference
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">
                  Process Validation Reference (PV)
                </label>
                <select
                  value={pvRef}
                  onChange={(e) => setPvRef(e.target.value)}
                  className="w-full p-2.5 bg-background border border-input rounded-md font-semibold text-foreground"
                >
                  <option value="PV-ENCL-AW-001">PV-ENCL-AW-001 (Autonomous W-EVSE Enclosure)</option>
                  <option value="PV-CHAR-500-002">PV-CHAR-500-002 (500kW Fast Charger Assembly)</option>
                  <option value="PV-BAT-PK-003">PV-BAT-PK-003 (EV Battery Pack Casing)</option>
                </select>
              </div>

              {/* Prefilled Upstream Chain Preview */}
              <div className="p-4 bg-muted/40 rounded-lg border border-border space-y-2">
                <span className="font-bold text-foreground block">Auto-Linked Upstream Chain</span>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>
                    BOM Reference: <span className="font-bold text-foreground">BOM-ENCL-REV2.1</span>
                  </div>
                  <div>
                    Routing Reference: <span className="font-bold text-foreground">RTG-ENCL-AW-001</span>
                  </div>
                  <div>
                    Control Plan: <span className="font-bold text-foreground">CP-ENCL-REV2.1</span>
                  </div>
                  <div>
                    PFMEA Reference: <span className="font-bold text-foreground">PFMEA-ENCL-REV2.1</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-md shadow flex items-center gap-2 hover:bg-primary/90"
              >
                Next: Define Batch <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Define Batch */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 2: Define Pilot Batch Parameters
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Pilot Batch Title</label>
                <input
                  type="text"
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Product</label>
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Product Revision</label>
                <input
                  type="text"
                  value={revision}
                  onChange={(e) => setRevision(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Production Line</label>
                <select
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground"
                >
                  <option value="Line-01">Line-01</option>
                  <option value="Line-02">Line-02</option>
                  <option value="Line-03">Line-03</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Planned Quantity</label>
                <input
                  type="number"
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(parseInt(e.target.value, 10) || 1000)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-bold"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Schedule Start</label>
                <input
                  type="date"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Schedule End</label>
                <input
                  type="date"
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
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
              Step 3: Confirm & Create Pilot Production Record
            </h2>

            <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block">Batch Title:</span>
                  <span className="font-extrabold text-foreground">{batchTitle}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Batch Number:</span>
                  <span className="font-bold text-foreground">{batchNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Product / Revision:</span>
                  <span className="font-bold text-foreground">
                    {product} ({revision})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Planned Quantity:</span>
                  <span className="font-bold text-foreground">{plannedQty.toLocaleString()} Units</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Process Validation:</span>
                  <span className="font-bold text-blue-600">{pvRef}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Target Line:</span>
                  <span className="font-bold text-foreground">{line}</span>
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
                    <Check className="w-4 h-4" /> Confirm & Create Record
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
