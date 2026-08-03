import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, ArrowRight, Check, RefreshCw, Cpu, Link2 } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { roboticsIntegrationService } from "@/services/roboticsIntegrationService";
import type { RoboticsIntegration } from "@/lib/robotics-integration/types";
import { MOCK_ROBOTICS_RECORD_35 } from "@/lib/roboticsIntegrationFns.server";

export const Route = createFileRoute("/manufacturing-development/robotics-integration/new")({
  head: () => ({
    meta: [{ title: "New Robotics Project · Magnertia ERP" }],
  }),
  component: RoboticsIntegrationNewPage,
});

function RoboticsIntegrationNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [plant, setPlant] = useState("Plant-01");
  const [line, setLine] = useState("Welding Line-03");
  const [productProcess, setProductProcess] = useState("Chassis Assembly");
  const [projectTitle, setProjectTitle] = useState("Robotic Welding Cell Integration");
  const [projectNumber, setProjectNumber] = useState("RW-INT-24-002");
  const [category, setCategory] = useState<any>("Industrial Robot");
  const [robotModelName, setRobotModelName] = useState("FANUC ARC Mate 120iC");
  const [automationDevId, setAutomationDevId] = useState("APD-2024-00045");
  const [isLinked, setIsLinked] = useState(true);
  const [objective, setObjective] = useState("Automate chassis welding process to improve productivity, quality and safety.");
  const [roiInr, setRoiInr] = useState(4875000);
  const [startDate, setStartDate] = useState("2024-05-05");
  const [targetDeployment, setTargetDeployment] = useState("2024-09-15");

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

      const newRecord: RoboticsIntegration = {
        ...MOCK_ROBOTICS_RECORD_35,
        id: `RIP-2024-${idNum}`,
        formCode: `RPF-2024-${Math.floor(10 + Math.random() * 90)}`,
        roboticsProjectTitle: projectTitle,
        projectNumber,
        productProcess,
        manufacturingPlant: plant,
        productionLine: line,
        roboticsCategory: category,
        robotModel: {
          id: `vp-r-${idNum}`,
          name: robotModelName,
          category: "Industrial Robot",
          vendor: "FANUC",
          model: robotModelName,
          specSheetUrl: "/files/specs/FANUC_ARC_Mate_120iC.pdf",
        },
        automationDevelopmentId: isLinked ? automationDevId : null,
        businessObjective: objective,
        roiEstimateInr: roiInr,
        startDate,
        targetDeployment,
        createdDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        workflowStatus: "Draft",
        manufacturingContextSnapshot: {
          processEngineering: { processFlow: "PF-CH-003", workSequence: "WS-CH-12" },
          plm: { cadModels: "CAD-CHASSIS-V3", bom: "BOM-CHASSIS-88", assemblyData: "ASM-CH-001" },
          automationDev: isLinked
            ? {
                automationDevId,
                plcPlatform: "Siemens SIMATIC S7-1500",
                hmiPlatform: "Siemens Comfort Panel",
                scadaPlatform: "WinCC Unified",
                automationArchitecture: "Architecture.pdf",
              }
            : null,
          snapshotAt: timestamp,
        },
      };
      await roboticsIntegrationService.saveRecord(newRecord);
      return newRecord;
    },
    onSuccess: (record) => {
      toast.success(`Robotics Project ${record.id} created! Manufacturing context snapshotted.`);
      navigate({
        to: "/manufacturing-development/robotics-integration/$id",
        params: { id: record.id },
      });
    },
  });

  return (
    <AppShell title="New Robotics Project">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Manufacturing Development</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Robotics Integration</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-semibold">New Wizard</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Robot Cell Integration Project</h1>
          <p className="text-xs text-muted-foreground">
            4-Step Creation Wizard: Scope → Robot Model → Automation Link → Review & Create
          </p>
        </div>

        {/* Wizard Stepper */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { num: 1, title: "1. Target Scope" },
            { num: 2, title: "2. Robot Model" },
            { num: 3, title: "3. Automation Dev Link" },
            { num: 4, title: "4. Review & Create" },
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

        {/* Step 1: Target Scope */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 1: Select Plant, Line & Product/Process
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
                  <option value="Welding Line-01">Welding Line-01</option>
                  <option value="Welding Line-02">Welding Line-02</option>
                  <option value="Welding Line-03">Welding Line-03</option>
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

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-md shadow flex items-center gap-2 hover:bg-primary/90"
              >
                Next: Robot Model <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Robot Model & Category */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 2: Select Robotics Category & Robot Model
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Robotics Project Title</label>
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
                <label className="text-muted-foreground font-semibold block mb-1">Robotics Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                >
                  <option value="Industrial Robot">Industrial Robot</option>
                  <option value="Collaborative Robot (Cobot)">Collaborative Robot (Cobot)</option>
                  <option value="Welding Robot">Welding Robot</option>
                  <option value="Assembly Robot">Assembly Robot</option>
                  <option value="Palletizing Robot">Palletizing Robot</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Robot Model</label>
                <select
                  value={robotModelName}
                  onChange={(e) => setRobotModelName(e.target.value)}
                  className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                >
                  <option value="FANUC ARC Mate 120iC">FANUC ARC Mate 120iC</option>
                  <option value="ABB IRB 1200">ABB IRB 1200</option>
                  <option value="KUKA KR QUANTEC">KUKA KR QUANTEC</option>
                  <option value="Universal Robots UR10e">Universal Robots UR10e</option>
                  <option value="Yaskawa AR2010">Yaskawa AR2010</option>
                </select>
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
                Next: Automation Dev Link <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Automation Dev Link */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 3: Upstream Link to Automation Development (Optional)
            </h2>

            <div className="p-4 bg-muted/40 rounded-lg border border-border space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="linkCheck"
                  checked={isLinked}
                  onChange={(e) => setIsLinked(e.target.checked)}
                  className="w-4 h-4 rounded text-primary"
                />
                <label htmlFor="linkCheck" className="font-bold text-foreground cursor-pointer">
                  Link to Upstream Automation Development Record
                </label>
              </div>

              {isLinked && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <label className="text-muted-foreground font-semibold block">Select Automation Dev ID</label>
                  <select
                    value={automationDevId}
                    onChange={(e) => setAutomationDevId(e.target.value)}
                    className="w-full p-2 bg-background border border-input rounded text-foreground font-semibold"
                  >
                    <option value="APD-2024-00045">APD-2024-00045 (Automated Battery Assembly & Testing Cell)</option>
                    <option value="APD-2024-00046">APD-2024-00046 (High Speed Pick & Place Cell)</option>
                  </select>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded border border-blue-200 text-blue-800 dark:text-blue-200 space-y-1">
                    <span className="font-bold block flex items-center gap-1">
                      <Link2 className="w-3.5 h-3.5 text-blue-600" /> Inherited Platform Selections:
                    </span>
                    <p className="text-[11px]">
                      PLC: Siemens S7-1500 • HMI: Siemens Comfort Panel • SCADA: WinCC Unified
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-input bg-background text-foreground font-semibold text-xs rounded-md hover:bg-accent"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-md shadow flex items-center gap-2 hover:bg-primary/90"
              >
                Next: Review & Confirm <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Create */}
        {step === 4 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Step 4: Confirm & Create Robotics Integration Record
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
                  <span className="text-muted-foreground block">Robot Model:</span>
                  <span className="font-bold text-blue-600">{robotModelName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Automation Dev Link:</span>
                  <span className="font-bold text-foreground">
                    {isLinked ? automationDevId : "None (Standalone Cell)"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Target Deployment:</span>
                  <span className="font-bold text-foreground">{targetDeployment}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Plant / Line:</span>
                  <span className="font-bold text-foreground">
                    {plant} ({line})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(3)}
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
                    <Check className="w-4 h-4" /> Confirm & Create Robot Cell Record
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
