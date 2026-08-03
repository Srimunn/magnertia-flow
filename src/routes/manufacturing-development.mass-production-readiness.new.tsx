import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, ArrowRight, Check, RefreshCw, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { massProductionReadinessService } from "@/services/massProductionReadinessService";
import type { MassProductionReadiness } from "@/lib/mass-production-readiness/types";
import { MOCK_READINESS_RECORD_56 } from "@/lib/massProductionReadinessFns.server";

export const Route = createFileRoute("/manufacturing-development/mass-production-readiness/new")({
  head: () => ({
    meta: [{ title: "New Mass Production Readiness · Magnertia ERP" }],
  }),
  component: MassProductionReadinessNewPage,
});

function MassProductionReadinessNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [pilotRef, setPilotRef] = useState("PILOT-2024-00078");
  const [readinessTitle, setReadinessTitle] = useState("Autonomous W-EVSE Mass Production Readiness");
  const [readinessNumber, setReadinessNumber] = useState("MR-ENCL-AW-002");
  const [product, setProduct] = useState("Autonomous W-EVSE");
  const [revision, setRevision] = useState("REV-2.1");
  const [plant, setPlant] = useState("Plant-01");
  const [line, setLine] = useState("Line-02");
  const [launchTarget, setLaunchTarget] = useState("2024-07-01");
  const [ppapStatus, setPpapStatus] = useState<"Customer Approved" | "Submitted" | "Not Submitted">("Customer Approved");

  const createMutation = useMutation({
    mutationFn: async () => {
      const idNum = Math.floor(10000 + Math.random() * 90000);
      const newRecord: MassProductionReadiness = {
        ...MOCK_READINESS_RECORD_56,
        id: `RDR-2024-${idNum}`,
        formCode: `MPRF-2024-${Math.floor(10 + Math.random() * 90)}`,
        readinessTitle,
        readinessNumber,
        product,
        productRevision: revision,
        manufacturingPlant: plant,
        productionLine: line,
        pilotProductionRef: pilotRef,
        ppapStatus,
        productionLaunchTarget: launchTarget,
        createdDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        workflowStatus: "Draft",
      };
      await massProductionReadinessService.saveRecord(newRecord);
      return newRecord;
    },
    onSuccess: (record) => {
      toast.success(`Mass Production Readiness record ${record.id} created!`);
      navigate({
        to: "/manufacturing-development/mass-production-readiness/$id",
        params: { id: record.id },
      });
    },
  });

  return (
    <AppShell title="New Mass Production Readiness">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Manufacturing Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Mass Production Readiness</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-semibold">New Wizard</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Mass Production Readiness Record</h1>
          <p className="text-xs text-muted-foreground">
            3-Step Gate Wizard: Select Pilot Production → Confirm PPAP Status → Set Launch Target & Create
          </p>
        </div>

        {/* Wizard Stepper */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: 1, title: "1. Select Pilot Reference" },
            { num: 2, title: "2. Confirm PPAP Status" },
            { num: 3, title: "3. Review & Create Gate" },
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

        {/* Step 1: Pilot Reference Selection */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 1: Select Pilot Production Reference
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">
                  Pilot Production Reference (PILOT)
                </label>
                <select
                  value={pilotRef}
                  onChange={(e) => setPilotRef(e.target.value)}
                  className="w-full p-2.5 bg-background border border-input rounded-md font-semibold text-foreground"
                >
                  <option value="PILOT-2024-00078">PILOT-2024-00078 (Autonomous W-EVSE Pilot Production)</option>
                  <option value="PILOT-2024-00079">PILOT-2024-00079 (500kW Fast Charger Trial Run)</option>
                  <option value="PILOT-2024-00080">PILOT-2024-00080 (EV Battery Pack Assembly Trial)</option>
                </select>
              </div>

              {/* Prefilled Upstream Chain Preview */}
              <div className="p-4 bg-muted/40 rounded-lg border border-border space-y-2">
                <span className="font-bold text-foreground block">Auto-Derived Pilot Data</span>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>
                    Product: <span className="font-bold text-foreground">Autonomous W-EVSE</span>
                  </div>
                  <div>
                    Revision: <span className="font-bold text-foreground">REV-2.1</span>
                  </div>
                  <div>
                    Plant: <span className="font-bold text-foreground">Plant-01</span>
                  </div>
                  <div>
                    Line: <span className="font-bold text-foreground">Line-02</span>
                  </div>
                  <div>
                    Pilot OEE: <span className="font-bold text-purple-600">78.6%</span>
                  </div>
                  <div>
                    Pilot FPY: <span className="font-bold text-emerald-600">96.4%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-md shadow flex items-center gap-2 hover:bg-primary/90"
              >
                Next: Confirm PPAP <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm PPAP Status */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 2: Confirm PPAP Status & Target Parameters
            </h2>
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span className="font-extrabold text-foreground">PPAP Customer Approval Gate</span>
                </div>
                <p className="text-muted-foreground">
                  Mass Production Readiness submission requires PPAP Status to be "Customer Approved".
                </p>
                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">PPAP Status</label>
                  <select
                    value={ppapStatus}
                    onChange={(e) => setPpapStatus(e.target.value as any)}
                    className="p-2 bg-background border border-input rounded font-extrabold text-emerald-700 dark:text-emerald-300"
                  >
                    <option value="Customer Approved">Customer Approved ✓</option>
                    <option value="Submitted">Submitted (Pending)</option>
                    <option value="Not Submitted">Not Submitted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Readiness Title</label>
                  <input
                    type="text"
                    value={readinessTitle}
                    onChange={(e) => setReadinessTitle(e.target.value)}
                    className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Readiness Number</label>
                  <input
                    type="text"
                    value={readinessNumber}
                    onChange={(e) => setReadinessNumber(e.target.value)}
                    className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Production Launch Target</label>
                  <input
                    type="date"
                    value={launchTarget}
                    onChange={(e) => setLaunchTarget(e.target.value)}
                    className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                  />
                </div>
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
              Step 3: Confirm & Create Readiness Record
            </h2>

            <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block">Readiness Title:</span>
                  <span className="font-extrabold text-foreground">{readinessTitle}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Readiness Number:</span>
                  <span className="font-bold text-foreground">{readinessNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Product / Revision:</span>
                  <span className="font-bold text-foreground">
                    {product} ({revision})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Launch Target:</span>
                  <span className="font-bold text-foreground">{launchTarget}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Pilot Production Ref:</span>
                  <span className="font-bold text-blue-600">{pilotRef}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">PPAP Status:</span>
                  <span className="font-bold text-emerald-600">{ppapStatus}</span>
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
                    <Check className="w-4 h-4" /> Confirm & Create Gate Record
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
