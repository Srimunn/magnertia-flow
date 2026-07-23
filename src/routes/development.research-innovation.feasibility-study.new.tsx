import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  FlaskConical,
  Landmark,
  Loader2,
  MoreHorizontal,
  Paperclip,
  Rocket,
  Save,
  Send,
  Sparkles,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  FeasibilityStudyPageTabBar,
  FEASIBILITY_STATUS_LABEL,
} from "@/components/erp/FeasibilityStudyTabBar";
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
import { feasibilityStudyService } from "@/services";
import type {
  FeasibilityFormInput,
  FeasibilityPriority,
  FeasibilityStage,
  FeasibilityStatus,
  FeasibilityStudyRecord,
  FeasibilityTRL,
  FSApprovalDecision,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/feasibility-study/new")({
  head: () => ({ meta: [{ title: "Feasibility Study Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: FeasibilityFormPage,
});

/* --------------------------------- Consts --------------------------------- */
const EDITABLE: FeasibilityStatus[] = [
  "draft",
  "technical_feasibility",
  "market_feasibility",
  "financial_feasibility",
  "operational_feasibility",
  "compliance_risk",
  "conditional_approval",
  "revision_required",
];
const STAGE_LABEL: Record<FeasibilityStage, string> = {
  technical: "Technical Feasibility",
  market: "Market Feasibility",
  financial: "Financial Feasibility",
  operational: "Operational Feasibility",
  compliance_risk: "Compliance & Risk",
};
const TRL_LEVELS: FeasibilityTRL[] = [
  "TRL 1 - Basic Principles",
  "TRL 2 - Technology Concept",
  "TRL 3 - Experimental Proof",
  "TRL 4 - Validated in Lab",
  "TRL 5 - Validated in Relevant Environment",
  "TRL 6 - Demonstrated in Relevant Environment",
  "TRL 7 - System Prototype Demonstration",
  "TRL 8 - System Complete & Qualified",
  "TRL 9 - Proven in Operations",
];

const EMPTY: FeasibilityFormInput = {
  studyTitle: "",
  businessUnit: "Smart Mobility",
  department: "R&D Engineering",
  projectManager: "Rohit Verma",
  studyDate: new Date().toISOString().slice(0, 10),
  linkedProblemValidationId: null,
  executiveSummary: {
    studyObjective: "",
    businessNeed: "",
    opportunityDescription: "",
    expectedBenefits: "",
    keyAssumptions: "",
  },
  overallRecommendation: "",
  technical: {
    technologyDescription: "",
    trl: "TRL 4 - Validated in Lab",
    technologyMaturity: "Prototype",
    technicalComplexity: "High",
    requiredTechnologies: [],
    engineeringChallenges: "",
    prototypeRequired: true,
    infrastructureAvailability: "Partially Available",
  },
  market: {
    targetMarket: "",
    customerSegment: "",
    tam: 0,
    sam: 0,
    som: 0,
    marketGrowthRate: 0,
    customerDemand: 8,
    competitivePosition: 7,
  },
  financial: {
    estimatedDevelopmentCost: 0,
    capex: 0,
    opex: 0,
    opexAnnual: 0,
    revenueForecast: 0,
    grossMargin: 0,
    ebitda: 0,
    roi: 0,
    npv: 0,
    irr: 0,
    paybackPeriod: 0,
    breakEvenPoint: 0,
  },
  operational: {
    manufacturingCapability: 8,
    supplyChainReadiness: 8,
    resourceAvailability: 8,
    vendorAvailability: 7,
    facilityReadiness: 7,
    scalability: 7,
  },
  legal: {
    applicableRegulations: "",
    applicableStandards: [],
    certificationRequired: [],
    patentRisk: 6,
    freedomToOperate: "Available",
  },
  risk: {
    technicalRisk: 7,
    financialRisk: 5,
    marketRisk: 5,
    regulatoryRisk: 3,
    supplyChainRisk: 5,
    cybersecurityRisk: 3,
    esgRisk: 3,
  },
  resources: {
    projectTeam: [],
    internalExperts: [],
    externalExperts: [],
    equipmentRequired: "",
    laboratoryRequired: "",
    timeline: 12,
  },
  attachments: [],
  investmentPriority: "High",
  recommendedAction: "",
};

function recordToInput(r: FeasibilityStudyRecord): FeasibilityFormInput {
  return {
    studyTitle: r.studyTitle,
    businessUnit: r.businessUnit,
    department: r.department,
    projectManager: r.projectManager,
    studyDate: r.studyDate,
    linkedProblemValidationId: r.linkedProblemValidationId,
    executiveSummary: r.executiveSummary,
    overallRecommendation: r.overallRecommendation,
    technical: r.technical,
    market: r.market,
    financial: r.financial,
    operational: r.operational,
    legal: r.legal,
    risk: r.risk,
    resources: r.resources,
    attachments: r.attachments,
    investmentPriority: r.decisionSummary.investmentPriority,
    recommendedAction: r.decisionSummary.recommendedAction,
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
function Toggle(p: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={p.value}
      disabled={p.disabled}
      onClick={() => p.onChange(!p.value)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50",
        p.value ? "bg-primary" : "bg-muted-foreground/25",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          p.value ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
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
function ScoreTile({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "text-success" : value >= 50 ? "text-[#F59E0B]" : "text-destructive";
  const bg = value >= 70 ? "bg-success/10" : value >= 50 ? "bg-[#F59E0B]/10" : "bg-destructive/10";
  return (
    <div className={cn("flex items-center justify-between rounded-lg px-3 py-2", bg)}>
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <span className={cn("tabular text-sm font-bold", color)}>
        {value} <span className="text-[10px] font-normal text-muted-foreground">/100</span>
      </span>
    </div>
  );
}
function ScoreRing({ value, size = 128 }: { value: number; size?: number }) {
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
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/100</div>
        </div>
      </div>
    </div>
  );
}
function AISummaryRow({ label, value, pct }: { label: string; value: number; pct?: boolean }) {
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
function RiskBadge({ label, value }: { label: string; value: number }) {
  const band = value >= 6.5 ? "High" : value >= 4 ? "Medium" : "Low";
  const cls =
    band === "High"
      ? "bg-destructive/10 text-destructive"
      : band === "Medium"
        ? "bg-[#F59E0B]/10 text-[#F59E0B]"
        : "bg-success/10 text-success";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("rounded px-2 py-0.5 text-[11px] font-bold", cls)}>{band}</span>
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
function FeasibilityFormPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const lookupsQuery = useQuery({
    queryKey: ["feasibility-study", "lookups"],
    queryFn: () => feasibilityStudyService.fetchLookups(),
  });
  const recordQuery = useQuery({
    queryKey: ["feasibility-study", "record", id],
    queryFn: () => feasibilityStudyService.fetchRecord(id!),
    enabled: Boolean(id),
  });
  const problemsQuery = useQuery({
    queryKey: ["feasibility-study", "validated-problems"],
    queryFn: () => feasibilityStudyService.fetchValidatedProblems(),
    enabled: !id,
  });

  const lookups = lookupsQuery.data;
  const record = recordQuery.data ?? null;

  const [form, setForm] = useState<FeasibilityFormInput>(EMPTY);
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (record && loadedIdRef.current !== record.id) {
      loadedIdRef.current = record.id;
      setForm(recordToInput(record));
    }
  }, [record]);

  const status: FeasibilityStatus = record?.status ?? "draft";
  const editable = !record || EDITABLE.includes(status);
  const currentStage = record?.currentStage ?? "technical";
  const allStagesDone = record ? record.stages.every((s) => s.status === "completed") : false;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<FSApprovalDecision>("Approved");
  const [reviewFunding, setReviewFunding] = useState<"Pending" | "Approved" | "Rejected">(
    "Approved",
  );
  const [reviewComments, setReviewComments] = useState("");
  const [attachCategory, setAttachCategory] = useState("Technical Report");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["feasibility-study"] });

  const saveMut = useMutation({
    mutationFn: () => feasibilityStudyService.saveDraft(form, record?.id),
    onSuccess: (r) => {
      invalidate();
      toast.success(
        record ? "Feasibility study saved." : `Feasibility Study ${r.feasibilityId} created.`,
      );
      if (!record) {
        navigate({
          to: "/development/research-innovation/feasibility-study/new",
          search: { id: r.id },
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const stageMut = useMutation({
    mutationFn: () => feasibilityStudyService.completeStage(record!.id, currentStage),
    onSuccess: () => {
      invalidate();
      toast.success(`${STAGE_LABEL[currentStage]} completed — AI assessment updated.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const submitMut = useMutation({
    mutationFn: () => feasibilityStudyService.submitForReview(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Feasibility report submitted for executive review.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reviewMut = useMutation({
    mutationFn: () =>
      feasibilityStudyService.review({
        id: record!.id,
        decision: reviewDecision,
        funding: reviewFunding,
        comments: reviewComments || undefined,
        conditions: reviewDecision === "Approved with Conditions" ? reviewComments : undefined,
      }),
    onSuccess: (r) => {
      invalidate();
      setReviewOpen(false);
      if (r.status === "approved")
        toast.success(`Approved — PoC project ${r.pocProjectCode} auto-created.`);
      else if (r.status === "conditional_approval")
        toast.success("Approved with conditions — complete required actions.");
      else if (r.status === "rejected") toast.success("Feasibility study rejected and archived.");
      else toast.success("Revision required — update the study.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reportMut = useMutation({
    mutationFn: () => feasibilityStudyService.generateReport(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Feasibility report generated — scores refreshed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy =
    saveMut.isPending ||
    stageMut.isPending ||
    submitMut.isPending ||
    reviewMut.isPending ||
    reportMut.isPending;

  const set = <K extends keyof FeasibilityFormInput>(key: K, value: FeasibilityFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setExec = (patch: Partial<FeasibilityFormInput["executiveSummary"]>) =>
    setForm((f) => ({ ...f, executiveSummary: { ...f.executiveSummary, ...patch } }));
  const setTech = (patch: Partial<FeasibilityFormInput["technical"]>) =>
    setForm((f) => ({ ...f, technical: { ...f.technical, ...patch } }));
  const setMarket = (patch: Partial<FeasibilityFormInput["market"]>) =>
    setForm((f) => ({ ...f, market: { ...f.market, ...patch } }));
  const setFinancial = (patch: Partial<FeasibilityFormInput["financial"]>) =>
    setForm((f) => ({ ...f, financial: { ...f.financial, ...patch } }));
  const setOperational = (patch: Partial<FeasibilityFormInput["operational"]>) =>
    setForm((f) => ({ ...f, operational: { ...f.operational, ...patch } }));
  const setLegal = (patch: Partial<FeasibilityFormInput["legal"]>) =>
    setForm((f) => ({ ...f, legal: { ...f.legal, ...patch } }));
  const setRisk = (patch: Partial<FeasibilityFormInput["risk"]>) =>
    setForm((f) => ({ ...f, risk: { ...f.risk, ...patch } }));
  const setResources = (patch: Partial<FeasibilityFormInput["resources"]>) =>
    setForm((f) => ({ ...f, resources: { ...f.resources, ...patch } }));

  const applyProblem = (pvId: string) => {
    const pv = (problemsQuery.data ?? []).find((p) => p.id === pvId);
    set("linkedProblemValidationId", pvId || null);
    if (!pv) return;
    setForm((f) => ({
      ...f,
      linkedProblemValidationId: pvId,
      studyTitle: f.studyTitle || pv.problemTitle,
      executiveSummary: {
        ...f.executiveSummary,
        businessNeed: f.executiveSummary.businessNeed || pv.problemDescription,
        opportunityDescription: f.executiveSummary.opportunityDescription || pv.problemDescription,
      },
      market: {
        ...f.market,
        customerSegment: f.market.customerSegment || pv.customerSegment,
        tam: f.market.tam || pv.marketSize,
      },
    }));
    toast.success(`Context loaded from ${pv.problemValidationCode}.`);
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
  const scores = record?.sectionScores ?? null;
  const decision = record?.decisionSummary ?? null;
  const overall = decision?.overallFeasibilityScore ?? 0;
  const feasLabel =
    overall >= 70 ? "High Feasibility" : overall >= 50 ? "Moderate Feasibility" : "Low Feasibility";
  const budgetRequired =
    form.financial.estimatedDevelopmentCost + form.financial.capex + form.financial.opex;

  if (id && recordQuery.isLoading) {
    return (
      <AppShell
        title="Feasibility Study Form"
        breadcrumb="Research & Innovation Development · Feasibility Study"
        description="Feasibility Study Form"
        tabs={<FeasibilityStudyPageTabBar />}
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
      title="Feasibility Study Form"
      breadcrumb="Research & Innovation Development · Feasibility Study"
      description="Feasibility Study Form"
      tabs={<FeasibilityStudyPageTabBar />}
    >
      <div className="space-y-5">
        {/* ------------------------- Record header bar ------------------------- */}
        <div className="card-soft space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
            <Field label="Feasibility ID">
              <TextInput value={record?.feasibilityId ?? "Auto"} disabled />
            </Field>
            <Field label="Form Code">
              <TextInput value={record?.formCode ?? "Auto"} disabled />
            </Field>
            <Field label="Study Title" required>
              <TextInput
                value={form.studyTitle}
                onChange={(v) => set("studyTitle", v)}
                disabled={!editable}
                placeholder="e.g. Autonomous Robotic Wireless EV Charging Station"
              />
            </Field>
            <Field label="Linked Portfolio">
              <div className="flex h-[38px] items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 text-xs font-semibold text-foreground">
                {record?.linkedPortfolioCode ? (
                  <>
                    {record.linkedPortfolioCode}{" "}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </Field>
            <Field label="Business Unit">
              <Select
                value={form.businessUnit}
                onChange={(v) => set("businessUnit", v)}
                options={lookups?.businessUnits ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Study Date" required>
              <input
                type="date"
                className={cn(INPUT, "border-border")}
                value={form.studyDate}
                disabled={!editable}
                onChange={(e) => set("studyDate", e.target.value)}
              />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Status</span>
              <div className="flex h-[38px] items-center">
                <StatusBadge status={FEASIBILITY_STATUS_LABEL[status]} />
              </div>
            </div>
          </div>

          {/* Row 2 — linked-record chips */}
          <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-3 xl:grid-cols-5">
            <LinkChip
              label="Linked Problem Validation"
              code={record?.linkedProblemValidationCode}
            />
            <LinkChip
              label="Linked Technology Scouting"
              code={record?.linkedTechnologyScoutingCode}
            />
            <LinkChip label="Linked Research Project" code={record?.linkedResearchProjectCode} />
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
          </div>

          {!record && (
            <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-[1fr_auto]">
              <Field label="Source Validated Problem (required)" required>
                <select
                  className={cn(INPUT, "border-border")}
                  value={form.linkedProblemValidationId ?? ""}
                  onChange={(e) => applyProblem(e.target.value)}
                >
                  <option value="">Select a validated problem…</option>
                  {(problemsQuery.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.problemValidationCode} — {p.problemTitle}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <span className="pb-2 text-xs text-muted-foreground">
                  A study can only be created from a validated Problem. Portfolio, technology and
                  research context is retrieved automatically.
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
                "Select a validated Problem, fill the sections, then create the study to start Stage 1."
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
                  {record ? "Save Draft" : "Create Feasibility Study"}
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
              {record && status === "under_review" && (
                <ErpButton onClick={() => setReviewOpen(true)} disabled={busy}>
                  <Landmark className="h-4 w-4" /> Record Executive Decision
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
                      <FileText className="h-4 w-4" /> Generate Feasibility Report
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
        {record && status === "under_review" && (
          <div className="card-soft flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-warning p-4">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-[oklch(0.45_0.15_75)]" />
              <div>
                <div className="text-sm font-bold text-foreground">
                  Awaiting Executive Innovation Committee Review
                </div>
                <div className="text-xs text-muted-foreground">
                  Approve (auto-creates PoC), approve with conditions, request revision, or reject.
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
            <span className="font-bold text-foreground">Conditions: </span>
            <span className="text-muted-foreground">{record.reviewConditions}</span>
          </div>
        )}
        {record && status === "revision_required" && record.reviewComments && (
          <div className="card-soft border-l-4 border-l-warning p-4 text-sm">
            <span className="font-bold text-foreground">Review feedback: </span>
            <span className="text-muted-foreground">{record.reviewComments}</span>
          </div>
        )}
        {record && status === "approved" && record.pocProjectCode && (
          <div className="card-soft flex items-center gap-2 border-l-4 border-l-success p-4 text-sm">
            <Rocket className="h-4 w-4 text-success" />
            <span className="font-bold text-foreground">
              Proof of Concept {record.pocProjectCode} auto-created.
            </span>
            <span className="text-muted-foreground">Project Manager notified.</span>
          </div>
        )}

        {/* ------------------------------ Main grid ------------------------------ */}
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_330px]">
          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {/* 1 — Executive Summary */}
            <SectionCard n={1} title="Executive Summary">
              <Field label="Study Objective" required>
                <TextArea
                  value={form.executiveSummary.studyObjective}
                  onChange={(v) => setExec({ studyObjective: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Evaluate the technical, commercial, financial and operational feasibility of…"
                />
              </Field>
              <Field label="Business Need" required>
                <TextArea
                  value={form.executiveSummary.businessNeed}
                  onChange={(v) => setExec({ businessNeed: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Opportunity Description" required>
                <TextArea
                  value={form.executiveSummary.opportunityDescription}
                  onChange={(v) => setExec({ opportunityDescription: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Expected Benefits" required>
                <TextArea
                  value={form.executiveSummary.expectedBenefits}
                  onChange={(v) => setExec({ expectedBenefits: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <Field label="Key Assumptions" required>
                <TextArea
                  value={form.executiveSummary.keyAssumptions}
                  onChange={(v) => setExec({ keyAssumptions: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
            </SectionCard>

            {/* 2 — Technical Feasibility */}
            <SectionCard n={2} title="Technical Feasibility">
              <Field label="Technology Description" required>
                <TextArea
                  value={form.technical.technologyDescription}
                  onChange={(v) => setTech({ technologyDescription: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="TRL">
                  <Select
                    value={form.technical.trl}
                    onChange={(v) => setTech({ trl: v as FeasibilityTRL })}
                    options={TRL_LEVELS}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Technology Maturity" required>
                  <Select
                    value={form.technical.technologyMaturity}
                    onChange={(v) => setTech({ technologyMaturity: v })}
                    options={lookups?.technologyMaturities ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <Field label="Technical Complexity" required>
                <Select
                  value={form.technical.technicalComplexity}
                  onChange={(v) => setTech({ technicalComplexity: v })}
                  options={lookups?.technicalComplexities ?? []}
                  disabled={!editable}
                />
              </Field>
              <Field label="Required Technologies" required>
                <TagMulti
                  options={lookups?.requiredTechnologies ?? []}
                  selected={form.technical.requiredTechnologies}
                  onToggle={(v) =>
                    setTech({
                      requiredTechnologies: form.technical.requiredTechnologies.includes(v)
                        ? form.technical.requiredTechnologies.filter((x) => x !== v)
                        : [...form.technical.requiredTechnologies, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <Field label="Engineering Challenges" required>
                <TextArea
                  value={form.technical.engineeringChallenges}
                  onChange={(v) => setTech({ engineeringChallenges: v })}
                  rows={2}
                  disabled={!editable}
                />
              </Field>
              <div className="grid grid-cols-2 items-end gap-3">
                <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                  <span className="text-xs font-semibold text-foreground">Prototype Required</span>
                  <Toggle
                    value={form.technical.prototypeRequired}
                    onChange={(v) => setTech({ prototypeRequired: v })}
                    disabled={!editable}
                  />
                </div>
                <Field label="Infrastructure Availability" required>
                  <Select
                    value={form.technical.infrastructureAvailability}
                    onChange={(v) => setTech({ infrastructureAvailability: v })}
                    options={lookups?.infrastructureAvailability ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
              {scores && (
                <ScoreTile
                  label="Technical Feasibility Score"
                  value={scores.technicalFeasibilityScore}
                />
              )}
            </SectionCard>

            {/* 3 — Market Feasibility */}
            <SectionCard n={3} title="Market Feasibility">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Target Market" required>
                  <Select
                    value={form.market.targetMarket}
                    onChange={(v) => setMarket({ targetMarket: v })}
                    options={lookups?.targetMarkets ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Customer Segment" required>
                  <Select
                    value={form.market.customerSegment}
                    onChange={(v) => setMarket({ customerSegment: v })}
                    options={lookups?.customerSegments ?? []}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field label="TAM">
                  <NumberInput
                    value={form.market.tam}
                    onChange={(v) => setMarket({ tam: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="SAM">
                  <NumberInput
                    value={form.market.sam}
                    onChange={(v) => setMarket({ sam: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="SOM">
                  <NumberInput
                    value={form.market.som}
                    onChange={(v) => setMarket({ som: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
              </div>
              <Field label="Market Growth Rate" required>
                <NumberInput
                  value={form.market.marketGrowthRate}
                  onChange={(v) => setMarket({ marketGrowthRate: v })}
                  suffix="%"
                  disabled={!editable}
                />
              </Field>
              <StarRow
                label="Customer Demand"
                value={form.market.customerDemand}
                onChange={(v) => setMarket({ customerDemand: v })}
                editable={editable}
              />
              <StarRow
                label="Competitive Position"
                value={form.market.competitivePosition}
                onChange={(v) => setMarket({ competitivePosition: v })}
                editable={editable}
              />
              {scores && (
                <ScoreTile label="Market Feasibility Score" value={scores.marketFeasibilityScore} />
              )}
            </SectionCard>

            {/* 4 — Financial Feasibility */}
            <SectionCard
              n={4}
              title="Financial Feasibility"
              className="lg:col-span-2 2xl:col-span-1"
            >
              <div className="grid grid-cols-2 gap-2">
                <Field label="Est. Dev. Cost">
                  <NumberInput
                    value={form.financial.estimatedDevelopmentCost}
                    onChange={(v) => setFinancial({ estimatedDevelopmentCost: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="CAPEX">
                  <NumberInput
                    value={form.financial.capex}
                    onChange={(v) => setFinancial({ capex: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="OPEX">
                  <NumberInput
                    value={form.financial.opex}
                    onChange={(v) => setFinancial({ opex: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="OPEX (Annual)">
                  <NumberInput
                    value={form.financial.opexAnnual}
                    onChange={(v) => setFinancial({ opexAnnual: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
                <Field label="Revenue Forecast (Yr 5)">
                  <NumberInput
                    value={form.financial.revenueForecast}
                    onChange={(v) => setFinancial({ revenueForecast: v })}
                    prefix="₹"
                    disabled={!editable}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/30 p-2.5">
                <Metric label="Gross Margin" value={`${record?.financial.grossMargin ?? 0}%`} />
                <Metric label="EBITDA" value={`${record?.financial.ebitda ?? 0}%`} />
                <Metric label="ROI" value={`${record?.financial.roi ?? 0}%`} />
                <Metric
                  label="NPV"
                  value={record ? formatCurrency(record.financial.npv, true) : "—"}
                />
                <Metric label="IRR" value={`${record?.financial.irr ?? 0}%`} />
                <Metric label="Payback" value={`${record?.financial.paybackPeriod ?? 0} mo`} />
                <Metric label="Break-even" value={`${record?.financial.breakEvenPoint ?? 0} mo`} />
              </div>
            </SectionCard>

            {/* 5 — Operational Feasibility */}
            <SectionCard n={5} title="Operational Feasibility">
              <div className="space-y-2">
                <StarRow
                  label="Manufacturing Capability"
                  value={form.operational.manufacturingCapability}
                  onChange={(v) => setOperational({ manufacturingCapability: v })}
                  editable={editable}
                />
                <StarRow
                  label="Supply Chain Readiness"
                  value={form.operational.supplyChainReadiness}
                  onChange={(v) => setOperational({ supplyChainReadiness: v })}
                  editable={editable}
                />
                <StarRow
                  label="Resource Availability"
                  value={form.operational.resourceAvailability}
                  onChange={(v) => setOperational({ resourceAvailability: v })}
                  editable={editable}
                />
                <StarRow
                  label="Vendor Availability"
                  value={form.operational.vendorAvailability}
                  onChange={(v) => setOperational({ vendorAvailability: v })}
                  editable={editable}
                />
                <StarRow
                  label="Facility Readiness"
                  value={form.operational.facilityReadiness}
                  onChange={(v) => setOperational({ facilityReadiness: v })}
                  editable={editable}
                />
                <StarRow
                  label="Scalability"
                  value={form.operational.scalability}
                  onChange={(v) => setOperational({ scalability: v })}
                  editable={editable}
                />
              </div>
              {scores && <ScoreTile label="Operational Score" value={scores.operationalScore} />}
            </SectionCard>

            {/* 6 — Legal & Regulatory Feasibility */}
            <SectionCard n={6} title="Legal & Regulatory Feasibility">
              <Field label="Applicable Regulations" required>
                <TextArea
                  value={form.legal.applicableRegulations}
                  onChange={(v) => setLegal({ applicableRegulations: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="AIS-138, IEC 61851, BIS, EMC, Safety"
                />
              </Field>
              <Field label="Applicable Standards" required>
                <TagMulti
                  options={lookups?.applicableStandards ?? []}
                  selected={form.legal.applicableStandards}
                  onToggle={(v) =>
                    setLegal({
                      applicableStandards: form.legal.applicableStandards.includes(v)
                        ? form.legal.applicableStandards.filter((x) => x !== v)
                        : [...form.legal.applicableStandards, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <Field label="Certification Required" required>
                <TagMulti
                  options={lookups?.certifications ?? []}
                  selected={form.legal.certificationRequired}
                  onToggle={(v) =>
                    setLegal({
                      certificationRequired: form.legal.certificationRequired.includes(v)
                        ? form.legal.certificationRequired.filter((x) => x !== v)
                        : [...form.legal.certificationRequired, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <StarRow
                label="Patent Risk"
                value={form.legal.patentRisk}
                onChange={(v) => setLegal({ patentRisk: v })}
                editable={editable}
              />
              <Field label="Freedom to Operate" required>
                <Select
                  value={form.legal.freedomToOperate}
                  onChange={(v) => setLegal({ freedomToOperate: v })}
                  options={lookups?.freedomToOperate ?? []}
                  disabled={!editable}
                />
              </Field>
              {scores && <ScoreTile label="Compliance Score" value={scores.complianceScore} />}
            </SectionCard>

            {/* 7 — Risk Assessment */}
            <SectionCard n={7} title="Risk Assessment">
              <div className="space-y-1.5">
                <RiskBadge label="Technical Risk" value={form.risk.technicalRisk} />
                <RiskBadge label="Financial Risk" value={form.risk.financialRisk} />
                <RiskBadge label="Market Risk" value={form.risk.marketRisk} />
                <RiskBadge label="Regulatory Risk" value={form.risk.regulatoryRisk} />
                <RiskBadge label="Supply Chain Risk" value={form.risk.supplyChainRisk} />
                <RiskBadge label="Cybersecurity Risk" value={form.risk.cybersecurityRisk} />
                <RiskBadge label="ESG Risk" value={form.risk.esgRisk} />
              </div>
              {editable && (
                <div className="space-y-1.5 border-t border-border pt-2">
                  {(
                    [
                      ["Technical", "technicalRisk"],
                      ["Financial", "financialRisk"],
                      ["Market", "marketRisk"],
                      ["Regulatory", "regulatoryRisk"],
                      ["Supply Chain", "supplyChainRisk"],
                      ["Cybersecurity", "cybersecurityRisk"],
                      ["ESG", "esgRisk"],
                    ] as const
                  ).map(([label, key]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground">{label}</span>
                      <StarRating
                        value={form.risk[key]}
                        onChange={(v) => setRisk({ [key]: v })}
                        invert
                        size="sm"
                        aria-label={`${label} risk`}
                      />
                    </div>
                  ))}
                </div>
              )}
              {scores && <ScoreTile label="Overall Risk Score" value={scores.overallRiskScore} />}
            </SectionCard>

            {/* 8 — Resource Planning */}
            <SectionCard n={8} title="Resource Planning">
              <Field label="Project Team">
                <TagMulti
                  options={lookups?.teamMembers ?? []}
                  selected={form.resources.projectTeam}
                  onToggle={(v) =>
                    setResources({
                      projectTeam: form.resources.projectTeam.includes(v)
                        ? form.resources.projectTeam.filter((x) => x !== v)
                        : [...form.resources.projectTeam, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <Field label="Internal Experts">
                <TagMulti
                  options={lookups?.internalExperts ?? []}
                  selected={form.resources.internalExperts}
                  onToggle={(v) =>
                    setResources({
                      internalExperts: form.resources.internalExperts.includes(v)
                        ? form.resources.internalExperts.filter((x) => x !== v)
                        : [...form.resources.internalExperts, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <Field label="External Experts">
                <TagMulti
                  options={lookups?.externalExperts ?? []}
                  selected={form.resources.externalExperts}
                  onToggle={(v) =>
                    setResources({
                      externalExperts: form.resources.externalExperts.includes(v)
                        ? form.resources.externalExperts.filter((x) => x !== v)
                        : [...form.resources.externalExperts, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <Field label="Equipment Required" required>
                <TextArea
                  value={form.resources.equipmentRequired}
                  onChange={(v) => setResources({ equipmentRequired: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Robotic Arm, Coil WPT Tester, HIL System"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Laboratory Required">
                  <Select
                    value={form.resources.laboratoryRequired}
                    onChange={(v) => setResources({ laboratoryRequired: v })}
                    options={lookups?.laboratories ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Timeline" required>
                  <NumberInput
                    value={form.resources.timeline}
                    onChange={(v) => setResources({ timeline: v })}
                    suffix="mo"
                    disabled={!editable}
                  />
                </Field>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-xs font-semibold text-foreground">Budget Required</span>
                <span className="tabular text-sm font-bold text-foreground">
                  {formatCurrency(budgetRequired, true)}
                </span>
              </div>
            </SectionCard>

            {/* 9 — AI Feasibility Assessment */}
            <SectionCard
              n={9}
              title="AI Feasibility Assessment"
              accent="bg-[#7c5cff]/10 text-[#7c5cff]"
            >
              {ai ? (
                <>
                  <div className="grid grid-cols-2 gap-1.5">
                    <MiniScore label="AI Novelty" value={ai.aiNoveltyScore} />
                    <MiniScore label="AI Technical Merit" value={ai.aiTechnicalMerit} />
                    <MiniScore label="AI Commercial" value={ai.aiCommercialPotential} />
                    <MiniScore label="AI Publication" value={ai.aiPublicationPotential} />
                    <MiniScore label="AI Patent" value={ai.aiPatentPotential} />
                    <MiniScore label="AI Research Impact" value={ai.aiResearchImpactScore} />
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Recommendations
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {ai.suggestedImprovements}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  AI assessment is generated on creation and refreshed as each stage completes.
                </p>
              )}
            </SectionCard>

            {/* 10 — Attachments */}
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
              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
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
                        {r.status === "reviewed" ? "Reviewed" : "Pending"}
                      </div>
                    </div>
                  </div>
                ))}
                {!record && (
                  <p className="text-xs text-muted-foreground sm:col-span-3 xl:col-span-5">
                    Reviewers are assigned when the study is created.
                  </p>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Approval Decision">
                  <TextInput value={record?.approvalDecision ?? "Under Review"} disabled />
                </Field>
                <Field label="Funding Approval">
                  <TextInput value={record?.fundingApproval ?? "Pending"} disabled />
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
          </div>

          {/* ------------------------------- Sidebar ------------------------------- */}
          <aside className="space-y-5 xl:sticky xl:top-4">
            <div className="card-soft space-y-3 p-4">
              <h3 className="text-sm font-bold text-foreground">Overall Feasibility Score</h3>
              {record ? (
                <div className="flex items-center gap-4">
                  <ScoreRing value={overall} />
                  <div className="space-y-1.5">
                    <div
                      className={cn(
                        "text-sm font-bold",
                        overall >= 70
                          ? "text-success"
                          : overall >= 50
                            ? "text-[#F59E0B]"
                            : "text-muted-foreground",
                      )}
                    >
                      {feasLabel}
                    </div>
                    <StarRating
                      value={Math.round(overall / 10)}
                      readOnly
                      size="sm"
                      showValue={false}
                    />
                    <div className="text-xs text-muted-foreground">
                      Priority Level{" "}
                      <span className="font-bold text-foreground">
                        {decision?.investmentPriority ?? "—"}
                      </span>
                    </div>
                    <button
                      className="text-[11px] font-semibold text-primary hover:underline"
                      onClick={() => setInsightsOpen(true)}
                    >
                      View Score Details →
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Create the study to compute the feasibility score.
                </p>
              )}
            </div>

            <div className="card-soft space-y-3 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Brain className="h-4 w-4 text-primary" /> AI Feasibility Summary
              </h3>
              {ai ? (
                <>
                  <div className="space-y-2">
                    <AISummaryRow label="AI Technical Score" value={ai.aiTechnicalScore} />
                    <AISummaryRow label="AI Financial Score" value={ai.aiFinancialScore} />
                    <AISummaryRow label="AI Market Score" value={ai.aiMarketScore} />
                    <AISummaryRow label="AI Operational Score" value={ai.aiOperationalScore} />
                    <AISummaryRow label="AI Risk Score" value={ai.aiRiskScore} />
                    <AISummaryRow
                      label="AI Success Probability"
                      value={ai.aiSuccessProbability}
                      pct
                    />
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {ai.recommendation}
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
                  The AI summary mirrors section 9 once the study is created.
                </p>
              )}
            </div>

            {record && (
              <div
                className={cn(
                  "card-soft space-y-1 border-l-4 p-4",
                  status === "approved"
                    ? "border-l-success"
                    : overall >= 60
                      ? "border-l-primary"
                      : "border-l-warning",
                )}
              >
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Recommended Action
                </h3>
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  {decision?.recommendedAction}
                  {status === "approved" && <CheckCircle2 className="h-4 w-4 text-success" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overall >= 72
                    ? "This project shows high feasibility across all key parameters."
                    : overall >= 55
                      ? "Feasible with focused improvements before investment."
                      : "Revise the study before proceeding."}
                </p>
              </div>
            )}

            <div className="card-soft space-y-2 p-4">
              <h3 className="text-sm font-bold text-foreground">Quick Actions</h3>
              <QuickAction
                icon={<FileText className="h-4 w-4" />}
                label="Generate Feasibility Report"
                onClick={() => reportMut.mutate()}
                disabled={!record || busy}
              />
              <QuickAction
                icon={<Wallet className="h-4 w-4" />}
                label="Open Financial Model"
                onClick={() => toast.success("Opening financial model.")}
                disabled={!record}
              />
              <QuickAction
                icon={<Activity className="h-4 w-4" />}
                label="Risk Analysis Report"
                onClick={() => toast.success("Generating risk analysis report.")}
                disabled={!record}
              />
              <QuickAction
                icon={<FlaskConical className="h-4 w-4" />}
                label="Resource Plan"
                onClick={() => toast.success("Opening resource plan.")}
                disabled={!record}
              />
              <QuickAction
                icon={<Rocket className="h-4 w-4" />}
                label="Create PoC Project"
                onClick={() => {
                  if (status !== "approved")
                    return toast.error(
                      "Create PoC Project is available once the study is Approved.",
                    );
                  toast.success(
                    record?.pocProjectCode
                      ? `PoC project ${record.pocProjectCode} already created on approval.`
                      : "Creating PoC project.",
                  );
                }}
                disabled={!record || status !== "approved"}
                highlight={status === "approved"}
              />
            </div>

            {record && (
              <div className="card-soft space-y-2 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="font-semibold text-foreground">{record.createdBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Modified By</span>
                  <span className="font-semibold text-foreground">{record.lastModifiedBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Workflow Stage</span>
                  <StatusBadge status={FEASIBILITY_STATUS_LABEL[status]} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-semibold text-foreground">{record.version}.0</span>
                </div>
                <button
                  className="w-full rounded-lg border border-border py-1.5 text-center font-semibold text-primary hover:bg-muted/40"
                  onClick={() => setHistoryOpen(true)}
                >
                  View Activity History
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* --------------------------- Executive Review dialog --------------------------- */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Executive Innovation Committee Review</DialogTitle>
            <DialogDescription>
              {record
                ? `${record.studyTitle || record.feasibilityId} — feasibility ${overall}/100, success ${ai?.aiSuccessProbability ?? 0}%.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Approval Decision" required>
              <Select
                value={reviewDecision}
                onChange={(v) => setReviewDecision(v as FSApprovalDecision)}
                options={lookups?.approvalDecisions ?? []}
              />
            </Field>
            <Field label="Funding Approval">
              <Select
                value={reviewFunding}
                onChange={(v) => setReviewFunding(v as "Pending" | "Approved" | "Rejected")}
                options={lookups?.fundingApprovals ?? []}
              />
            </Field>
            <Field
              label={
                reviewDecision === "Approved with Conditions" ? "Conditions" : "Review Comments"
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
              {record ? `${record.feasibilityId} — full audit trail.` : ""}
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
            <DialogTitle>Feasibility Score Details & AI Insights</DialogTitle>
            <DialogDescription>
              Computed from the section data — single source of truth.
            </DialogDescription>
          </DialogHeader>
          {decision && ai && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <MiniScore label="Technical Score" value={decision.technicalScore} />
                <MiniScore label="Commercial Score" value={decision.commercialScore} />
                <MiniScore label="Financial Score" value={decision.financialScore} />
                <MiniScore label="Operational Score" value={decision.operationalScore} />
                <MiniScore label="Strategic Score" value={decision.strategicScore} />
                <MiniScore label="Overall Feasibility" value={decision.overallFeasibilityScore} />
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">AI Recommendation</div>
                <p className="text-xs text-muted-foreground">{ai.recommendation}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">Suggested Improvements</div>
                <p className="text-xs text-muted-foreground">{ai.suggestedImprovements}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Investment Priority:{" "}
                <span className="font-bold text-foreground">{decision.investmentPriority}</span> ·
                Recommended Action:{" "}
                <span className="font-bold text-foreground">{decision.recommendedAction}</span>
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
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="tabular text-sm font-bold text-foreground">{value}</div>
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
