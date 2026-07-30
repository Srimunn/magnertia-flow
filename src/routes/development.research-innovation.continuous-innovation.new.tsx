import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronRight,
  FileText,
  GitBranch,
  History,
  Landmark,
  Loader2,
  MoreHorizontal,
  Repeat,
  Save,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  ContinuousInnovationPageTabBar,
  CI_STATUS_LABEL,
} from "@/components/erp/ContinuousInnovationTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
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
import { continuousInnovationService } from "@/services";
import type {
  CIApprovalDecision,
  CIFormInput,
  CIStage,
  CIStatus,
  ContinuousInnovationRecord,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/continuous-innovation/new")({
  head: () => ({ meta: [{ title: "Continuous Innovation Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: CIFormPage,
});

/* --------------------------------- Consts --------------------------------- */
const EDITABLE: CIStatus[] = [
  "draft",
  "opportunity_identification",
  "innovation_planning",
  "implementation_monitoring",
  "executive_review",
  "approved_with_improvements",
  "revision_required",
];
const STAGE_ORDER: CIStage[] = [
  "opportunity_identification",
  "innovation_planning",
  "implementation_monitoring",
  "executive_review",
];
const STAGE_LABEL: Record<CIStage, string> = {
  opportunity_identification: "Opportunity Identification",
  innovation_planning: "Innovation Planning",
  implementation_monitoring: "Implementation & Monitoring",
  executive_review: "Executive Review",
};

const EMPTY: CIFormInput = {
  innovationInitiative: "",
  businessUnit: "",
  innovationManager: "Rohit Verma",
  reviewPeriodStart: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
  reviewPeriodEnd: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10),
  linkedProductId: null,
  overview: {
    innovationTheme: "Product Innovation",
    improvementObjective: "",
    currentProductVersion: "",
    improvementCategory: "Performance Improvement",
    strategicAlignment: 8,
    businessPriority: "High",
    expectedBusinessOutcome: "",
  },
  feedback: {
    feedbackRecordsAnalyzed: 0,
    serviceTicketsAnalyzed: 0,
    marketIntelligence: "",
    competitorBenchmark: "",
    emergingTechnologies: "",
    improvementOpportunities: "",
  },
  planning: {
    innovationType: "Continuous Improvement",
    improvementScope: "Product & Process",
    targetKpis: "",
    resourceRequirements: "",
    estimatedBudget: 0,
    expectedTimeline: "3 Months",
    targetReleaseVersion: "",
  },
  implementation: {
    developmentApproach: "Agile",
    responsibleTeam: [],
    milestones: [],
    riskAssessment: "",
    deploymentStrategy: "Phased Deployment",
    rolloutPlan: "",
  },
  performance: {
    productivityImprovement: 0,
    costReduction: 0,
    revenueGrowth: 0,
    customerSatisfaction: 8,
    productQualityImprovement: 8,
    sustainabilityImpact: 7,
    kpiAchievement: 0,
  },
  lessons: {
    successFactors: "",
    challenges: "",
    rootCauseAnalysis: "",
    bestPractices: "",
    knowledgeAssetsCreated: "",
    futureRecommendations: "",
  },
  portfolio: {
    portfolioCategory: "Core Product Enhancement",
    strategicValue: 8,
    technologyImpact: 8,
    businessImpact: 8,
    esgContribution: 7,
    portfolioPriority: "High",
  },
  attachments: [],
  recommendation: "",
};

function recordToInput(r: ContinuousInnovationRecord): CIFormInput {
  return {
    innovationInitiative: r.innovationInitiative,
    businessUnit: r.businessUnit,
    innovationManager: r.innovationManager,
    reviewPeriodStart: r.reviewPeriodStart,
    reviewPeriodEnd: r.reviewPeriodEnd,
    linkedProductId: r.linkedProductId,
    overview: r.overview,
    feedback: r.feedback,
    planning: r.planning,
    implementation: r.implementation,
    performance: r.performance,
    lessons: r.lessons,
    portfolio: r.portfolio,
    attachments: r.attachments,
    recommendation: r.summary.recommendation,
  };
}

/* ------------------------------ UI primitives ------------------------------ */
const INPUT =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 disabled:bg-muted/40 disabled:text-muted-foreground";

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
function TextInput(p: { value: string; onChange?: (v: string) => void; disabled?: boolean; placeholder?: string }) {
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
function Select(p: { value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean }) {
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
function DateInput(p: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <input
      type="date"
      className={cn(INPUT, "border-border")}
      value={p.value}
      disabled={p.disabled}
      onChange={(e) => p.onChange(e.target.value)}
    />
  );
}
function TagMulti(p: { options: string[]; selected: string[]; onToggle: (v: string) => void; disabled?: boolean }) {
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
function SectionCard(p: { n: number; title: string; children: ReactNode; className?: string; accent?: string }) {
  return (
    <section className={cn("card-soft space-y-3 p-4", p.className)}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        {p.title}
      </h3>
      {p.children}
    </section>
  );
}
function ScoreRow({ label, value, unit = "/100" }: { label: string; value: number; unit?: string }) {
  const color = value >= 70 ? "text-success" : value >= 50 ? "text-[#F59E0B]" : "text-destructive";
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular font-bold", color)}>
        {value} <span className="text-[10px] font-normal text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}
/** Innovation Health gauge (sidebar) — a DISTINCT aggregate from the section-9
 *  Overall Innovation Score. */
function HealthRing({ value, size = 132 }: { value: number; size?: number }) {
  const rad = 42;
  const c = 2 * Math.PI * rad;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const color = value >= 70 ? "#22c55e" : value >= 45 ? "#f59e0b" : "#ef4444";
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
          <div className="font-display text-2xl font-bold tabular text-foreground">{value}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Health %</div>
        </div>
      </div>
    </div>
  );
}
function ContribBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "bg-success" : value >= 45 ? "bg-[#F59E0B]" : "bg-destructive";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
function HistoryLink(p: { icon: ReactNode; label: string; sub: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={p.onClick}
      disabled={p.disabled}
      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <span className="text-muted-foreground">{p.icon}</span>
        {p.label}
      </span>
      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary">
        {p.sub}
        <ChevronRight className="h-3 w-3" />
      </span>
    </button>
  );
}
function AIBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-xs font-bold text-foreground">{label}</div>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

/* ================================== Page ================================== */
function CIFormPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const lookupsQuery = useQuery({
    queryKey: ["continuous-innovation", "lookups"],
    queryFn: () => continuousInnovationService.fetchLookups(),
  });
  const recordQuery = useQuery({
    queryKey: ["continuous-innovation", "record", id],
    queryFn: () => continuousInnovationService.fetchRecord(id!),
    enabled: Boolean(id),
  });
  const productsQuery = useQuery({
    queryKey: ["continuous-innovation", "products"],
    queryFn: () => continuousInnovationService.fetchProducts(),
    enabled: !id,
  });

  const lookups = lookupsQuery.data;
  const record = recordQuery.data ?? null;

  const [form, setForm] = useState<CIFormInput>(EMPTY);
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (record && loadedIdRef.current !== record.id) {
      loadedIdRef.current = record.id;
      setForm(recordToInput(record));
    }
  }, [record]);

  // Cycle history for the linked product (navigable, non-terminal).
  const cyclesQuery = useQuery({
    queryKey: ["continuous-innovation", "cycles", record?.linkedProductId],
    queryFn: () => continuousInnovationService.fetchCyclesForProduct(record!.linkedProductId!),
    enabled: Boolean(record?.linkedProductId),
  });

  const status: CIStatus = record?.status ?? "draft";
  const editable = !record || EDITABLE.includes(status);
  const currentStage = record?.currentStage ?? "opportunity_identification";
  const allStagesDone = record ? record.stages.every((s) => s.status === "completed") : false;
  const submitted = record ? record.reviewRows.some((r) => r.status === "Approved" || r.status === "In Review") : false;
  const decided = ["approved", "rejected", "archived"].includes(status);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState<null | "audit" | "activity" | "change" | "workflow">(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<CIApprovalDecision>("Approved");
  const [reviewComments, setReviewComments] = useState("");
  const [attachCategory, setAttachCategory] = useState("Customer Feedback Reports");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["continuous-innovation"] });

  const saveMut = useMutation({
    mutationFn: () => continuousInnovationService.saveDraft(form, record?.id),
    onSuccess: (r) => {
      invalidate();
      toast.success(record ? "Cycle saved." : `Cycle ${r.cycleId} opened (cycle #${r.cycleNumber}).`);
      if (!record)
        navigate({
          to: "/development/research-innovation/continuous-innovation/new",
          search: { id: r.id },
        });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const stageMut = useMutation({
    mutationFn: () => continuousInnovationService.completeStage(record!.id, currentStage),
    onSuccess: () => {
      invalidate();
      toast.success(`${STAGE_LABEL[currentStage]} completed.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const milestoneMut = useMutation({
    mutationFn: (milestoneId: string) => continuousInnovationService.toggleMilestone(record!.id, milestoneId),
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });
  const submitMut = useMutation({
    mutationFn: () => continuousInnovationService.submitForReview(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Innovation performance report submitted to the Review Committee.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reviewMut = useMutation({
    mutationFn: () =>
      continuousInnovationService.review({
        id: record!.id,
        decision: reviewDecision,
        comments: reviewComments || undefined,
      }),
    onSuccess: (r) => {
      invalidate();
      setReviewOpen(false);
      if (r.status === "approved")
        toast.success(`Approved — next release ${r.nextReleaseCode ?? ""} created, roadmap updated.`);
      else if (r.status === "approved_with_improvements")
        toast.success("Approved with improvements — revise the innovation strategy.");
      else if (r.status === "rejected") toast.success("Cycle rejected and archived.");
      else toast.success("Revision required — returned to Innovation Planning.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reportMut = useMutation({
    mutationFn: () => continuousInnovationService.generateReport(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Innovation report generated — assessment refreshed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy =
    saveMut.isPending ||
    stageMut.isPending ||
    milestoneMut.isPending ||
    submitMut.isPending ||
    reviewMut.isPending ||
    reportMut.isPending;

  const set = <K extends keyof CIFormInput>(key: K, value: CIFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setOverview = (patch: Partial<CIFormInput["overview"]>) =>
    setForm((f) => ({ ...f, overview: { ...f.overview, ...patch } }));
  const setFeedback = (patch: Partial<CIFormInput["feedback"]>) =>
    setForm((f) => ({ ...f, feedback: { ...f.feedback, ...patch } }));
  const setPlanning = (patch: Partial<CIFormInput["planning"]>) =>
    setForm((f) => ({ ...f, planning: { ...f.planning, ...patch } }));
  const setImpl = (patch: Partial<CIFormInput["implementation"]>) =>
    setForm((f) => ({ ...f, implementation: { ...f.implementation, ...patch } }));
  const setPerf = (patch: Partial<CIFormInput["performance"]>) =>
    setForm((f) => ({ ...f, performance: { ...f.performance, ...patch } }));
  const setLessons = (patch: Partial<CIFormInput["lessons"]>) =>
    setForm((f) => ({ ...f, lessons: { ...f.lessons, ...patch } }));
  const setPortfolio = (patch: Partial<CIFormInput["portfolio"]>) =>
    setForm((f) => ({ ...f, portfolio: { ...f.portfolio, ...patch } }));

  const applyProduct = (productId: string) => {
    const p = (productsQuery.data ?? []).find((x) => x.id === productId);
    set("linkedProductId", productId || null);
    if (!p) return;
    setForm((f) => ({
      ...f,
      linkedProductId: productId,
      businessUnit: f.businessUnit || p.businessUnit,
      innovationInitiative: f.innovationInitiative || `${p.productName} — Continuous Improvement`,
      overview: {
        ...f.overview,
        currentProductVersion: f.overview.currentProductVersion || p.currentVersion,
      },
    }));
    toast.success(`Context loaded from ${p.productCode} — feedback & service records derived.`);
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
        uploadedBy: form.innovationManager || "Rohit Verma",
        uploadedAt: new Date().toISOString(),
        url: "#",
      },
    ]);
    toast.success(`${file.name} attached.`);
  };

  const ai = record?.aiAssessment ?? null;
  const summary = record?.summary ?? null;
  const health = record?.health ?? null;
  const scores = record?.computedScores ?? null;

  if (id && recordQuery.isLoading) {
    return (
      <AppShell
        title="Continuous Innovation"
        breadcrumb="Development · Research & Innovation · Continuous Innovation"
        description="Drive continuous, period-over-period product improvement."
        tabs={<InnovationAreaTabs sub={<ContinuousInnovationPageTabBar />} />}
      >
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
          <div className="h-[480px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  const historyKind = historyOpen;
  const historyEntries = record
    ? record.auditTrail.filter((a) => (historyKind ? (a.kind ?? "audit") === historyKind : true))
    : [];

  return (
    <AppShell
      title="Continuous Innovation"
      breadcrumb="Development · Research & Innovation · Continuous Innovation"
      description="Drive continuous, period-over-period product improvement."
      tabs={<InnovationAreaTabs sub={<ContinuousInnovationPageTabBar />} />}
    >
      <div className="space-y-5">
        {/* ------------------------- Record header bar ------------------------- */}
        <div className="card-soft space-y-3 p-4">
          {/* Row 1 */}
          <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
            <Field label="Cycle ID">
              <TextInput value={record?.cycleId ?? "Auto"} disabled />
            </Field>
            <Field label="Form Code">
              <TextInput value={record?.formCode ?? "Auto"} disabled />
            </Field>
            <Field label="Cycle #">
              <TextInput value={record ? `#${record.cycleNumber}` : "Auto"} disabled />
            </Field>
            <Field label="Innovation Initiative" required>
              <TextInput
                value={form.innovationInitiative}
                onChange={(v) => set("innovationInitiative", v)}
                disabled={!editable}
                placeholder="e.g. FastCharge DC-180 — 2026 Continuous Improvement"
              />
            </Field>
            <Field label="Linked Product">
              <div className="flex h-[38px] items-center rounded-lg border border-border bg-muted/30 px-2 text-xs font-semibold text-foreground">
                {record?.linkedProductName ?? "—"}
              </div>
            </Field>
            <Field label="Previous Cycle">
              <div className="flex h-[38px] items-center rounded-lg border border-border bg-muted/30 px-2 text-xs font-semibold text-foreground">
                {record?.previousCycleCode ?? "None"}
              </div>
            </Field>
            <Field label="Innovation Manager">
              <Select
                value={form.innovationManager}
                onChange={(v) => set("innovationManager", v)}
                options={lookups?.innovationManagers ?? []}
                disabled={!editable}
              />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Workflow Status</span>
              <div className="flex h-[38px] items-center">
                <StatusBadge status={CI_STATUS_LABEL[status]} />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-3 xl:grid-cols-6">
            <Field label="Business Unit">
              <Select
                value={form.businessUnit}
                onChange={(v) => set("businessUnit", v)}
                options={lookups?.businessUnits ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Review Period Start">
              <DateInput
                value={form.reviewPeriodStart}
                onChange={(v) => set("reviewPeriodStart", v)}
                disabled={!editable}
              />
            </Field>
            <Field label="Review Period End">
              <DateInput
                value={form.reviewPeriodEnd}
                onChange={(v) => set("reviewPeriodEnd", v)}
                disabled={!editable}
              />
            </Field>
            <Field label="Current Product Version">
              <TextInput
                value={form.overview.currentProductVersion}
                onChange={(v) => setOverview({ currentProductVersion: v })}
                disabled={!editable}
                placeholder="v2.1"
              />
            </Field>
            <Field label="Target Release Version">
              <TextInput
                value={form.planning.targetReleaseVersion}
                onChange={(v) => setPlanning({ targetReleaseVersion: v })}
                disabled={!editable}
                placeholder="v2.2"
              />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Current Stage</span>
              <div className="flex h-[38px] items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 text-xs font-bold text-foreground">
                {record ? STAGE_LABEL[currentStage] : "Not started"}
              </div>
            </div>
          </div>

          {!record && (
            <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-[1fr_auto]">
              <Field label="Source Product (required)" required>
                <select
                  className={cn(INPUT, "border-border")}
                  value={form.linkedProductId ?? ""}
                  onChange={(e) => applyProduct(e.target.value)}
                >
                  <option value="">Select a launched product…</option>
                  {(productsQuery.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productCode} — {p.productName} ({p.currentVersion})
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <span className="pb-2 text-xs text-muted-foreground">
                  A cycle is scoped to a launched product and review period. Feedback and service
                  records are derived from CRM/Service context automatically.
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="text-xs text-muted-foreground">
              {record ? (
                <>
                  Innovation Health <span className="font-semibold">{health?.innovationHealthScore ?? 0}%</span> ·
                  Overall Score <span className="font-semibold">{summary?.overallInnovationScore ?? 0}/100</span>
                </>
              ) : (
                "Select a product, fill the sections, then open the cycle to start Opportunity Identification."
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {editable && (
                <ErpButton variant="outline" onClick={() => saveMut.mutate()} disabled={busy} aria-label="Save Draft" title="Save Draft">
                  {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
              {record && editable && allStagesDone && !submitted && (
                <ErpButton onClick={() => submitMut.mutate()} disabled={busy} aria-label="Submit for Review" title="Submit for Review">
                  {submitMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </ErpButton>
              )}
              {record && submitted && !decided && (
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
                      <FileText className="h-4 w-4" /> Generate Innovation Report
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
        {record && submitted && !decided && (
          <div className="card-soft flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-warning p-4">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-[oklch(0.45_0.15_75)]" />
              <div>
                <div className="text-sm font-bold text-foreground">
                  Awaiting Innovation Review Committee Decision
                </div>
                <div className="text-xs text-muted-foreground">
                  Approve to spawn the next release, approve with improvements, request revision, or reject.
                </div>
              </div>
            </div>
            <ErpButton variant="outline" onClick={() => setReviewOpen(true)}>
              Record Decision <ChevronRight className="h-4 w-4" />
            </ErpButton>
          </div>
        )}
        {record && status === "approved" && (
          <div className="card-soft flex flex-wrap items-center gap-2 border-l-4 border-l-success p-4 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="font-bold text-foreground">Cycle Approved.</span>
            <span className="text-muted-foreground">
              Next release {record.nextReleaseCode ?? "—"} created · Roadmap entry{" "}
              {record.roadmapEntryCode ?? "—"}. The cycle history remains open for the next period.
            </span>
          </div>
        )}
        {record && status === "revision_required" && (
          <div className="card-soft border-l-4 border-l-warning p-4 text-sm">
            <span className="font-bold text-foreground">Revision requested: </span>
            <span className="text-muted-foreground">
              {record.reviewComments || "Reassess customer feedback and revise the innovation plan."}
            </span>
          </div>
        )}

        {/* ================= Main + right sidebar ================= */}
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_330px]">
          <div className="space-y-5">
            {/* ROW 1: sections 1–5 */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {/* 1 — Innovation Overview */}
              <SectionCard n={1} title="Innovation Overview">
                <Field label="Innovation Theme">
                  <Select
                    value={form.overview.innovationTheme}
                    onChange={(v) => setOverview({ innovationTheme: v })}
                    options={lookups?.innovationThemes ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Improvement Objective" required>
                  <TextArea
                    value={form.overview.improvementObjective}
                    onChange={(v) => setOverview({ improvementObjective: v })}
                    rows={3}
                    disabled={!editable}
                    placeholder="Reduce average charging time and improve uptime for the DC-180 platform…"
                  />
                </Field>
                <Field label="Improvement Category">
                  <Select
                    value={form.overview.improvementCategory}
                    onChange={(v) => setOverview({ improvementCategory: v })}
                    options={lookups?.improvementCategories ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Strategic Alignment">
                  <StarRating
                    value={form.overview.strategicAlignment}
                    onChange={(v) => setOverview({ strategicAlignment: v })}
                    readOnly={!editable}
                    aria-label="Strategic alignment"
                  />
                </Field>
                <Field label="Business Priority">
                  <Select
                    value={form.overview.businessPriority}
                    onChange={(v) => setOverview({ businessPriority: v })}
                    options={lookups?.businessPriorities ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Expected Business Outcome">
                  <TextArea
                    value={form.overview.expectedBusinessOutcome}
                    onChange={(v) => setOverview({ expectedBusinessOutcome: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
              </SectionCard>

              {/* 2 — Feedback & Opportunity Analysis */}
              <SectionCard n={2} title="Feedback & Opportunity">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/40 p-2 text-center">
                    <div className="tabular text-lg font-bold text-foreground">
                      {(record?.feedback.feedbackRecordsAnalyzed ?? 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Feedback Analyzed</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2 text-center">
                    <div className="tabular text-lg font-bold text-foreground">
                      {(record?.feedback.serviceTicketsAnalyzed ?? 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Service Tickets</div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Counts are derived from CRM/Service context when the cycle is opened.
                </p>
                <Field label="Improvement Opportunities" required>
                  <TextArea
                    value={form.feedback.improvementOpportunities}
                    onChange={(v) => setFeedback({ improvementOpportunities: v })}
                    rows={3}
                    disabled={!editable}
                    placeholder="Customers request faster charging, better app reliability, remote diagnostics…"
                  />
                </Field>
                <Field label="Competitor Benchmark">
                  <TextArea
                    value={form.feedback.competitorBenchmark}
                    onChange={(v) => setFeedback({ competitorBenchmark: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Emerging Technologies">
                  <TextArea
                    value={form.feedback.emergingTechnologies}
                    onChange={(v) => setFeedback({ emergingTechnologies: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Market Intelligence">
                  <TextArea
                    value={form.feedback.marketIntelligence}
                    onChange={(v) => setFeedback({ marketIntelligence: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                {scores && (
                  <div className="rounded-lg border border-border bg-primary/5 p-2 text-center">
                    <div className="text-[10px] font-semibold text-muted-foreground">Opportunity Score</div>
                    <div className="tabular text-xl font-bold text-foreground">{scores.opportunityScore}</div>
                  </div>
                )}
              </SectionCard>

              {/* 3 — Innovation Planning */}
              <SectionCard n={3} title="Innovation Planning">
                <Field label="Innovation Type">
                  <Select
                    value={form.planning.innovationType}
                    onChange={(v) => setPlanning({ innovationType: v })}
                    options={lookups?.innovationTypes ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Improvement Scope">
                  <Select
                    value={form.planning.improvementScope}
                    onChange={(v) => setPlanning({ improvementScope: v })}
                    options={lookups?.improvementScopes ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Target KPIs" required>
                  <TextArea
                    value={form.planning.targetKpis}
                    onChange={(v) => setPlanning({ targetKpis: v })}
                    rows={2}
                    disabled={!editable}
                    placeholder="−20% charge time, +15% uptime, +10 NPS…"
                  />
                </Field>
                <Field label="Resource Requirements">
                  <TextArea
                    value={form.planning.resourceRequirements}
                    onChange={(v) => setPlanning({ resourceRequirements: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Estimated Budget">
                  <NumberInput
                    value={form.planning.estimatedBudget}
                    onChange={(v) => setPlanning({ estimatedBudget: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="Expected Timeline">
                  <Select
                    value={form.planning.expectedTimeline}
                    onChange={(v) => setPlanning({ expectedTimeline: v })}
                    options={lookups?.expectedTimelines ?? []}
                    disabled={!editable}
                  />
                </Field>
              </SectionCard>

              {/* 4 — Implementation Strategy */}
              <SectionCard n={4} title="Implementation Strategy">
                <Field label="Development Approach">
                  <Select
                    value={form.implementation.developmentApproach}
                    onChange={(v) => setImpl({ developmentApproach: v })}
                    options={lookups?.developmentApproaches ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Responsible Team">
                  <TagMulti
                    options={lookups?.teamMembers ?? []}
                    selected={form.implementation.responsibleTeam}
                    onToggle={(v) =>
                      setImpl({
                        responsibleTeam: form.implementation.responsibleTeam.includes(v)
                          ? form.implementation.responsibleTeam.filter((x) => x !== v)
                          : [...form.implementation.responsibleTeam, v],
                      })
                    }
                    disabled={!editable}
                  />
                </Field>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    Milestones{" "}
                    <span className="font-normal text-muted-foreground">(drive Execution Score)</span>
                  </span>
                  {record ? (
                    record.implementation.milestones.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No milestones defined.</p>
                    ) : (
                      <div className="space-y-1">
                        {record.implementation.milestones.map((m) => (
                          <label
                            key={m.id}
                            className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-2 py-1.5 text-xs"
                          >
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 accent-primary"
                              checked={m.completed}
                              disabled={!editable || busy}
                              onChange={() => milestoneMut.mutate(m.id)}
                            />
                            <span
                              className={cn(
                                "font-semibold",
                                m.completed ? "text-muted-foreground line-through" : "text-foreground",
                              )}
                            >
                              {m.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    )
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      A default milestone plan is created when the cycle opens.
                    </p>
                  )}
                </div>
                <Field label="Deployment Strategy">
                  <Select
                    value={form.implementation.deploymentStrategy}
                    onChange={(v) => setImpl({ deploymentStrategy: v })}
                    options={lookups?.deploymentStrategies ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Risk Assessment">
                  <TextArea
                    value={form.implementation.riskAssessment}
                    onChange={(v) => setImpl({ riskAssessment: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Rollout Plan">
                  <TextArea
                    value={form.implementation.rolloutPlan}
                    onChange={(v) => setImpl({ rolloutPlan: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
              </SectionCard>

              {/* 5 — Performance Measurement */}
              <SectionCard n={5} title="Performance Measurement">
                <Field label="Productivity Improvement">
                  <NumberInput
                    value={form.performance.productivityImprovement}
                    onChange={(v) => setPerf({ productivityImprovement: v })}
                    suffix="%"
                    disabled={!editable}
                  />
                </Field>
                <Field label="Cost Reduction">
                  <NumberInput
                    value={form.performance.costReduction}
                    onChange={(v) => setPerf({ costReduction: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="Revenue Growth">
                  <NumberInput
                    value={form.performance.revenueGrowth}
                    onChange={(v) => setPerf({ revenueGrowth: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="KPI Achievement">
                  <NumberInput
                    value={form.performance.kpiAchievement}
                    onChange={(v) => setPerf({ kpiAchievement: v })}
                    suffix="%"
                    disabled={!editable}
                  />
                </Field>
                <Field label="Customer Satisfaction">
                  <StarRating
                    value={form.performance.customerSatisfaction}
                    onChange={(v) => setPerf({ customerSatisfaction: v })}
                    readOnly={!editable}
                    aria-label="Customer satisfaction"
                  />
                </Field>
                <Field label="Product Quality Improvement">
                  <StarRating
                    value={form.performance.productQualityImprovement}
                    onChange={(v) => setPerf({ productQualityImprovement: v })}
                    readOnly={!editable}
                    aria-label="Product quality improvement"
                  />
                </Field>
                <Field label="Sustainability Impact">
                  <StarRating
                    value={form.performance.sustainabilityImpact}
                    onChange={(v) => setPerf({ sustainabilityImpact: v })}
                    readOnly={!editable}
                    aria-label="Sustainability impact"
                  />
                </Field>
              </SectionCard>
            </div>

            {/* ROW 2: sections 6–10 */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {/* 6 — Lessons Learned */}
              <SectionCard n={6} title="Lessons Learned">
                <Field label="Success Factors">
                  <TextArea
                    value={form.lessons.successFactors}
                    onChange={(v) => setLessons({ successFactors: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Challenges">
                  <TextArea
                    value={form.lessons.challenges}
                    onChange={(v) => setLessons({ challenges: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Root Cause Analysis">
                  <TextArea
                    value={form.lessons.rootCauseAnalysis}
                    onChange={(v) => setLessons({ rootCauseAnalysis: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Best Practices">
                  <TextArea
                    value={form.lessons.bestPractices}
                    onChange={(v) => setLessons({ bestPractices: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Knowledge Assets Created">
                  <TextArea
                    value={form.lessons.knowledgeAssetsCreated}
                    onChange={(v) => setLessons({ knowledgeAssetsCreated: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Future Recommendations">
                  <TextArea
                    value={form.lessons.futureRecommendations}
                    onChange={(v) => setLessons({ futureRecommendations: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
              </SectionCard>

              {/* 7 — Innovation Portfolio */}
              <SectionCard n={7} title="Innovation Portfolio">
                <Field label="Portfolio Category">
                  <Select
                    value={form.portfolio.portfolioCategory}
                    onChange={(v) => setPortfolio({ portfolioCategory: v })}
                    options={lookups?.portfolioCategories ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Strategic Value">
                  <StarRating
                    value={form.portfolio.strategicValue}
                    onChange={(v) => setPortfolio({ strategicValue: v })}
                    readOnly={!editable}
                    aria-label="Strategic value"
                  />
                </Field>
                <Field label="Technology Impact">
                  <StarRating
                    value={form.portfolio.technologyImpact}
                    onChange={(v) => setPortfolio({ technologyImpact: v })}
                    readOnly={!editable}
                    aria-label="Technology impact"
                  />
                </Field>
                <Field label="Business Impact">
                  <StarRating
                    value={form.portfolio.businessImpact}
                    onChange={(v) => setPortfolio({ businessImpact: v })}
                    readOnly={!editable}
                    aria-label="Business impact"
                  />
                </Field>
                <Field label="ESG Contribution">
                  <StarRating
                    value={form.portfolio.esgContribution}
                    onChange={(v) => setPortfolio({ esgContribution: v })}
                    readOnly={!editable}
                    aria-label="ESG contribution"
                  />
                </Field>
                <Field label="Portfolio Priority">
                  <Select
                    value={form.portfolio.portfolioPriority}
                    onChange={(v) => setPortfolio({ portfolioPriority: v })}
                    options={lookups?.portfolioPriorities ?? []}
                    disabled={!editable}
                  />
                </Field>
                {scores && (
                  <div className="rounded-lg border border-border bg-primary/5 p-2 text-center">
                    <div className="text-[10px] font-semibold text-muted-foreground">Innovation Score</div>
                    <div className="tabular text-xl font-bold text-foreground">{scores.innovationScore}</div>
                  </div>
                )}
              </SectionCard>

              {/* 8 — AI Continuous Innovation Assessment */}
              <SectionCard
                n={8}
                title="AI Innovation Assessment"
                accent="bg-[#7c5cff]/10 text-[#7c5cff]"
              >
                {ai ? (
                  <>
                    <div className="rounded-lg border border-border bg-primary/5 p-3 text-center">
                      <div className="text-[10px] font-semibold text-muted-foreground">
                        AI Innovation Score
                      </div>
                      <div className="font-display text-2xl font-bold tabular text-foreground">
                        {ai.aiInnovationScore}
                        <span className="text-sm text-muted-foreground"> /100</span>
                      </div>
                    </div>
                    <AIBlock label="Customer Insight" text={ai.customerInsight} />
                    <AIBlock label="Market Trend Analysis" text={ai.marketTrendAnalysis} />
                    <div className="rounded-lg bg-muted/40 p-3">
                      <div className="text-[11px] font-bold text-foreground">Estimated Business Value</div>
                      <div className="tabular text-sm font-bold text-foreground">
                        ₹{ai.estimatedBusinessValue.toLocaleString("en-IN")}
                      </div>
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

              {/* 9 — Innovation Summary */}
              <SectionCard n={9} title="Innovation Summary" accent="bg-[#22C55E]/10 text-[#22C55E]">
                {summary ? (
                  <>
                    <div className="space-y-2">
                      <ScoreRow label="Product Improvement" value={summary.productImprovementScore} />
                      <ScoreRow label="Customer Value" value={summary.customerValueScore} />
                      <ScoreRow label="Business Value" value={summary.businessValueScore} />
                      <ScoreRow label="Innovation Maturity" value={summary.innovationMaturityScore} />
                    </div>
                    <div className="rounded-lg border border-border bg-primary/5 p-3 text-center">
                      <div className="text-[10px] font-semibold text-muted-foreground">
                        Overall Innovation Score
                      </div>
                      <div className="font-display text-2xl font-bold tabular text-foreground">
                        {summary.overallInnovationScore}
                        <span className="text-sm text-muted-foreground"> /100</span>
                      </div>
                    </div>
                    <Field label="Recommendation" required>
                      <Select
                        value={form.recommendation}
                        onChange={(v) => set("recommendation", v)}
                        options={lookups?.recommendations ?? []}
                        disabled={!editable}
                      />
                    </Field>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    The summary scores are computed once the cycle is opened.
                  </p>
                )}
              </SectionCard>

              {/* 10 — Attachments */}
              <SectionCard n={10} title="Attachments">
                <div className="grid grid-cols-1 gap-1.5">
                  {form.attachments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No documents attached yet.</p>
                  ) : (
                    form.attachments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="truncate text-[11px] font-semibold text-foreground">
                            {a.filename}
                          </span>
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
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {editable && (
                  <div className="space-y-2 border-t border-border pt-2">
                    <select
                      className={cn(INPUT, "border-border")}
                      value={attachCategory}
                      onChange={(e) => setAttachCategory(e.target.value)}
                    >
                      {(lookups?.attachmentCategories ?? []).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ErpButton variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4" /> Upload File
                    </ErpButton>
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
                )}
              </SectionCard>
            </div>

            {/* ROW 3: sections 11–12 */}
            <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
              {/* 11 — Review & Approval TABLE */}
              <SectionCard n={11} title="Review & Approval">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="py-1.5 pr-3 font-semibold">Role</th>
                        <th className="py-1.5 pr-3 font-semibold">Person</th>
                        <th className="py-1.5 pr-3 font-semibold">Decision</th>
                        <th className="py-1.5 pr-3 font-semibold">Status</th>
                        <th className="py-1.5 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(record?.reviewRows ?? initialReviewPreview()).map((r) => (
                        <tr key={r.role} className="border-b border-border/60">
                          <td className="py-2 pr-3 text-xs font-semibold text-foreground">{r.role}</td>
                          <td className="py-2 pr-3 text-xs text-muted-foreground">{r.person}</td>
                          <td className="py-2 pr-3">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-bold",
                                r.decision === "Approved"
                                  ? "bg-success/10 text-success"
                                  : r.decision === "Rejected"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-warning/15 text-[oklch(0.45_0.15_75)]",
                              )}
                            >
                              {r.decision}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "py-2 pr-3 text-xs font-semibold",
                              r.status === "Approved"
                                ? "text-success"
                                : r.status === "In Review"
                                  ? "text-[#3B82F6]"
                                  : "text-muted-foreground",
                            )}
                          >
                            {r.status}
                          </td>
                          <td className="py-2 text-xs text-muted-foreground">
                            {r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-3">
                  <Field label="Approval Decision">
                    <TextInput value={record?.approvalDecision ?? "Pending"} disabled />
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
              <SectionCard n={12} title="System Information">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Created By</div>
                    <div className="text-xs font-semibold text-foreground">{record?.createdBy ?? "—"}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {record ? new Date(record.createdAt).toLocaleString("en-IN") : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Modified By</div>
                    <div className="text-xs font-semibold text-foreground">{record?.lastModifiedBy ?? "—"}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {record ? new Date(record.updatedAt).toLocaleString("en-IN") : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Workflow Stage</div>
                    <div className="pt-0.5">
                      <StatusBadge status={CI_STATUS_LABEL[status]} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Version</div>
                    <div className="text-xs font-semibold text-foreground">
                      {record ? `${record.version}.0` : "—"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
                  <HistoryLink
                    icon={<History className="h-3.5 w-3.5" />}
                    label="Audit Trail"
                    sub="View Log"
                    onClick={() => setHistoryOpen("audit")}
                    disabled={!record}
                  />
                  <HistoryLink
                    icon={<Activity className="h-3.5 w-3.5" />}
                    label="Activity History"
                    sub="View History"
                    onClick={() => setHistoryOpen("activity")}
                    disabled={!record}
                  />
                  <HistoryLink
                    icon={<FileText className="h-3.5 w-3.5" />}
                    label="Change History"
                    sub="View Changes"
                    onClick={() => setHistoryOpen("change")}
                    disabled={!record}
                  />
                  <HistoryLink
                    icon={<GitBranch className="h-3.5 w-3.5" />}
                    label="Workflow History"
                    sub="View Workflow"
                    onClick={() => setHistoryOpen("workflow")}
                    disabled={!record}
                  />
                </div>
              </SectionCard>
            </div>
          </div>

          {/* ------------------------------- Sidebar ------------------------------- */}
          <aside className="space-y-5 xl:sticky xl:top-4">
            {/* Innovation Health gauge (distinct from Overall Innovation Score) */}
            <section className="card-soft space-y-3 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" /> Innovation Health
              </h3>
              <div className="flex justify-center">
                <HealthRing value={health?.innovationHealthScore ?? 0} />
              </div>
              <p className="text-center text-[10px] text-muted-foreground">
                A live composite of opportunity, execution, impact and AI assessment — distinct from the
                section-9 Overall Innovation Score.
              </p>
              <div className="space-y-2 border-t border-border pt-3">
                <ContribBar label="Opportunity" value={health?.opportunityScore ?? 0} />
                <ContribBar label="Execution (milestones)" value={health?.executionScore ?? 0} />
                <ContribBar label="Impact" value={health?.impactScore ?? 0} />
                <ContribBar label="AI Assessment" value={health?.aiAssessment ?? 0} />
              </div>
            </section>

            {/* Stage progress */}
            <section className="card-soft space-y-2 p-4">
              <h3 className="text-sm font-bold text-foreground">Cycle Stages</h3>
              <ol className="space-y-1.5">
                {STAGE_ORDER.map((stage, i) => {
                  const st = record?.stages.find((s) => s.stage === stage);
                  const state = st?.status ?? (i === 0 ? "pending" : "pending");
                  return (
                    <li key={stage} className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          state === "completed"
                            ? "bg-success/15 text-success"
                            : state === "in_progress"
                              ? "bg-[#3B82F6]/15 text-[#3B82F6]"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {state === "completed" ? "✓" : i + 1}
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          state === "in_progress" ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {STAGE_LABEL[stage]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Key insights (derived) */}
            <section className="card-soft space-y-2 p-4">
              <h3 className="text-sm font-bold text-foreground">Key Insights</h3>
              {record && record.keyInsights.length > 0 ? (
                <ul className="space-y-1.5">
                  {record.keyInsights.map((k, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-0.5 text-primary">•</span>
                      {k}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Insights are derived from the feedback and AI assessment once the cycle opens.
                </p>
              )}
            </section>

            {/* Cycle history (navigable, non-terminal) */}
            <section className="card-soft space-y-2 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Repeat className="h-4 w-4 text-primary" /> Cycle History
              </h3>
              {record?.linkedProductName && (
                <p className="text-[10px] text-muted-foreground">{record.linkedProductName}</p>
              )}
              {cyclesQuery.data && cyclesQuery.data.length > 0 ? (
                <ol className="space-y-1">
                  {cyclesQuery.data.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() =>
                          navigate({
                            to: "/development/research-innovation/continuous-innovation/new",
                            search: { id: c.id },
                          })
                        }
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
                          c.id === record?.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-white hover:border-primary/40",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block font-semibold text-foreground">
                            Cycle #{c.cycleNumber} · {c.cycleId}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {CI_STATUS_LABEL[c.status as CIStatus] ?? c.status}
                          </span>
                        </span>
                        <span className="tabular text-xs font-bold text-foreground">
                          {c.overallInnovationScore || "—"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This is the product's first cycle. Approval spawns the next release and opens the
                  following cycle.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>

      {/* --------------------------- Committee Review dialog --------------------------- */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Innovation Review Committee</DialogTitle>
            <DialogDescription>
              {record
                ? `${record.innovationInitiative || record.cycleId} — overall ${summary?.overallInnovationScore ?? 0}/100, health ${health?.innovationHealthScore ?? 0}%.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Approval Decision" required>
              <Select
                value={reviewDecision}
                onChange={(v) => setReviewDecision(v as CIApprovalDecision)}
                options={lookups?.approvalDecisions ?? []}
              />
            </Field>
            <Field label="Review Comments">
              <TextArea value={reviewComments} onChange={(v) => setReviewComments(v.slice(0, 3000))} rows={3} />
            </Field>
            <div className="text-right text-[10px] text-muted-foreground">{reviewComments.length}/3000</div>
            <p className="rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground">
              Approving spawns the next product release and roadmap update — this fires only on approval, and
              the cycle history stays intact and navigable.
            </p>
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

      {/* ------------------------------ History dialogs (4 distinct) ------------------------------ */}
      <Dialog open={historyOpen !== null} onOpenChange={(o) => !o && setHistoryOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {historyKind === "audit" && "Audit Trail"}
              {historyKind === "activity" && "Activity History"}
              {historyKind === "change" && "Change History"}
              {historyKind === "workflow" && "Workflow History"}
            </DialogTitle>
            <DialogDescription>
              {record
                ? `${record.cycleId} — ${historyEntries.length} entr${historyEntries.length === 1 ? "y" : "ies"}.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {historyEntries.length === 0 && (
              <li className="text-xs text-muted-foreground">No entries in this view yet.</li>
            )}
            {[...historyEntries].reverse().map((a, i) => (
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
            <DialogTitle>AI Innovation Insights</DialogTitle>
            <DialogDescription>
              Computed from the section data — single source of truth for the Innovation Summary and the
              sidebar AI Assessment.
            </DialogDescription>
          </DialogHeader>
          {ai && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 rounded-lg bg-[#7c5cff]/10 p-3">
                <Sparkles className="h-4 w-4 text-[#7c5cff]" />
                <span className="text-xs">
                  AI Innovation Score{" "}
                  <span className="font-bold text-foreground">{ai.aiInnovationScore}/100</span> · Est. business
                  value{" "}
                  <span className="font-bold text-foreground">
                    ₹{ai.estimatedBusinessValue.toLocaleString("en-IN")}
                  </span>
                </span>
              </div>
              <AIBlock label="Customer Insight" text={ai.customerInsight} />
              <AIBlock label="Market Trend Analysis" text={ai.marketTrendAnalysis} />
              <AIBlock label="Predictive Improvement" text={ai.predictiveImprovement} />
              <AIBlock label="Risk Prediction" text={ai.riskPrediction} />
              <div className="rounded-lg border border-border p-3">
                <div className="mb-1.5 text-xs font-bold text-foreground">AI Innovation Roadmap</div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>
                    <span className="font-semibold text-foreground">Short-term:</span> {ai.roadmapShortTerm}
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Mid-term:</span> {ai.roadmapMidTerm}
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Long-term:</span> {ai.roadmapLongTerm}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function initialReviewPreview() {
  return [
    { role: "Innovation Manager", person: "Rohit Verma", decision: "Pending" as const, status: "Pending" as const, date: null },
    { role: "Product Manager", person: "Neha Sharma", decision: "Pending" as const, status: "Pending" as const, date: null },
    { role: "R&D Director", person: "Vikram Singh", decision: "Pending" as const, status: "Pending" as const, date: null },
    { role: "Operations Head", person: "Arjun Mehta", decision: "Pending" as const, status: "Pending" as const, date: null },
    { role: "CTO", person: "Dr. Anil Patel", decision: "Pending" as const, status: "Pending" as const, date: null },
    { role: "CEO", person: "Sanjay Kapoor", decision: "Pending" as const, status: "Pending" as const, date: null },
  ];
}
