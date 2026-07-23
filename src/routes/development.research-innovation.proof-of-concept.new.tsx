import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardList,
  ExternalLink,
  FileText,
  Landmark,
  Loader2,
  MoreHorizontal,
  PlusCircle,
  Rocket,
  Save,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { PocPageTabBar, POC_STATUS_LABEL } from "@/components/erp/PocTabBar";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { StarRating } from "@/components/erp/StarRating";
import { ErpButton } from "@/components/erp/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mock-data";
import { pocService } from "@/services";
import type {
  PocApprovalDecision,
  PocFormInput,
  PocProjectRecord,
  PocStage,
  PocStatus,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/proof-of-concept/new")({
  head: () => ({ meta: [{ title: "PoC Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: PocFormPage,
});

/* --------------------------------- Consts --------------------------------- */
const EDITABLE: PocStatus[] = [
  "draft",
  "technical_implementation",
  "build_integration",
  "experimental_testing",
  "commercial_assessment",
  "final_review",
  "conditional_approval",
  "revision_required",
];
const STAGE_LABEL: Record<PocStage, string> = {
  technical_implementation: "Technical Implementation",
  build_integration: "Build & Integration",
  experimental_testing: "Experimental Testing",
  commercial_assessment: "Commercial Assessment",
  final_review: "Final Review",
};
const PROGRESS_PHASES = ["Planning", "Implementation", "Testing", "Validation", "Review"];
/** Which progress phases are complete at each status (sidebar checklist). */
const PHASES_DONE: Record<PocStatus, number> = {
  draft: 1,
  technical_implementation: 1,
  build_integration: 2,
  experimental_testing: 3,
  commercial_assessment: 4,
  final_review: 4,
  approved: 5,
  conditional_approval: 4,
  revision_required: 2,
  rejected: 5,
  archived: 5,
};

const EMPTY: PocFormInput = {
  pocTitle: "",
  businessUnit: "Smart Mobility",
  department: "R&D Engineering",
  projectManager: "Rohit Verma",
  pocStartDate: new Date().toISOString().slice(0, 10),
  linkedFeasibilityStudyId: null,
  overview: {
    objective: "",
    problemBeingSolved: "",
    proposedSolution: "",
    successCriteria: "",
    scope: "",
    assumptions: "",
    constraints: "",
  },
  technical: {
    technologyStack: [],
    hardwareComponents: "",
    softwareComponents: "",
    architecture: "",
    prototypeLevel: "Alpha PoC",
    engineeringApproach: "Experimental",
    integrationRequirements: "",
  },
  experimental: {
    experimentObjective: "",
    testMethod: "Functional Testing",
    testEnvironment: "Laboratory",
    variables: "",
    performanceParameters: "",
    acceptanceCriteria: "",
    testScheduleStart: new Date().toISOString().slice(0, 10),
    testScheduleEnd: "",
  },
  resources: {
    projectTeam: [],
    technicalExperts: [],
    laboratory: "Wireless Power Lab",
    equipmentRequired: "",
    softwareTools: [],
    budgetApproved: 0,
    budgetUtilized: 0,
  },
  testResults: {
    functionalValidation: 8,
    performanceValidation: 8,
    reliability: 7,
    efficiency: 87.6,
    safetyValidation: 9,
    complianceValidation: 8,
    observations: "",
  },
  issues: {
    technicalIssues: "",
    rootCause: "",
    correctiveActions: "",
    lessonsLearned: "",
    improvementSuggestions: "",
  },
  commercial: {
    customerAcceptance: 8,
    marketReadiness: 7,
    scalability: 8,
    manufacturingReadiness: 5,
    commercialViability: 7,
    goToMarketReadiness: 7,
  },
  attachments: [],
  recommendation: "",
};

function recordToInput(r: PocProjectRecord): PocFormInput {
  return {
    pocTitle: r.pocTitle,
    businessUnit: r.businessUnit,
    department: r.department,
    projectManager: r.projectManager,
    pocStartDate: r.pocStartDate,
    linkedFeasibilityStudyId: r.linkedFeasibilityStudyId,
    overview: r.overview,
    technical: r.technical,
    experimental: r.experimental,
    resources: r.resources,
    testResults: r.testResults,
    issues: r.issues,
    commercial: r.commercial,
    attachments: r.attachments,
    recommendation: r.summary.recommendation,
  };
}

/* ------------------------------ UI primitives ------------------------------ */
const INPUT =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 disabled:bg-muted/40 disabled:text-muted-foreground";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
function TextInput(p: {
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      className={cn(INPUT, "border-border")}
      value={p.value}
      disabled={p.disabled}
      placeholder={p.placeholder}
      onChange={(e) => p.onChange?.(e.target.value)}
    />
  );
}
function TextArea(p: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <textarea
      className={cn(INPUT, "resize-y border-border")}
      rows={p.rows ?? 2}
      value={p.value}
      disabled={p.disabled}
      placeholder={p.placeholder}
      onChange={(e) => p.onChange(e.target.value)}
    />
  );
}
function NumberInput(p: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      {p.prefix && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {p.prefix}
        </span>
      )}
      <input
        type="number"
        className={cn(INPUT, "border-border tabular", p.prefix && "pl-6", p.suffix && "pr-9")}
        value={Number.isFinite(p.value) ? p.value : 0}
        disabled={p.disabled}
        onChange={(e) => p.onChange(Number(e.target.value))}
      />
      {p.suffix && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {p.suffix}
        </span>
      )}
    </div>
  );
}
function Select(p: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <select
      className={cn(INPUT, "border-border")}
      value={p.value}
      disabled={p.disabled}
      onChange={(e) => p.onChange(e.target.value)}
    >
      <option value="">Select…</option>
      {p.options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
function TagMulti(p: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {p.options.map((o) => {
        const on = p.selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            disabled={p.disabled}
            onClick={() => p.onToggle(o)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-60",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-muted-foreground hover:border-primary/40",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
function SectionCard(p: {
  n: number;
  title: string;
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <section className={cn("card-soft space-y-3 p-4", p.className)}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold",
            p.accent ?? "bg-primary/10 text-primary",
          )}
        >
          {p.n}
        </span>
        {p.title}
      </h3>
      {p.children}
    </section>
  );
}
function ProgressRing({ value, size = 128 }: { value: number; size?: number }) {
  const rad = 42;
  const c = 2 * Math.PI * rad;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#0a3c75" : "#f59e0b";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={rad} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={rad}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-2xl font-bold tabular text-foreground">{value}%</div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Overall Progress
          </div>
        </div>
      </div>
    </div>
  );
}
function KeyScoreTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={cn("rounded-lg border p-3", tone)}>
      <div className="text-[10px] font-semibold text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-bold tabular text-foreground">
        {value}
        <span className="text-[10px] font-normal text-muted-foreground"> /100</span>
      </div>
    </div>
  );
}
function AIScoreRow({ label, value, pct }: { label: string; value: number; pct?: boolean }) {
  const color = value >= 70 ? "text-success" : value >= 50 ? "text-[#F59E0B]" : "text-destructive";
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular font-bold", color)}>
        {value}
        <span className="text-[10px] font-normal text-muted-foreground">
          {pct ? " %" : " /100"}
        </span>
      </span>
    </div>
  );
}
function StarRow({
  label,
  value,
  onChange,
  editable,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  editable: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <StarRating
        value={value}
        onChange={onChange}
        readOnly={!editable}
        size="sm"
        aria-label={label}
      />
    </div>
  );
}

/* ================================== Page ================================== */
function PocFormPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const lookupsQuery = useQuery({
    queryKey: ["proof-of-concept", "lookups"],
    queryFn: () => pocService.fetchLookups(),
  });
  const recordQuery = useQuery({
    queryKey: ["proof-of-concept", "record", id],
    queryFn: () => pocService.fetchRecord(id!),
    enabled: Boolean(id),
  });
  const sourcesQuery = useQuery({
    queryKey: ["proof-of-concept", "approved-feasibility"],
    queryFn: () => pocService.fetchApprovedFeasibilityStudies(),
    enabled: !id,
  });

  const lookups = lookupsQuery.data;
  const record = recordQuery.data ?? null;

  const [form, setForm] = useState<PocFormInput>(EMPTY);
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (record && loadedIdRef.current !== record.id) {
      loadedIdRef.current = record.id;
      setForm(recordToInput(record));
    }
  }, [record]);

  const status: PocStatus = record?.status ?? "draft";
  const editable = !record || EDITABLE.includes(status);
  const currentStage = record?.currentStage ?? "technical_implementation";
  const allStagesDone = record ? record.stages.every((s) => s.status === "completed") : false;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<PocApprovalDecision>("Approved");
  const [reviewNextAction, setReviewNextAction] = useState("Proceed to Prototype Development");
  const [reviewComments, setReviewComments] = useState("");
  const [attachCategory, setAttachCategory] = useState("Design Files");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["proof-of-concept"] });

  const saveMut = useMutation({
    mutationFn: () => pocService.saveDraft(form, record?.id),
    onSuccess: (r) => {
      invalidate();
      toast.success(record ? "PoC saved." : `PoC ${r.pocId} created.`);
      if (!record) {
        navigate({
          to: "/development/research-innovation/proof-of-concept/new",
          search: { id: r.id },
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const stageMut = useMutation({
    mutationFn: () => pocService.completeStage(record!.id, currentStage),
    onSuccess: () => {
      invalidate();
      toast.success(`${STAGE_LABEL[currentStage]} completed — AI assessment updated.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const submitMut = useMutation({
    mutationFn: () => pocService.submitForReview(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("PoC report submitted to the Technical Review Committee.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reviewMut = useMutation({
    mutationFn: () =>
      pocService.review({
        id: record!.id,
        decision: reviewDecision,
        nextAction: reviewNextAction,
        comments: reviewComments || undefined,
        conditions: reviewDecision === "Approved with Conditions" ? reviewComments : undefined,
      }),
    onSuccess: (r) => {
      invalidate();
      setReviewOpen(false);
      if (r.status === "approved")
        toast.success(`Approved — Prototype Development ${r.prototypeProjectCode} auto-created.`);
      else if (r.status === "conditional_approval")
        toast.success("Approved with improvements — implement recommendations.");
      else if (r.status === "rejected") toast.success("PoC rejected and archived.");
      else toast.success("Revision required — update design & re-test.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reportMut = useMutation({
    mutationFn: () => pocService.generateReport(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("PoC report generated — scores refreshed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy =
    saveMut.isPending ||
    stageMut.isPending ||
    submitMut.isPending ||
    reviewMut.isPending ||
    reportMut.isPending;

  const set = <K extends keyof PocFormInput>(key: K, value: PocFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setOverview = (patch: Partial<PocFormInput["overview"]>) =>
    setForm((f) => ({ ...f, overview: { ...f.overview, ...patch } }));
  const setTech = (patch: Partial<PocFormInput["technical"]>) =>
    setForm((f) => ({ ...f, technical: { ...f.technical, ...patch } }));
  const setExp = (patch: Partial<PocFormInput["experimental"]>) =>
    setForm((f) => ({ ...f, experimental: { ...f.experimental, ...patch } }));
  const setRes = (patch: Partial<PocFormInput["resources"]>) =>
    setForm((f) => ({ ...f, resources: { ...f.resources, ...patch } }));
  const setTest = (patch: Partial<PocFormInput["testResults"]>) =>
    setForm((f) => ({ ...f, testResults: { ...f.testResults, ...patch } }));
  const setIssues = (patch: Partial<PocFormInput["issues"]>) =>
    setForm((f) => ({ ...f, issues: { ...f.issues, ...patch } }));
  const setComm = (patch: Partial<PocFormInput["commercial"]>) =>
    setForm((f) => ({ ...f, commercial: { ...f.commercial, ...patch } }));

  const applyFeasibility = (fsId: string) => {
    const fs = (sourcesQuery.data ?? []).find((s) => s.id === fsId);
    set("linkedFeasibilityStudyId", fsId || null);
    if (!fs) return;
    setForm((f) => ({
      ...f,
      linkedFeasibilityStudyId: fsId,
      pocTitle: f.pocTitle || fs.studyTitle,
      businessUnit: fs.businessUnit || f.businessUnit,
      department: fs.department || f.department,
      projectManager: fs.projectManager || f.projectManager,
      overview: {
        ...f.overview,
        objective: f.overview.objective || fs.studyObjective,
        problemBeingSolved: f.overview.problemBeingSolved || fs.businessNeed,
      },
      resources: {
        ...f.resources,
        budgetApproved: f.resources.budgetApproved || fs.budgetRequired,
      },
    }));
    toast.success(`Context loaded from ${fs.feasibilityStudyCode}.`);
  };

  const addAttachment = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "file";
    set("attachments", [
      ...form.attachments,
      {
        id: crypto.randomUUID(),
        category: attachCategory,
        filename: file.name,
        fileType: ext,
        uploadedBy: form.projectManager || "Rohit Verma",
        uploadedAt: new Date().toISOString(),
        url: "#",
      },
    ]);
    toast.success(`${file.name} attached.`);
  };

  const ai = record?.aiAssessment ?? null;
  const summary = record?.summary ?? null;
  const progress = record?.progressPercentage ?? PHASES_DONE.draft * 0;
  const phasesDone = PHASES_DONE[status];
  const remainingBudget = form.resources.budgetApproved - form.resources.budgetUtilized;

  if (id && recordQuery.isLoading) {
    return (
      <AppShell
        title="Proof of Concept (PoC)"
        breadcrumb="Research & Innovation Development · Proof of Concept (PoC)"
        description="PoC Form"
        tabs={<PocPageTabBar />}
      >
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
          <div className="h-[480px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Proof of Concept (PoC)"
      breadcrumb="Research & Innovation Development · Proof of Concept (PoC)"
      description="PoC Form"
      tabs={<PocPageTabBar />}
    >
      <div className="space-y-5">
        {/* ------------------------- Record header bar ------------------------- */}
        <div className="card-soft space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Field label="PoC ID">
              <TextInput value={record?.pocId ?? "Auto"} disabled />
            </Field>
            <Field label="Form Code">
              <TextInput value={record?.formCode ?? "Auto"} disabled />
            </Field>
            <Field label="PoC Title" required>
              <TextInput
                value={form.pocTitle}
                onChange={(v) => set("pocTitle", v)}
                disabled={!editable}
                placeholder="e.g. Autonomous Wireless EV Charging Docking Mechanism"
              />
            </Field>
            <LinkChip label="Linked Feasibility Study" code={record?.linkedFeasibilityStudyCode} />
            <LinkChip label="Linked Research Project" code={record?.linkedResearchProjectCode} />
            <LinkChip label="Linked Technology" code={record?.linkedTechnologyCode} />
          </div>

          {/* Row 2 */}
          <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-3 xl:grid-cols-5">
            <Field label="Business Unit">
              <Select
                value={form.businessUnit}
                onChange={(v) => set("businessUnit", v)}
                options={lookups?.businessUnits ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Department">
              <Select
                value={form.department}
                onChange={(v) => set("department", v)}
                options={lookups?.departments ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Project Manager">
              <Select
                value={form.projectManager}
                onChange={(v) => set("projectManager", v)}
                options={lookups?.projectManagers ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="PoC Start Date" required>
              <input
                type="date"
                className={cn(INPUT, "border-border")}
                value={form.pocStartDate}
                disabled={!editable}
                onChange={(e) => set("pocStartDate", e.target.value)}
              />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Workflow Status</span>
              <div className="flex h-[38px] items-center">
                <StatusBadge status={POC_STATUS_LABEL[status]} />
              </div>
            </div>
          </div>

          {!record && (
            <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-[1fr_auto]">
              <Field label="Source Approved Feasibility Study (required)" required>
                <select
                  className={cn(INPUT, "border-border")}
                  value={form.linkedFeasibilityStudyId ?? ""}
                  onChange={(e) => applyFeasibility(e.target.value)}
                >
                  <option value="">Select an approved feasibility study…</option>
                  {(sourcesQuery.data ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.feasibilityStudyCode} — {s.studyTitle}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <span className="pb-2 text-xs text-muted-foreground">
                  A PoC can only be created from an approved Feasibility Study. Research,
                  technology, budget and lab context is retrieved automatically.
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="text-xs text-muted-foreground">
              {record ? (
                <>
                  Next action: <span className="font-semibold">{record.nextAction}</span>
                </>
              ) : (
                "Select an approved Feasibility Study, fill the sections, then create the PoC to start Stage 1."
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {editable && (
                <ErpButton variant="outline" onClick={() => saveMut.mutate()} disabled={busy}>
                  {saveMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {record ? "Save Draft" : "Create PoC Project"}
                </ErpButton>
              )}
              {record && editable && !allStagesDone && (
                <ErpButton variant="outline" onClick={() => stageMut.mutate()} disabled={busy}>
                  {stageMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Complete {STAGE_LABEL[currentStage]}
                </ErpButton>
              )}
              {record && editable && allStagesDone && (
                <ErpButton onClick={() => submitMut.mutate()} disabled={busy}>
                  {submitMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit for Review
                </ErpButton>
              )}
              {record && status === "final_review" && (
                <ErpButton onClick={() => setReviewOpen(true)} disabled={busy}>
                  <Landmark className="h-4 w-4" /> Record Committee Decision
                </ErpButton>
              )}
              {record && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => reportMut.mutate()}>
                      <FileText className="h-4 w-4" /> Generate PoC Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
                      <Activity className="h-4 w-4" /> View Activity History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setInsightsOpen(true)}>
                      <Brain className="h-4 w-4" /> View AI Insights
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------------- Status banners --------------------------- */}
        {record && status === "final_review" && (
          <div className="card-soft flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-warning p-4">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-[oklch(0.45_0.15_75)]" />
              <div>
                <div className="text-sm font-bold text-foreground">
                  Awaiting Technical Review Committee Decision
                </div>
                <div className="text-xs text-muted-foreground">
                  Approve (auto-creates Prototype Development), approve with improvements, request
                  revision, or reject.
                </div>
              </div>
            </div>
            <ErpButton variant="outline" onClick={() => setReviewOpen(true)}>
              Record Decision <ChevronRight className="h-4 w-4" />
            </ErpButton>
          </div>
        )}
        {record && status === "conditional_approval" && record.reviewConditions && (
          <div className="card-soft border-l-4 border-l-accent p-4 text-sm">
            <span className="font-bold text-foreground">Improvements required: </span>
            <span className="text-muted-foreground">{record.reviewConditions}</span>
          </div>
        )}
        {record && status === "revision_required" && record.reviewComments && (
          <div className="card-soft border-l-4 border-l-warning p-4 text-sm">
            <span className="font-bold text-foreground">Review feedback: </span>
            <span className="text-muted-foreground">{record.reviewComments}</span>
          </div>
        )}
        {record && status === "approved" && record.prototypeProjectCode && (
          <div className="card-soft flex items-center gap-2 border-l-4 border-l-success p-4 text-sm">
            <Rocket className="h-4 w-4 text-success" />
            <span className="font-bold text-foreground">
              Prototype Development {record.prototypeProjectCode} auto-created.
            </span>
            <span className="text-muted-foreground">Project Manager notified.</span>
          </div>
        )}

        {/* ------------------------------ Main grid ------------------------------ */}
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_320px]">
          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {/* 1 — PoC Overview */}
            <SectionCard n={1} title="PoC Overview">
              <Field label="Objective" required>
                <TextArea
                  value={form.overview.objective}
                  onChange={(v) => setOverview({ objective: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Validate the autonomous docking and wireless power transfer system for EVs under real operational conditions."
                />
              </Field>
              <Field label="Problem Being Solved">
                <TextArea
                  value={form.overview.problemBeingSolved}
                  onChange={(v) => setOverview({ problemBeingSolved: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Proposed Solution">
                <TextArea
                  value={form.overview.proposedSolution}
                  onChange={(v) => setOverview({ proposedSolution: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Success Criteria" required>
                <TextArea
                  value={form.overview.successCriteria}
                  onChange={(v) => setOverview({ successCriteria: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="> 90% docking success rate, > 85% efficiency, safe operation and user validation."
                />
              </Field>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Scope" required>
                  <TextArea
                    value={form.overview.scope}
                    onChange={(v) => setOverview({ scope: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Assumptions" required>
                    <TextArea
                      value={form.overview.assumptions}
                      onChange={(v) => setOverview({ assumptions: v })}
                      rows={2}
                      disabled={!editable}
                    />
                  </Field>
                  <Field label="Constraints" required>
                    <TextArea
                      value={form.overview.constraints}
                      onChange={(v) => setOverview({ constraints: v })}
                      rows={2}
                      disabled={!editable}
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* 2 — Technical Implementation */}
            <SectionCard n={2} title="Technical Implementation">
              <Field label="Technology Stack" required>
                <TagMulti
                  options={lookups?.technologyStack ?? []}
                  selected={form.technical.technologyStack}
                  onToggle={(v) =>
                    setTech({
                      technologyStack: form.technical.technologyStack.includes(v)
                        ? form.technical.technologyStack.filter((x) => x !== v)
                        : [...form.technical.technologyStack, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prototype Level" required>
                  <Select
                    value={form.technical.prototypeLevel}
                    onChange={(v) => setTech({ prototypeLevel: v })}
                    options={lookups?.prototypeLevels ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Engineering Approach" required>
                  <Select
                    value={form.technical.engineeringApproach}
                    onChange={(v) => setTech({ engineeringApproach: v })}
                    options={lookups?.engineeringApproaches ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <Field label="Hardware Components" required>
                <TextArea
                  value={form.technical.hardwareComponents}
                  onChange={(v) => setTech({ hardwareComponents: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Software Components" required>
                <TextArea
                  value={form.technical.softwareComponents}
                  onChange={(v) => setTech({ softwareComponents: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Architecture" required>
                <TextArea
                  value={form.technical.architecture}
                  onChange={(v) => setTech({ architecture: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Integration Requirements" required>
                <TextArea
                  value={form.technical.integrationRequirements}
                  onChange={(v) => setTech({ integrationRequirements: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Integration with vehicle receiver coil, BMS, cloud platform and mobile app."
                />
              </Field>
            </SectionCard>

            {/* 3 — Experimental Plan */}
            <SectionCard n={3} title="Experimental Plan">
              <Field label="Experiment Objective" required>
                <TextArea
                  value={form.experimental.experimentObjective}
                  onChange={(v) => setExp({ experimentObjective: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Validate docking accuracy, charging efficiency and safety."
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Test Method" required>
                  <Select
                    value={form.experimental.testMethod}
                    onChange={(v) => setExp({ testMethod: v })}
                    options={lookups?.testMethods ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Test Environment" required>
                  <Select
                    value={form.experimental.testEnvironment}
                    onChange={(v) => setExp({ testEnvironment: v })}
                    options={lookups?.testEnvironments ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <Field label="Variables" required>
                <TextArea
                  value={form.experimental.variables}
                  onChange={(v) => setExp({ variables: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Performance Parameters" required>
                <TextArea
                  value={form.experimental.performanceParameters}
                  onChange={(v) => setExp({ performanceParameters: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Docking Accuracy, Power Transfer Efficiency, Charging Time, Safety Compliance"
                />
              </Field>
              <Field label="Acceptance Criteria" required>
                <TextArea
                  value={form.experimental.acceptanceCriteria}
                  onChange={(v) => setExp({ acceptanceCriteria: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Test Schedule Start" required>
                  <input
                    type="date"
                    className={cn(INPUT, "border-border")}
                    value={form.experimental.testScheduleStart}
                    disabled={!editable}
                    onChange={(e) => setExp({ testScheduleStart: e.target.value })}
                  />
                </Field>
                <Field label="Test Schedule End" required>
                  <input
                    type="date"
                    className={cn(INPUT, "border-border")}
                    value={form.experimental.testScheduleEnd}
                    disabled={!editable}
                    onChange={(e) => setExp({ testScheduleEnd: e.target.value })}
                  />
                </Field>
              </div>
            </SectionCard>

            {/* 4 — Resources */}
            <SectionCard n={4} title="Resources">
              <Field label="Project Team">
                <TagMulti
                  options={lookups?.teamMembers ?? []}
                  selected={form.resources.projectTeam}
                  onToggle={(v) =>
                    setRes({
                      projectTeam: form.resources.projectTeam.includes(v)
                        ? form.resources.projectTeam.filter((x) => x !== v)
                        : [...form.resources.projectTeam, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <Field label="Technical Experts">
                <TagMulti
                  options={lookups?.technicalExperts ?? []}
                  selected={form.resources.technicalExperts}
                  onToggle={(v) =>
                    setRes({
                      technicalExperts: form.resources.technicalExperts.includes(v)
                        ? form.resources.technicalExperts.filter((x) => x !== v)
                        : [...form.resources.technicalExperts, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <Field label="Laboratory">
                <Select
                  value={form.resources.laboratory}
                  onChange={(v) => setRes({ laboratory: v })}
                  options={lookups?.laboratories ?? []}
                  disabled={!editable}
                />
              </Field>
              <Field label="Equipment Required" required>
                <TextArea
                  value={form.resources.equipmentRequired}
                  onChange={(v) => setRes({ equipmentRequired: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Coil Test Bench, Robotic Arm, Power Analyzer, Oscilloscope, Thermal Camera"
                />
              </Field>
              <Field label="Software Tools" required>
                <TagMulti
                  options={lookups?.softwareTools ?? []}
                  selected={form.resources.softwareTools}
                  onToggle={(v) =>
                    setRes({
                      softwareTools: form.resources.softwareTools.includes(v)
                        ? form.resources.softwareTools.filter((x) => x !== v)
                        : [...form.resources.softwareTools, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Budget Approved">
                  <NumberInput
                    value={form.resources.budgetApproved}
                    onChange={(v) => setRes({ budgetApproved: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="Budget Utilized">
                  <NumberInput
                    value={form.resources.budgetUtilized}
                    onChange={(v) => setRes({ budgetUtilized: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="Remaining">
                  <TextInput value={formatCurrency(remainingBudget, true)} disabled />
                </Field>
              </div>
            </SectionCard>

            {/* 5 — Test Results */}
            <SectionCard n={5} title="Test Results">
              <div className="space-y-2">
                <StarRow
                  label="Functional Validation"
                  value={form.testResults.functionalValidation}
                  onChange={(v) => setTest({ functionalValidation: v })}
                  editable={editable}
                />
                <StarRow
                  label="Performance Validation"
                  value={form.testResults.performanceValidation}
                  onChange={(v) => setTest({ performanceValidation: v })}
                  editable={editable}
                />
                <StarRow
                  label="Reliability"
                  value={form.testResults.reliability}
                  onChange={(v) => setTest({ reliability: v })}
                  editable={editable}
                />
                <StarRow
                  label="Safety Validation"
                  value={form.testResults.safetyValidation}
                  onChange={(v) => setTest({ safetyValidation: v })}
                  editable={editable}
                />
                <StarRow
                  label="Compliance Validation"
                  value={form.testResults.complianceValidation}
                  onChange={(v) => setTest({ complianceValidation: v })}
                  editable={editable}
                />
              </div>
              <Field label="Efficiency (%)" required>
                <NumberInput
                  value={form.testResults.efficiency}
                  onChange={(v) => setTest({ efficiency: v })}
                  suffix="%"
                  disabled={!editable}
                />
              </Field>
              <Field label="Observations" required>
                <TextArea
                  value={form.testResults.observations}
                  onChange={(v) => setTest({ observations: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Docking mechanism stable. Power transfer efficiency improved with optimized coil alignment."
                />
              </Field>
            </SectionCard>

            {/* 6 — Issues & Improvements */}
            <SectionCard n={6} title="Issues & Improvements">
              <Field label="Technical Issues" required>
                <TextArea
                  value={form.issues.technicalIssues}
                  onChange={(v) => setIssues({ technicalIssues: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Occasional misalignment at high vehicle speed."
                />
              </Field>
              <Field label="Root Cause" required>
                <TextArea
                  value={form.issues.rootCause}
                  onChange={(v) => setIssues({ rootCause: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Sensor latency and control tuning."
                />
              </Field>
              <Field label="Corrective Actions" required>
                <TextArea
                  value={form.issues.correctiveActions}
                  onChange={(v) => setIssues({ correctiveActions: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Lessons Learned" required>
                <TextArea
                  value={form.issues.lessonsLearned}
                  onChange={(v) => setIssues({ lessonsLearned: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Improvement Suggestions" required>
                <TextArea
                  value={form.issues.improvementSuggestions}
                  onChange={(v) => setIssues({ improvementSuggestions: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
            </SectionCard>

            {/* 7 — Commercial Assessment */}
            <SectionCard n={7} title="Commercial Assessment">
              <div className="space-y-2">
                <StarRow
                  label="Customer Acceptance"
                  value={form.commercial.customerAcceptance}
                  onChange={(v) => setComm({ customerAcceptance: v })}
                  editable={editable}
                />
                <StarRow
                  label="Market Readiness"
                  value={form.commercial.marketReadiness}
                  onChange={(v) => setComm({ marketReadiness: v })}
                  editable={editable}
                />
                <StarRow
                  label="Scalability"
                  value={form.commercial.scalability}
                  onChange={(v) => setComm({ scalability: v })}
                  editable={editable}
                />
                <StarRow
                  label="Manufacturing Readiness"
                  value={form.commercial.manufacturingReadiness}
                  onChange={(v) => setComm({ manufacturingReadiness: v })}
                  editable={editable}
                />
                <StarRow
                  label="Commercial Viability"
                  value={form.commercial.commercialViability}
                  onChange={(v) => setComm({ commercialViability: v })}
                  editable={editable}
                />
                <StarRow
                  label="Go-to-Market Readiness"
                  value={form.commercial.goToMarketReadiness}
                  onChange={(v) => setComm({ goToMarketReadiness: v })}
                  editable={editable}
                />
              </div>
            </SectionCard>

            {/* 8 — AI PoC Assessment */}
            <SectionCard n={8} title="AI PoC Assessment" accent="bg-[#7c5cff]/10 text-[#7c5cff]">
              {ai ? (
                <>
                  <div className="space-y-2">
                    <AIScoreRow label="AI Technical Score" value={ai.aiTechnicalScore} />
                    <AIScoreRow label="AI Performance Score" value={ai.aiPerformanceScore} />
                    <AIScoreRow label="AI Reliability Score" value={ai.aiReliabilityScore} />
                    <AIScoreRow label="AI Commercial Score" value={ai.aiCommercialScore} />
                    <AIScoreRow
                      label="AI Success Probability"
                      value={ai.aiSuccessProbability}
                      pct
                    />
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Recommendations
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {ai.recommendations}
                    </p>
                  </div>
                  <button
                    className="text-xs font-semibold text-primary hover:underline"
                    onClick={() => setInsightsOpen(true)}
                  >
                    View AI Insights →
                  </button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  AI assessment is generated on creation and refreshed as each stage completes.
                </p>
              )}
            </SectionCard>

            {/* 10 — Attachments (numbering gap: no section 9 per screenshot) */}
            <SectionCard n={10} title="Attachments" className="lg:col-span-2 2xl:col-span-3">
              <div className="flex flex-wrap gap-2">
                {form.attachments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-foreground">
                        {a.filename}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{a.category}</div>
                    </div>
                    {editable && (
                      <button
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          set(
                            "attachments",
                            form.attachments.filter((x) => x.id !== a.id),
                          )
                        }
                        aria-label={`Remove ${a.filename}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {editable && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-white px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Upload className="h-4 w-4" /> Upload File / drag & drop
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) addAttachment(f);
                    e.target.value = "";
                  }}
                />
              </div>
              {editable && (
                <select
                  className={cn(INPUT, "border-border max-w-xs")}
                  value={attachCategory}
                  onChange={(e) => setAttachCategory(e.target.value)}
                >
                  {(lookups?.attachmentCategories ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </SectionCard>

            {/* 11 — Review & Approval */}
            <SectionCard n={11} title="Review & Approval" className="lg:col-span-2 2xl:col-span-3">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {(record?.reviewers ?? []).map((r) => (
                  <div
                    key={r.role}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {r.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-foreground">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground">{r.role}</div>
                      <div
                        className={cn(
                          "text-[10px] font-semibold",
                          r.status === "reviewed" ? "text-success" : "text-muted-foreground",
                        )}
                      >
                        {r.status === "reviewed"
                          ? `Reviewed${r.date ? ` · ${new Date(r.date).toLocaleDateString("en-IN")}` : ""}`
                          : "Pending"}
                      </div>
                    </div>
                  </div>
                ))}
                {!record && (
                  <p className="text-xs text-muted-foreground sm:col-span-2 xl:col-span-4">
                    Reviewers are assigned when the PoC is created.
                  </p>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Approval Decision">
                  <TextInput value={record?.approvalDecision ?? "Pending"} disabled />
                </Field>
                <Field label="Next Action">
                  <TextInput value={record?.reviewNextAction ?? "—"} disabled />
                </Field>
                <Field label="Review Comments">
                  <TextInput value={record?.reviewComments ?? "—"} disabled />
                </Field>
                <Field label="Approval Date">
                  <TextInput
                    value={
                      record?.approvalDate
                        ? new Date(record.approvalDate).toLocaleDateString("en-IN")
                        : "— / — / ——"
                    }
                    disabled
                  />
                </Field>
              </div>
            </SectionCard>

            {/* 12 — System Information */}
            <SectionCard n={12} title="System Information" className="lg:col-span-2 2xl:col-span-3">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Created By
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {record?.createdBy ?? "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {record ? new Date(record.createdAt).toLocaleString("en-IN") : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Last Modified By
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {record?.lastModifiedBy ?? "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {record ? new Date(record.updatedAt).toLocaleString("en-IN") : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Workflow Stage
                  </div>
                  <div className="pt-0.5">
                    <StatusBadge status={POC_STATUS_LABEL[status]} />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Version
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {record ? `${record.version}.0` : "—"}
                  </div>
                  <button
                    className="text-[11px] font-semibold text-primary hover:underline"
                    onClick={() => setHistoryOpen(true)}
                  >
                    View Activity History
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ------------------------------- Sidebar ------------------------------- */}
          <aside className="space-y-5 xl:sticky xl:top-4">
            <div className="card-soft space-y-3 p-4">
              <h3 className="text-sm font-bold text-foreground">PoC Progress</h3>
              <div className="flex items-center gap-4">
                <ProgressRing value={record ? progress : 10} />
                <ul className="flex-1 space-y-1.5">
                  {PROGRESS_PHASES.map((phase, i) => {
                    const done = i < phasesDone;
                    const active = i === phasesDone && status !== "approved";
                    return (
                      <li key={phase} className="flex items-center gap-2 text-xs">
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                        ) : active ? (
                          <Circle className="h-3.5 w-3.5 shrink-0 fill-primary/20 text-primary" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                        )}
                        <span className={cn(done ? "text-foreground" : "text-muted-foreground")}>
                          {phase}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="card-soft space-y-3 p-4">
              <h3 className="text-sm font-bold text-foreground">Key Scores</h3>
              <div className="grid grid-cols-2 gap-2">
                <KeyScoreTile
                  label="Technical Score"
                  value={summary?.technicalScore ?? 0}
                  tone="border-[#3B82F6]/20 bg-[#3B82F6]/5"
                />
                <KeyScoreTile
                  label="Performance Score"
                  value={summary?.performanceScore ?? 0}
                  tone="border-[#22C55E]/20 bg-[#22C55E]/5"
                />
                <KeyScoreTile
                  label="Commercial Score"
                  value={summary?.commercialScore ?? 0}
                  tone="border-[#F59E0B]/20 bg-[#F59E0B]/5"
                />
                <KeyScoreTile
                  label="Risk Score"
                  value={summary?.riskScore ?? 0}
                  tone="border-destructive/20 bg-destructive/5"
                />
              </div>
            </div>

            <div className="card-soft space-y-2 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                AI Success Probability
              </h3>
              <div className="rounded-lg bg-[#7c5cff]/10 p-3 text-center">
                <div className="font-display text-3xl font-bold tabular text-[#7c5cff]">
                  {ai?.aiSuccessProbability ?? 0}
                  <span className="text-lg">%</span>
                </div>
              </div>
            </div>

            <div className="card-soft space-y-2 p-4">
              <h3 className="text-sm font-bold text-foreground">Quick Actions</h3>
              <QuickAction
                icon={<Upload className="h-4 w-4" />}
                label="Upload Test Results"
                onClick={() => {
                  if (!editable) return toast.error("PoC is locked in this status.");
                  fileInputRef.current?.click();
                }}
                disabled={!record}
              />
              <QuickAction
                icon={<FileText className="h-4 w-4" />}
                label="Generate PoC Report"
                onClick={() => reportMut.mutate()}
                disabled={!record || busy}
              />
              <QuickAction
                icon={<Brain className="h-4 w-4" />}
                label="AI Analysis Report"
                onClick={() => setInsightsOpen(true)}
                disabled={!record}
              />
              <QuickAction
                icon={<Activity className="h-4 w-4" />}
                label="Resource Utilization"
                onClick={() => toast.success("Opening resource utilization report.")}
                disabled={!record}
              />
              <QuickAction
                icon={<Rocket className="h-4 w-4" />}
                label="Create Prototype Project"
                onClick={() => {
                  if (status !== "approved")
                    return toast.error(
                      "Create Prototype Project is available once the PoC is Approved.",
                    );
                  toast.success(
                    record?.prototypeProjectCode
                      ? `Prototype project ${record.prototypeProjectCode} already created on approval.`
                      : "Creating prototype project.",
                  );
                }}
                disabled={!record || status !== "approved"}
                highlight={status === "approved"}
              />
              <QuickAction
                icon={<PlusCircle className="h-4 w-4" />}
                label="Add Issue"
                onClick={() => toast.success("Add an issue in the Issues & Improvements section.")}
                disabled={!record}
              />
              <QuickAction
                icon={<ClipboardList className="h-4 w-4" />}
                label="Request Approval"
                onClick={() => {
                  if (!allStagesDone)
                    return toast.error("Complete all stages before requesting approval.");
                  submitMut.mutate();
                }}
                disabled={!record || status === "final_review" || status === "approved"}
              />
            </div>

            {record && (
              <div className="card-soft space-y-2 p-4">
                <h3 className="text-sm font-bold text-foreground">Related Links</h3>
                <RelatedLink label="Feasibility Study" code={record.linkedFeasibilityStudyCode} />
                <RelatedLink label="Research Project" code={record.linkedResearchProjectCode} />
                <RelatedLink label="Technology Scouting" code={record.linkedTechnologyCode} />
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* --------------------------- Committee Review dialog --------------------------- */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Technical Review Committee</DialogTitle>
            <DialogDescription>
              {record
                ? `${record.pocTitle || record.pocId} — PoC score ${summary?.overallPocScore ?? 0}/100, success ${ai?.aiSuccessProbability ?? 0}%.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Approval Decision" required>
              <Select
                value={reviewDecision}
                onChange={(v) => setReviewDecision(v as PocApprovalDecision)}
                options={lookups?.approvalDecisions ?? []}
              />
            </Field>
            <Field label="Next Action">
              <Select
                value={reviewNextAction}
                onChange={setReviewNextAction}
                options={lookups?.nextActions ?? []}
              />
            </Field>
            <Field
              label={
                reviewDecision === "Approved with Conditions" ? "Improvements" : "Review Comments"
              }
            >
              <TextArea value={reviewComments} onChange={setReviewComments} rows={3} />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <ErpButton variant="outline" onClick={() => setReviewOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton onClick={() => reviewMut.mutate()} disabled={reviewMut.isPending}>
                {reviewMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Record Decision
              </ErpButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ History dialog ------------------------------ */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Activity History</DialogTitle>
            <DialogDescription>
              {record ? `${record.pocId} — full audit trail.` : ""}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {record &&
              [...record.auditTrail].reverse().map((a, i) => (
                <li key={i} className="rounded-lg bg-muted/40 px-3 py-2">
                  <div className="text-xs font-semibold text-foreground">{a.event}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {a.actor} · {new Date(a.at).toLocaleString("en-IN")}
                    {a.stage ? ` · ${STAGE_LABEL[a.stage]}` : ""}
                  </div>
                </li>
              ))}
          </ul>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ AI Insights dialog ------------------------------ */}
      <Dialog open={insightsOpen} onOpenChange={setInsightsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Insights & PoC Summary</DialogTitle>
            <DialogDescription>
              Computed from the section data — single source of truth.
            </DialogDescription>
          </DialogHeader>
          {ai && summary && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <MiniScore label="Technical Score" value={summary.technicalScore} />
                <MiniScore label="Performance Score" value={summary.performanceScore} />
                <MiniScore label="Commercial Score" value={summary.commercialScore} />
                <MiniScore label="Risk Score" value={summary.riskScore} />
                <MiniScore label="Overall PoC Score" value={summary.overallPocScore} />
                <MiniScore label="Readiness Score" value={ai.readinessScore} />
              </div>
              <div className="text-xs text-muted-foreground">
                Technology Readiness Level:{" "}
                <span className="font-bold text-foreground">
                  {summary.technologyReadinessLevel}
                </span>{" "}
                · Recommendation:{" "}
                <span className="font-bold text-foreground">{summary.recommendation}</span>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">Architecture Assessment</div>
                <p className="text-xs text-muted-foreground">{ai.architectureAssessment}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">Design Risks & Integration</div>
                <p className="text-xs text-muted-foreground">
                  {ai.designRisks} {ai.integrationStatus}.
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">AI Improvement Suggestions</div>
                <p className="text-xs text-muted-foreground">{ai.improvementSuggestions}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function LinkChip({ label, code }: { label: string; code: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <span className="block text-xs font-semibold text-foreground">{label}</span>
      <div className="flex h-[38px] items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 text-xs font-semibold text-foreground">
        {code ? (
          <>
            {code} <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}
function RelatedLink({ label, code }: { label: string; code: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <span className="flex items-center gap-1 text-xs font-semibold text-primary">
        {code ?? "—"}
        {code && <ChevronRight className="h-3 w-3" />}
      </span>
    </div>
  );
}
function MiniScore({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "text-success" : value >= 50 ? "text-[#F59E0B]" : "text-destructive";
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-2.5 py-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={cn("tabular text-xs font-bold", color)}>{value}</span>
    </div>
  );
}
function QuickAction(p: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={p.onClick}
      disabled={p.disabled}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        p.highlight
          ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
          : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      <span className={cn(p.highlight ? "text-primary" : "text-muted-foreground")}>{p.icon}</span>
      {p.label}
    </button>
  );
}
