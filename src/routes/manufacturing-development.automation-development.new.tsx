import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, ArrowRight, Check, RefreshCw, Cpu } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { automationDevelopmentService } from "@/services/automationDevelopmentService";
import type { AutomationDevelopment } from "@/lib/automation-development/types";
import { MOCK_AUTOMATION_RECORD_45 } from "@/lib/automationDevelopmentFns.server";

export const Route = createFileRoute("/manufacturing-development/automation-development/new")({
  head: () => ({
    meta: [{ title: "New Automation Project · Magnertia ERP" }],
  }),
  component: AutomationDevelopmentNewPage,
});

function AutomationDevelopmentNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [plant, setPlant] = useState("Plant-01");
  const [line, setLine] = useState("Battery Assembly Line-02");
  const [productProcess, setProductProcess] = useState("Battery Assembly");
  const [projectTitle, setProjectTitle] = useState("Automated Battery Assembly & Testing Cell");
  const [projectNumber, setProjectNumber] = useState("AP-BA-24-002");
  const [category, setCategory] = useState<any>("Industrial Robotics");
  const [objective, setObjective] = useState("Automate battery module assembly and testing to improve productivity and quality.");
  const [roiInr, setRoiInr] = useState(487500000);
  const [startDate, setStartDate] = useState("2024-05-05");
  const [targetDeployment, setTargetDeployment] = useState("2024-08-30");

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

      const newRecord: AutomationDevelopment = {
        ...MOCK_AUTOMATION_RECORD_45,
        id: `APD-2024-${idNum}`,
        formCode: `APDF-2024-${Math.floor(10 + Math.random() * 90)}`,
        automationProjectTitle: projectTitle,
        projectNumber,
        productProcess,
        manufacturingPlant: plant,
        productionLine: line,
        automationCategory: category,
        automationObjective: objective,
        roiEstimateInr: roiInr,
        startDate,
        targetDeployment,
        createdDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        workflowStatus: "Draft",
        manufacturingContextSnapshot: {
          processEngineering: { processFlow: "PF-BA-001", cycleTime: 120 },
          plm: { bomReference: "BOM-BA-REV2.1", drawingsReference: "DWG-BA-1004", specificationsReference: "SPEC-BA-09" },
          snapshotAt: timestamp,
        },
      };
      await automationDevelopmentService.saveRecord(newRecord);
      return newRecord;
    },
    onSuccess: (record) => {
      toast.success(`Automation Project ${record.id} created! Manufacturing context snapshotted.`);
      navigate({
        to: "/manufacturing-development/automation-development/$id",
        params: { id: record.id },
      });
    },
  });

  return (
    <AppShell title="New Automation Project">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Manufacturing Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Automation Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-semibold">New Wizard</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Automation Cell Project</h1>
          <p className="text-xs text-muted-foreground">
            3-Step Creation Wizard: Scope & Context Snapshot → Hardware Category & Objective → Review & Create
          </p>
        </div>

        {/* Wizard Stepper */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: 1, title: "1. Scope & Context Snapshot" },
            { num: 2, title: "2. Category & Objectives" },
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

        {/* Step 1: Scope & Context Snapshot */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 1: Select Plant, Production Line & Product/Process
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Product / Process</label>
                <input
                  type="text"
                  value={productProcess}
                  onChange={(e) => setProductProcess(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                />
              </div>

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
                  <option value="Battery Assembly Line-01">Battery Assembly Line-01</option>
                  <option value="Battery Assembly Line-02">Battery Assembly Line-02</option>
                  <option value="Battery Assembly Line-03">Battery Assembly Line-03</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Target Deployment</label>
                <input
                  type="date"
                  value={targetDeployment}
                  onChange={(e) => setTargetDeployment(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                />
              </div>
            </div>

            {/* Context Snapshot Preview */}
            <div className="p-4 bg-muted/40 rounded-lg border border-border space-y-2 text-xs">
              <span className="font-bold text-foreground block">Auto-Derived Context Snapshot (Process & PLM)</span>
              <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                <div>
                  Process Flow: <span className="font-bold text-foreground">PF-BA-001</span>
                </div>
                <div>
                  BOM Ref: <span className="font-bold text-foreground">BOM-BA-REV2.1</span>
                </div>
                <div>
                  Current Cycle Time: <span className="font-bold text-foreground">120 sec</span>
                </div>
                <div>
                  Drawings Ref: <span className="font-bold text-foreground">DWG-BA-1004</span>
                </div>
                <div>
                  Specs Ref: <span className="font-bold text-foreground">SPEC-BA-09</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-md shadow flex items-center gap-2 hover:bg-primary/90"
              >
                Next: Category & Objectives <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Category & Objectives */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 2: Define Automation Category & Objectives
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Automation Project Title</label>
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
                <label className="text-muted-foreground font-semibold block mb-1">Automation Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                >
                  <option value="Industrial Robotics">Industrial Robotics</option>
                  <option value="Collaborative Robotics">Collaborative Robotics</option>
                  <option value="Machine Vision">Machine Vision</option>
                  <option value="AGV & AMR">AGV & AMR</option>
                  <option value="PLC-based Automation">PLC-based Automation</option>
                  <option value="SCADA Integration">SCADA Integration</option>
                  <option value="IIoT">IIoT</option>
                  <option value="Full Cell Automation">Full Cell Automation</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">ROI Estimate (INR)</label>
                <input
                  type="number"
                  value={roiInr}
                  onChange={(e) => setRoiInr(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-extrabold text-emerald-600"
                />
              </div>

              <div className="col-span-2">
                <label className="text-muted-foreground font-semibold block mb-1">Automation Objective</label>
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
              Step 3: Confirm & Create Automation Record
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
                  <span className="text-muted-foreground block">ROI Estimate:</span>
                  <span className="font-extrabold text-emerald-600">₹{(roiInr / 10000000).toFixed(2)} Cr</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Target Deployment:</span>
                  <span className="font-bold text-foreground">{targetDeployment}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Category:</span>
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
                    <Check className="w-4 h-4" /> Confirm & Create Automation Cell
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
