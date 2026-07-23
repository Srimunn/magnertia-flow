import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Save,
  Send,
  MoreHorizontal,
  Download,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Circle,
  Loader2,
  FileText,
  Users,
  ClipboardCheck,
  BarChart3,
  Cpu,
  Briefcase,
  Sparkles,
  ListChecks,
  ShieldCheck,
  UploadCloud,
  UserPlus,
  FilePlus2,
  FlaskConical,
  History as HistoryIcon,
  Check,
  Plus,
  Clock,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  ProblemValidationTabBar,
  PV_STATUS_LABEL,
  PV_STAGE_LABEL,
} from "@/components/erp/ProblemValidationTabBar";
import { ErpButton } from "@/components/erp/Button";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { StarRating } from "@/components/erp/StarRating";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mock-data";
import { problemValidationService } from "@/services";
import type {
  ProblemValidationFormInput,
  ProblemValidationLookups,
  PVStage,
  PVAttachment,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/problem-validation/new")({
  head: () => ({ meta: [{ title: "Problem Validation Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: ProblemValidationFormPage,
});

/* --------------------------------- Defaults -------------------------------- */
const EMPTY: ProblemValidationFormInput = {
  validationLead: "Priya Sharma",
  validationDate: new Date().toISOString().slice(0, 10),
  businessUnit: "",
  department: "",
  linkedDesignThinkingId: null,
  problemInfo: {
    problemTitle: "",
    problemDescription: "",
    problemCategory: "",
    problemSubCategory: "",
    industry: "",
    customerSegment: "",
    businessArea: "",
    geographicRegion: "",
    problemSource: "",
    problemOwner: "",
  },
  customerValidation: {
    targetCustomer: "",
    customerPersona: "",
    numberOfInterviews: 0,
    surveyResponses: 0,
    observationSessions: 0,
    customerPainLevel: 5,
    customerQuotes: [],
  },
  problemEvidence: {
    existingSolution: "",
    currentProcess: "",
    rootCause: "",
    supportingData: "",
    fieldNotes: "",
  },
  impactAssessment: {
    customerImpact: 5,
    financialImpact: 0,
    timeLoss: 0,
    productivityLoss: 0,
    qualityImpact: 5,
    safetyImpact: 5,
    environmentalImpact: 5,
    regulatoryImpact: 5,
  },
  marketValidation: {
    customersAffected: 0,
    marketSize: 0,
    growthRate: 0,
    frequencyOfProblem: "",
    existingCompetitors: "",
    marketGap: "",
  },
  technicalValidation: {
    technicalChallenge: "",
    existingTechnologies: "",
    technologyGap: "",
    technologyReadiness: "",
    technicalComplexity: "",
    requiredExpertise: [],
  },
  businessValidation: {
    revenueOpportunity: 0,
    costSavingOpportunity: 0,
    strategicAlignment: 5,
    businessPriority: "",
    investmentJustification: "",
  },
  attachments: [],
};

const STAGES: { key: PVStage; label: string; icon: typeof Users }[] = [
  { key: "problem_definition", label: "Problem Definition", icon: FileText },
  { key: "customer_validation", label: "Customer Validation", icon: Users },
  { key: "market_validation", label: "Market Validation", icon: BarChart3 },
  { key: "technical_validation", label: "Technical Validation", icon: Cpu },
  { key: "business_validation", label: "Business Validation", icon: Briefcase },
];
const SECTION_ACCENT = [
  "bg-[#7C5CFF]/10 text-[#7C5CFF]",
  "bg-[#22C55E]/10 text-[#22C55E]",
  "bg-[#F59E0B]/10 text-[#F59E0B]",
  "bg-primary/10 text-primary",
  "bg-[#3B82F6]/10 text-[#3B82F6]",
  "bg-[#EC4899]/10 text-[#EC4899]",
  "bg-[#14B8A6]/10 text-[#14B8A6]",
  "bg-[#7C5CFF]/10 text-[#7C5CFF]",
  "bg-[#22C55E]/10 text-[#22C55E]",
  "bg-[#F59E0B]/10 text-[#F59E0B]",
];

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
function TextInput(p: { value: string; onChange?: (v: string) => void; disabled?: boolean }) {
  return (
    <input
      className={cn(INPUT, "border-border")}
      value={p.value}
      disabled={p.disabled}
      onChange={(e) => p.onChange?.(e.target.value)}
    />
  );
}
function TextArea(p: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      className={cn(INPUT, "resize-y border-border")}
      rows={p.rows ?? 2}
      value={p.value}
      disabled={p.disabled}
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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {p.prefix}
        </span>
      )}
      <input
        type="number"
        className={cn(INPUT, "border-border tabular", p.prefix && "pl-7", p.suffix && "pr-8")}
        value={Number.isFinite(p.value) ? p.value : 0}
        disabled={p.disabled}
        onChange={(e) => p.onChange(Number(e.target.value))}
      />
      {p.suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
function ChipMulti(p: {
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
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-muted-foreground hover:border-primary/40",
            )}
          >
            {on && <Check className="mr-0.5 inline h-3 w-3" />}
            {o}
          </button>
        );
      })}
    </div>
  );
}
function RepeatList(p: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-1.5">
      {p.items.length > 0 && (
        <ul className="space-y-1">
          {p.items.map((it, i) => (
            <li
              key={i}
              className="rounded-lg border border-border bg-secondary/30 px-2.5 py-1.5 text-xs italic text-foreground"
            >
              <span className="flex items-start justify-between gap-2">
                <span>“{it}”</span>
                {!p.disabled && (
                  <button
                    onClick={() => p.onChange(p.items.filter((_, x) => x !== i))}
                    className="shrink-0 not-italic text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!p.disabled && (
        <div className="flex gap-2">
          <input
            className={cn(INPUT, "border-border")}
            value={draft}
            placeholder={p.placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                e.preventDefault();
                p.onChange([...p.items, draft.trim()]);
                setDraft("");
              }
            }}
          />
          <ErpButton
            size="sm"
            variant="secondary"
            onClick={() => {
              if (draft.trim()) {
                p.onChange([...p.items, draft.trim()]);
                setDraft("");
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </ErpButton>
        </div>
      )}
    </div>
  );
}
function ComplexityBadge({ level }: { level: string }) {
  const tone = ["High", "Very High"].includes(level)
    ? "bg-destructive/10 text-destructive"
    : ["Medium"].includes(level)
      ? "bg-warning/15 text-[oklch(0.45_0.15_75)]"
      : level
        ? "bg-success/10 text-success"
        : "bg-muted text-muted-foreground";
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold", tone)}>{level || "—"}</span>
  );
}
function ScoreTile({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 70 ? "text-success" : value >= 45 ? "text-[#F59E0B]" : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
      <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
      <div className={cn("font-display text-lg font-bold tabular", "text-[#7C5CFF]")}>
        {value}
        <span className="text-[10px] font-medium text-muted-foreground">/100</span>
      </div>
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

function Section({
  n,
  title,
  icon: Icon,
  children,
  locked,
  right,
}: {
  n: number;
  title: string;
  icon: typeof FileText;
  children: ReactNode;
  locked?: boolean;
  right?: ReactNode;
}) {
  return (
    <section className={cn("card-soft p-5", locked && "opacity-60")}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <span
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full",
              SECTION_ACCENT[(n - 1) % SECTION_ACCENT.length],
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          {n}. {title}
        </h3>
        {right}
      </div>
      {locked ? (
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Locked — complete the previous stage first.
        </p>
      ) : (
        children
      )}
    </section>
  );
}
function EvidenceRow({ label, value }: { label: string; value: string }) {
  const ok = Boolean(value && value.trim());
  return (
    <div className="flex items-start gap-2 py-1.5">
      <CheckCircle2
        className={cn("mt-0.5 h-4 w-4 shrink-0", ok ? "text-success" : "text-muted-foreground/40")}
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{ok ? value : "Not provided"}</p>
      </div>
    </div>
  );
}

/* ================================== Page =================================== */
function ProblemValidationFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: editId } = Route.useSearch();

  const lookupsQuery = useQuery({
    queryKey: ["problem-validation", "lookups"],
    queryFn: () => problemValidationService.fetchLookups(),
  });
  const dtQuery = useQuery({
    queryKey: ["problem-validation", "approved-dt"],
    queryFn: () => problemValidationService.fetchApprovedDesignThinking(),
  });
  const recordQuery = useQuery({
    queryKey: ["problem-validation", "detail", editId],
    queryFn: () => problemValidationService.fetchRecord(editId as string),
    enabled: !!editId,
  });
  const record = recordQuery.data;

  const [input, setInput] = useState<ProblemValidationFormInput>(EMPTY);
  const [seeded, setSeeded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editId && record && !seeded) {
      setInput({
        validationLead: record.validationLead,
        validationDate: record.validationDate,
        businessUnit: record.businessUnit,
        department: record.department,
        linkedDesignThinkingId: record.linkedDesignThinkingId,
        problemInfo: record.problemInfo,
        customerValidation: record.customerValidation,
        problemEvidence: record.problemEvidence,
        impactAssessment: record.impactAssessment,
        marketValidation: record.marketValidation,
        technicalValidation: record.technicalValidation,
        businessValidation: record.businessValidation,
        attachments: record.attachments,
      });
      setSeeded(true);
    }
  }, [editId, record, seeded]);

  const L: ProblemValidationLookups = lookupsQuery.data ?? {
    problemCategories: [],
    problemSubCategories: [],
    industries: [],
    customerSegments: [],
    businessAreas: [],
    geographicRegions: [],
    problemSources: [],
    targetCustomers: [],
    frequencies: [],
    technologyReadinessLevels: [],
    technicalComplexities: [],
    businessPriorities: [],
    validationDecisions: [],
    nextActions: [],
    expertise: [],
    validationLeads: [],
    businessUnits: [],
    departments: [],
    attachmentCategories: [],
  };

  const status = record?.status ?? "draft";
  const editable = ["draft", "in_progress", "more_research_required", "revision_required"].includes(
    status,
  );
  const stageState = (s: PVStage) => record?.stages.find((x) => x.stage === s);
  const stageLocked = (s: PVStage) =>
    record ? stageState(s)?.status === "pending" : s !== "problem_definition";
  const ed = (s: PVStage) => editable && !stageLocked(s);

  function patch<K extends keyof ProblemValidationFormInput>(
    section: K,
    part: Partial<ProblemValidationFormInput[K]>,
  ) {
    setInput((prev) => ({ ...prev, [section]: { ...(prev[section] as object), ...part } }));
  }

  const ai = record?.aiValidation;
  const summary = record?.summary;
  const approvedDT = dtQuery.data ?? [];

  function pickDT(id: string) {
    const dt = approvedDT.find((x) => x.id === id);
    if (!dt) {
      setInput((p) => ({ ...p, linkedDesignThinkingId: null }));
      return;
    }
    setInput((p) => ({
      ...p,
      linkedDesignThinkingId: dt.id,
      problemInfo: {
        ...p.problemInfo,
        problemTitle: p.problemInfo.problemTitle || dt.projectName,
        problemDescription: p.problemInfo.problemDescription || dt.problemStatement,
      },
      problemEvidence: {
        ...p.problemEvidence,
        rootCause: p.problemEvidence.rootCause || dt.rootCause,
      },
    }));
    toast.success(`Context pulled from ${dt.designThinkingCode}`);
  }

  /* -------------------------------- Actions -------------------------------- */
  async function doSave() {
    if (!input.linkedDesignThinkingId) {
      toast.error("Select a completed Design Thinking project first.");
      return;
    }
    setBusy("save");
    try {
      const rec = await problemValidationService.saveDraft(input, record?.id);
      queryClient.invalidateQueries({ queryKey: ["problem-validation"] });
      toast.success(`Saved · ${rec.formCode}`);
      if (!editId)
        navigate({
          to: "/development/research-innovation/problem-validation/new",
          search: { id: rec.id },
        });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function doCompleteStage(stage: PVStage) {
    if (!record) return;
    setBusy(`stage-${stage}`);
    try {
      await problemValidationService.saveDraft(input, record.id);
      await problemValidationService.completeStage(record.id, stage);
      queryClient.invalidateQueries({ queryKey: ["problem-validation"] });
      toast.success(`${PV_STAGE_LABEL[stage]} completed — AI analysis updated.`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function doGenerateAI() {
    if (!record) {
      toast.error("Save the record first.");
      return;
    }
    setBusy("ai");
    try {
      await problemValidationService.saveDraft(input, record.id);
      await problemValidationService.generateReport(record.id);
      queryClient.invalidateQueries({ queryKey: ["problem-validation"] });
      toast.success("AI validation report generated.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function doSubmit() {
    if (!record) {
      toast.error("Save the record first.");
      return;
    }
    setBusy("submit");
    try {
      await problemValidationService.saveDraft(input, record.id);
      await problemValidationService.submitForReview(record.id);
      queryClient.invalidateQueries({ queryKey: ["problem-validation"] });
      toast.success("Submitted for management review.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function doReview(
    decision: "Validated" | "More Research Required" | "Revision Required" | "Validation Failed",
  ) {
    if (!record) return;
    setBusy("review");
    try {
      const rec = await problemValidationService.review({
        id: record.id,
        decision,
        comments: decision !== "Validated" ? `${decision} by review panel` : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["problem-validation"] });
      toast.success(
        rec.feasibilityProjectCode
          ? `Validated — Feasibility Study ${rec.feasibilityProjectCode} created.`
          : decision,
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const added: PVAttachment[] = Array.from(files).map((f) => ({
      id: `att-${Date.now()}-${f.name}`,
      category: L.attachmentCategories[0] ?? "Supporting Documents",
      filename: f.name,
      fileType: (f.name.split(".").pop() ?? "FILE").toUpperCase(),
      uploadedBy: "Priya Sharma",
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(f),
    }));
    setInput((p) => ({ ...p, attachments: [...p.attachments, ...added] }));
    toast.success(`${added.length} file(s) attached — remember to Save.`);
  }

  const overall = summary?.overallValidationScore ?? 0;

  if (editId && !seeded && recordQuery.isLoading) {
    return (
      <AppShell
        title="Problem Validation"
        breadcrumb="Research & Innovation Development"
        tabs={<ProblemValidationTabBar />}
      >
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-[500px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Problem Validation"
      breadcrumb="Research & Innovation Development"
      description="Problem Validation Form"
      tabs={<ProblemValidationTabBar />}
    >
      <div className="space-y-5">
        {/* ---------------------------- Record header ---------------------------- */}
        <div className="card-soft p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid flex-1 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              <HeaderCell label="Form Code" value={record?.formCode ?? "PV-—"} />
              <HeaderCell
                label="Problem Validation ID"
                value={record?.problemValidationId ?? "PV-—"}
              />
              <DesignThinkingChip
                label="Linked Design Thinking"
                code={record?.linkedDesignThinkingCode}
                id={record?.linkedDesignThinkingId}
              />
              <OpportunityChip
                label="Linked Opportunity"
                code={record?.linkedOpportunityCode}
                id={record?.linkedOpportunityId}
              />
              <IdeaChip
                label="Linked Idea"
                code={record?.linkedIdeaCode}
                ideaId={record?.linkedIdeaId}
              />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Status
                </div>
                <div className="mt-1.5">
                  <StatusBadge status={PV_STATUS_LABEL[status] ?? status} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ErpButton
                variant="outline"
                size="sm"
                loading={busy === "save"}
                disabled={!editable}
                onClick={doSave}
              >
                <Save className="h-4 w-4" /> Save Draft
              </ErpButton>
              <ErpButton
                size="sm"
                loading={busy === "submit"}
                disabled={!editable || !record}
                onClick={doSubmit}
              >
                <Send className="h-4 w-4" /> Submit for Review
              </ErpButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      const blob = new Blob(
                        [JSON.stringify({ code: record?.formCode, input, ai, summary }, null, 2)],
                        { type: "application/json" },
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${record?.formCode ?? "problem-validation"}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Exported JSON");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" /> Export JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.message("Deleting records isn't enabled yet.")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {!record && (
            <div className="mt-4 rounded-lg border border-primary/25 bg-primary/5 p-3">
              <p className="mb-2 text-xs font-semibold text-foreground">
                A Problem Validation record starts from a{" "}
                <span className="text-primary">completed Design Thinking project</span>.
              </p>
              {approvedDT.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No approved Design Thinking projects yet —{" "}
                  <Link
                    to="/development/research-innovation/design-thinking"
                    className="font-semibold text-primary hover:underline"
                  >
                    complete one
                  </Link>{" "}
                  first.
                </p>
              ) : (
                <select
                  className={cn(INPUT, "border-border")}
                  value={input.linkedDesignThinkingId ?? ""}
                  onChange={(e) => pickDT(e.target.value)}
                >
                  <option value="">Select a completed Design Thinking project…</option>
                  {approvedDT.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.designThinkingCode} — {d.projectName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {record?.reviewComments &&
            ["revision_required", "more_research_required"].includes(status) && (
              <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-[oklch(0.45_0.15_75)]">
                <span className="font-semibold">Review note:</span> {record.reviewComments}
              </div>
            )}
        </div>

        {/* --------------------------- Stage tracker --------------------------- */}
        <div className="card-soft overflow-x-auto p-4">
          <div className="flex min-w-max items-center gap-2">
            {STAGES.map((s, i) => {
              const st =
                stageState(s.key)?.status ?? (i === 0 && !record ? "in_progress" : "pending");
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center">
                  <div className="flex items-center gap-2 rounded-lg px-3 py-1.5">
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                        st === "completed"
                          ? "bg-success/15 text-success"
                          : st === "in_progress"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {st === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : st === "in_progress" ? (
                        <Icon className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <div
                        className={cn(
                          "text-[12px] font-bold",
                          st === "pending" ? "text-muted-foreground" : "text-foreground",
                        )}
                      >
                        {s.label}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] font-semibold uppercase",
                          st === "completed"
                            ? "text-success"
                            : st === "in_progress"
                              ? "text-primary"
                              : "text-muted-foreground",
                        )}
                      >
                        {st === "completed"
                          ? "Completed"
                          : st === "in_progress"
                            ? "In Progress"
                            : "Pending"}
                      </div>
                    </div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <span
                      className={cn(
                        "h-0.5 w-7 rounded",
                        st === "completed" ? "bg-success" : "bg-border",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid min-w-0 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {/* 1 — Problem Information (stage: problem_definition) */}
            <Section
              n={1}
              title="Problem Information"
              icon={FileText}
              locked={stageLocked("problem_definition")}
              right={
                <StageAction
                  stage="problem_definition"
                  record={record}
                  busy={busy}
                  onComplete={doCompleteStage}
                />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Problem Title" required>
                    <TextInput
                      value={input.problemInfo.problemTitle}
                      onChange={(v) => patch("problemInfo", { problemTitle: v })}
                      disabled={!ed("problem_definition")}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Problem Description">
                    <TextArea
                      value={input.problemInfo.problemDescription}
                      onChange={(v) => patch("problemInfo", { problemDescription: v })}
                      disabled={!ed("problem_definition")}
                    />
                  </Field>
                </div>
                <Field label="Problem Category" required>
                  <Select
                    value={input.problemInfo.problemCategory}
                    onChange={(v) => patch("problemInfo", { problemCategory: v })}
                    options={L.problemCategories}
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <Field label="Problem Sub Category">
                  <Select
                    value={input.problemInfo.problemSubCategory}
                    onChange={(v) => patch("problemInfo", { problemSubCategory: v })}
                    options={L.problemSubCategories}
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <Field label="Industry" required>
                  <Select
                    value={input.problemInfo.industry}
                    onChange={(v) => patch("problemInfo", { industry: v })}
                    options={L.industries}
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <Field label="Customer Segment">
                  <Select
                    value={input.problemInfo.customerSegment}
                    onChange={(v) => patch("problemInfo", { customerSegment: v })}
                    options={L.customerSegments}
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <Field label="Business Area">
                  <Select
                    value={input.problemInfo.businessArea}
                    onChange={(v) => patch("problemInfo", { businessArea: v })}
                    options={L.businessAreas}
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <Field label="Geographic Region">
                  <Select
                    value={input.problemInfo.geographicRegion}
                    onChange={(v) => patch("problemInfo", { geographicRegion: v })}
                    options={L.geographicRegions}
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <Field label="Problem Source">
                  <Select
                    value={input.problemInfo.problemSource}
                    onChange={(v) => patch("problemInfo", { problemSource: v })}
                    options={L.problemSources}
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <Field label="Problem Owner">
                  <Select
                    value={input.problemInfo.problemOwner}
                    onChange={(v) => patch("problemInfo", { problemOwner: v })}
                    options={L.validationLeads}
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <Field label="Discovered On">
                  <TextInput
                    value={
                      record
                        ? new Date(record.createdAt).toLocaleDateString("en-IN")
                        : new Date().toLocaleDateString("en-IN")
                    }
                    disabled
                  />
                </Field>
              </div>
            </Section>

            {/* 2 — Customer Validation (stage: customer_validation) */}
            <Section
              n={2}
              title="Customer Validation"
              icon={Users}
              locked={stageLocked("customer_validation")}
              right={
                <StageAction
                  stage="customer_validation"
                  record={record}
                  busy={busy}
                  onComplete={doCompleteStage}
                />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Target Customer" required>
                  <Select
                    value={input.customerValidation.targetCustomer}
                    onChange={(v) => patch("customerValidation", { targetCustomer: v })}
                    options={L.targetCustomers}
                    disabled={!ed("customer_validation")}
                  />
                </Field>
                <Field label="Target Persona">
                  <TextInput
                    value={input.customerValidation.customerPersona}
                    onChange={(v) => patch("customerValidation", { customerPersona: v })}
                    disabled={!ed("customer_validation")}
                  />
                </Field>
                <Field label="Interviews Conducted">
                  <NumberInput
                    value={input.customerValidation.numberOfInterviews}
                    onChange={(v) => patch("customerValidation", { numberOfInterviews: v })}
                    disabled={!ed("customer_validation")}
                  />
                </Field>
                <Field label="Survey Responses">
                  <NumberInput
                    value={input.customerValidation.surveyResponses}
                    onChange={(v) => patch("customerValidation", { surveyResponses: v })}
                    disabled={!ed("customer_validation")}
                  />
                </Field>
                <Field label="Observation Sessions">
                  <NumberInput
                    value={input.customerValidation.observationSessions}
                    onChange={(v) => patch("customerValidation", { observationSessions: v })}
                    disabled={!ed("customer_validation")}
                  />
                </Field>
                <div>
                  <span className="text-xs font-semibold text-foreground">Customer Pain Level</span>
                  <div className="mt-1">
                    <StarRating
                      value={input.customerValidation.customerPainLevel}
                      onChange={(v) => patch("customerValidation", { customerPainLevel: v })}
                      readOnly={!ed("customer_validation")}
                      size="sm"
                      aria-label="Customer Pain Level"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Customer Quotes">
                    <RepeatList
                      items={input.customerValidation.customerQuotes}
                      onChange={(v) => patch("customerValidation", { customerQuotes: v })}
                      placeholder='"We lose critical production time…"'
                      disabled={!ed("customer_validation")}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* 3 — Problem Evidence (stage: problem_definition) */}
            <Section
              n={3}
              title="Problem Evidence"
              icon={ClipboardCheck}
              locked={stageLocked("problem_definition")}
            >
              {ed("problem_definition") ? (
                <div className="space-y-3">
                  <Field label="Existing Solution">
                    <TextArea
                      value={input.problemEvidence.existingSolution}
                      onChange={(v) => patch("problemEvidence", { existingSolution: v })}
                    />
                  </Field>
                  <Field label="Current Process">
                    <TextArea
                      value={input.problemEvidence.currentProcess}
                      onChange={(v) => patch("problemEvidence", { currentProcess: v })}
                    />
                  </Field>
                  <Field label="Root Cause">
                    <TextArea
                      value={input.problemEvidence.rootCause}
                      onChange={(v) => patch("problemEvidence", { rootCause: v })}
                    />
                  </Field>
                  <Field label="Supporting Data">
                    <TextArea
                      value={input.problemEvidence.supportingData}
                      onChange={(v) => patch("problemEvidence", { supportingData: v })}
                    />
                  </Field>
                  <Field label="Field Notes">
                    <TextArea
                      value={input.problemEvidence.fieldNotes}
                      onChange={(v) => patch("problemEvidence", { fieldNotes: v })}
                    />
                  </Field>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  <EvidenceRow
                    label="Existing Solution"
                    value={input.problemEvidence.existingSolution}
                  />
                  <EvidenceRow
                    label="Current Process"
                    value={input.problemEvidence.currentProcess}
                  />
                  <EvidenceRow label="Root Cause" value={input.problemEvidence.rootCause} />
                  <EvidenceRow
                    label="Supporting Data"
                    value={input.problemEvidence.supportingData}
                  />
                  <EvidenceRow label="Field Notes" value={input.problemEvidence.fieldNotes} />
                </div>
              )}
            </Section>

            {/* 4 — Impact Assessment (stage: problem_definition) */}
            <Section
              n={4}
              title="Impact Assessment"
              icon={BarChart3}
              locked={stageLocked("problem_definition")}
            >
              <div className="space-y-1.5">
                <RatingRow
                  label="Customer Impact"
                  value={input.impactAssessment.customerImpact}
                  onChange={(v) => patch("impactAssessment", { customerImpact: v })}
                  disabled={!ed("problem_definition")}
                />
                <Field label="Financial Impact">
                  <NumberInput
                    value={input.impactAssessment.financialImpact}
                    onChange={(v) => patch("impactAssessment", { financialImpact: v })}
                    prefix="₹"
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <Field label="Time Loss (hrs/month)">
                  <NumberInput
                    value={input.impactAssessment.timeLoss}
                    onChange={(v) => patch("impactAssessment", { timeLoss: v })}
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <Field label="Productivity Loss">
                  <NumberInput
                    value={input.impactAssessment.productivityLoss}
                    onChange={(v) => patch("impactAssessment", { productivityLoss: v })}
                    suffix="%"
                    disabled={!ed("problem_definition")}
                  />
                </Field>
                <RatingRow
                  label="Quality Impact"
                  value={input.impactAssessment.qualityImpact}
                  onChange={(v) => patch("impactAssessment", { qualityImpact: v })}
                  disabled={!ed("problem_definition")}
                />
                <RatingRow
                  label="Safety Impact"
                  value={input.impactAssessment.safetyImpact}
                  onChange={(v) => patch("impactAssessment", { safetyImpact: v })}
                  disabled={!ed("problem_definition")}
                />
                <RatingRow
                  label="Environmental Impact"
                  value={input.impactAssessment.environmentalImpact}
                  onChange={(v) => patch("impactAssessment", { environmentalImpact: v })}
                  disabled={!ed("problem_definition")}
                />
                <RatingRow
                  label="Regulatory Impact"
                  value={input.impactAssessment.regulatoryImpact}
                  onChange={(v) => patch("impactAssessment", { regulatoryImpact: v })}
                  disabled={!ed("problem_definition")}
                />
              </div>
            </Section>

            {/* 5 — Market Validation */}
            <Section
              n={5}
              title="Market Validation"
              icon={BarChart3}
              locked={stageLocked("market_validation")}
              right={
                <StageAction
                  stage="market_validation"
                  record={record}
                  busy={busy}
                  onComplete={doCompleteStage}
                />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Customers Affected">
                  <NumberInput
                    value={input.marketValidation.customersAffected}
                    onChange={(v) => patch("marketValidation", { customersAffected: v })}
                    disabled={!ed("market_validation")}
                  />
                </Field>
                <Field label="Market Size">
                  <NumberInput
                    value={input.marketValidation.marketSize}
                    onChange={(v) => patch("marketValidation", { marketSize: v })}
                    prefix="₹"
                    disabled={!ed("market_validation")}
                  />
                </Field>
                <Field label="Growth Rate">
                  <NumberInput
                    value={input.marketValidation.growthRate}
                    onChange={(v) => patch("marketValidation", { growthRate: v })}
                    suffix="%"
                    disabled={!ed("market_validation")}
                  />
                </Field>
                <Field label="Frequency of Problem">
                  <Select
                    value={input.marketValidation.frequencyOfProblem}
                    onChange={(v) => patch("marketValidation", { frequencyOfProblem: v })}
                    options={L.frequencies}
                    disabled={!ed("market_validation")}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Existing Competitors">
                    <TextArea
                      value={input.marketValidation.existingCompetitors}
                      onChange={(v) => patch("marketValidation", { existingCompetitors: v })}
                      disabled={!ed("market_validation")}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Market Gap">
                    <TextArea
                      value={input.marketValidation.marketGap}
                      onChange={(v) => patch("marketValidation", { marketGap: v })}
                      disabled={!ed("market_validation")}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* 6 — Technical Validation */}
            <Section
              n={6}
              title="Technical Validation"
              icon={Cpu}
              locked={stageLocked("technical_validation")}
              right={
                <StageAction
                  stage="technical_validation"
                  record={record}
                  busy={busy}
                  onComplete={doCompleteStage}
                />
              }
            >
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Technology Readiness">
                    <Select
                      value={input.technicalValidation.technologyReadiness}
                      onChange={(v) => patch("technicalValidation", { technologyReadiness: v })}
                      options={L.technologyReadinessLevels}
                      disabled={!ed("technical_validation")}
                    />
                  </Field>
                  <Field label="Technical Complexity">
                    {ed("technical_validation") ? (
                      <Select
                        value={input.technicalValidation.technicalComplexity}
                        onChange={(v) => patch("technicalValidation", { technicalComplexity: v })}
                        options={L.technicalComplexities}
                      />
                    ) : (
                      <div className="pt-1">
                        <ComplexityBadge level={input.technicalValidation.technicalComplexity} />
                      </div>
                    )}
                  </Field>
                </div>
                <Field label="Technology Gap">
                  <TextArea
                    value={input.technicalValidation.technologyGap}
                    onChange={(v) => patch("technicalValidation", { technologyGap: v })}
                    disabled={!ed("technical_validation")}
                  />
                </Field>
                <Field label="Technical Challenge">
                  <TextArea
                    value={input.technicalValidation.technicalChallenge}
                    onChange={(v) => patch("technicalValidation", { technicalChallenge: v })}
                    disabled={!ed("technical_validation")}
                  />
                </Field>
                <Field label="Existing Technologies">
                  <TextArea
                    value={input.technicalValidation.existingTechnologies}
                    onChange={(v) => patch("technicalValidation", { existingTechnologies: v })}
                    disabled={!ed("technical_validation")}
                  />
                </Field>
                <Field label="Required Expertise">
                  <ChipMulti
                    options={L.expertise}
                    selected={input.technicalValidation.requiredExpertise}
                    disabled={!ed("technical_validation")}
                    onToggle={(v) =>
                      patch("technicalValidation", {
                        requiredExpertise: input.technicalValidation.requiredExpertise.includes(v)
                          ? input.technicalValidation.requiredExpertise.filter((x) => x !== v)
                          : [...input.technicalValidation.requiredExpertise, v],
                      })
                    }
                  />
                </Field>
              </div>
            </Section>

            {/* 7 — Business Validation */}
            <Section
              n={7}
              title="Business Validation"
              icon={Briefcase}
              locked={stageLocked("business_validation")}
              right={
                <StageAction
                  stage="business_validation"
                  record={record}
                  busy={busy}
                  onComplete={doCompleteStage}
                />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Revenue Opportunity">
                  <NumberInput
                    value={input.businessValidation.revenueOpportunity}
                    onChange={(v) => patch("businessValidation", { revenueOpportunity: v })}
                    prefix="₹"
                    disabled={!ed("business_validation")}
                  />
                </Field>
                <Field label="Cost Saving Opportunity">
                  <NumberInput
                    value={input.businessValidation.costSavingOpportunity}
                    onChange={(v) => patch("businessValidation", { costSavingOpportunity: v })}
                    prefix="₹"
                    disabled={!ed("business_validation")}
                  />
                </Field>
                <div>
                  <span className="text-xs font-semibold text-foreground">Strategic Alignment</span>
                  <div className="mt-1">
                    <StarRating
                      value={input.businessValidation.strategicAlignment}
                      onChange={(v) => patch("businessValidation", { strategicAlignment: v })}
                      readOnly={!ed("business_validation")}
                      size="sm"
                      aria-label="Strategic Alignment"
                    />
                  </div>
                </div>
                <Field label="Business Priority">
                  <Select
                    value={input.businessValidation.businessPriority}
                    onChange={(v) => patch("businessValidation", { businessPriority: v })}
                    options={L.businessPriorities}
                    disabled={!ed("business_validation")}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Investment Justification">
                    <TextArea
                      value={input.businessValidation.investmentJustification}
                      onChange={(v) => patch("businessValidation", { investmentJustification: v })}
                      disabled={!ed("business_validation")}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* 8 — AI Problem Validation */}
            <Section
              n={8}
              title="AI Problem Validation"
              icon={Sparkles}
              right={
                <ErpButton
                  size="xs"
                  variant="outline"
                  loading={busy === "ai"}
                  disabled={!record}
                  onClick={doGenerateAI}
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generate
                </ErpButton>
              }
            >
              {ai ? (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <ScoreTile label="AI Problem Severity" value={ai.problemSeverityScore} />
                    <ScoreTile label="AI Customer Validation" value={ai.customerValidationScore} />
                    <ScoreTile label="AI Market Validation" value={ai.marketValidationScore} />
                    <ScoreTile label="AI Business Value" value={ai.businessValueScore} />
                    <ScoreTile
                      label="AI Technical Complexity"
                      value={ai.technicalComplexityScore}
                    />
                  </div>
                  <div className="mt-3 rounded-lg border border-border p-3">
                    <p className="text-[11px] font-bold text-foreground">AI Recommendation</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{ai.recommendation}</p>
                  </div>
                  <div className="mt-2 rounded-lg border border-border p-3">
                    <p className="text-[11px] font-bold text-foreground">
                      AI Suggested Improvements
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {ai.suggestedImprovements.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                        >
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Save the record or run <strong>Generate AI Report</strong> to populate.
                </p>
              )}
            </Section>

            {/* 9 — Validation Summary */}
            <Section n={9} title="Validation Summary" icon={ListChecks}>
              {summary ? (
                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-1.5">
                    <SummaryRow label="Problem Severity" value={summary.problemSeverity} />
                    <SummaryRow label="Customer Demand Score" value={summary.customerDemandScore} />
                    <SummaryRow
                      label="Market Opportunity Score"
                      value={summary.marketOpportunityScore}
                    />
                    <SummaryRow
                      label="Technical Feasibility Score"
                      value={summary.technicalFeasibilityScore}
                    />
                    <SummaryRow
                      label="Business Potential Score"
                      value={summary.businessPotentialScore}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Overall
                    </div>
                    <div className="font-display text-3xl font-bold text-success">
                      {summary.overallValidationScore}
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                    <StatusBadge status={summary.validationDecision} />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Save the record to calculate the validation summary.
                </p>
              )}
            </Section>

            {/* 10 — Review & Approval */}
            <Section n={10} title="Review & Approval" icon={ClipboardCheck}>
              <div className="space-y-2.5">
                {(
                  record?.reviewers ?? [
                    { role: "Innovation Manager", name: "Rohit Verma", status: "pending" as const },
                    { role: "Technical Reviewer", name: "Neha Sharma", status: "pending" as const },
                    { role: "Business Reviewer", name: "Vikram Singh", status: "pending" as const },
                  ]
                ).map((rv) => (
                  <div
                    key={rv.role}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <div>
                      <div className="text-[11px] text-muted-foreground">{rv.role}</div>
                      <div className="text-sm font-semibold text-foreground">{rv.name}</div>
                    </div>
                    {rv.status === "approved" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </div>
                ))}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Approval Decision">
                    <TextInput value={PV_STATUS_LABEL[status] ?? status} disabled />
                  </Field>
                  <Field label="Next Action">
                    <TextInput value={record?.nextAction ?? "—"} disabled />
                  </Field>
                </div>
                <Field label="Review Comments">
                  <TextArea value={record?.reviewComments ?? ""} onChange={() => {}} disabled />
                </Field>
                <Field label="Approval Date">
                  <TextInput
                    value={
                      record?.approvalDate
                        ? new Date(record.approvalDate).toLocaleDateString("en-IN")
                        : "—"
                    }
                    disabled
                  />
                </Field>
              </div>
            </Section>
          </div>

          {/* -------------------------------- Sidebar -------------------------------- */}
          <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
            <div className="card-soft p-5 text-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Overall Validation Score
              </h4>
              <div className="mt-3 grid place-items-center">
                <ScoreRing value={overall} />
              </div>
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <StarRating
                  value={Math.max(1, Math.round(overall / 20))}
                  readOnly
                  showValue={false}
                />
                <span className="text-xs font-bold text-success">
                  {summary?.validationDecision === "Validated"
                    ? "Strongly Validated"
                    : (summary?.validationDecision ?? "Pending")}
                </span>
                {record?.validationRank ? (
                  <span className="text-xs text-muted-foreground">
                    Rank{" "}
                    <span className="font-display text-base font-bold text-foreground">
                      #{record.validationRank}
                    </span>
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    Rank assigned after save
                  </span>
                )}
              </div>
            </div>

            <div className="card-soft p-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                AI Validation Summary
              </h4>
              {ai ? (
                <dl className="space-y-2 text-sm">
                  <AISideRow label="AI Problem Severity Score" value={ai.problemSeverityScore} />
                  <AISideRow
                    label="AI Customer Validation Score"
                    value={ai.customerValidationScore}
                  />
                  <AISideRow label="AI Market Validation Score" value={ai.marketValidationScore} />
                  <AISideRow label="AI Business Value Score" value={ai.businessValueScore} />
                  <AISideRow
                    label="AI Technical Complexity Score"
                    value={ai.technicalComplexityScore}
                  />
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <dt className="text-xs font-bold text-foreground">
                      AI Overall Validation Score
                    </dt>
                    <dd className="font-display text-lg font-bold text-success">
                      {ai.overallValidationScore}
                      <span className="text-[10px] text-muted-foreground">/100</span>
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-xs text-muted-foreground">Generate the AI report to populate.</p>
              )}
            </div>

            {status === "under_review" && (
              <div className="card-soft p-5">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Management Review
                </h4>
                <div className="flex flex-wrap gap-2">
                  <ErpButton
                    size="sm"
                    loading={busy === "review"}
                    onClick={() => doReview("Validated")}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Validate
                  </ErpButton>
                  <ErpButton
                    size="sm"
                    variant="outline"
                    loading={busy === "review"}
                    onClick={() => doReview("More Research Required")}
                  >
                    More Research
                  </ErpButton>
                  <ErpButton
                    size="sm"
                    variant="outline"
                    loading={busy === "review"}
                    onClick={() => doReview("Revision Required")}
                  >
                    Revision
                  </ErpButton>
                  <ErpButton
                    size="sm"
                    variant="destructive"
                    loading={busy === "review"}
                    onClick={() => doReview("Validation Failed")}
                  >
                    Fail
                  </ErpButton>
                </div>
              </div>
            )}

            <div className="card-soft p-5">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Next Action
              </h4>
              <p className="flex items-start gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {record?.nextAction ?? "Select a Design Thinking project to begin"}
              </p>
              {status === "validated" && record?.feasibilityProjectCode && (
                <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-2.5">
                  <p className="text-[11px] font-bold text-success">Feasibility Study Created</p>
                  <p className="font-display text-base font-bold text-foreground">
                    {record.feasibilityProjectCode}
                  </p>
                </div>
              )}
            </div>

            <div className="card-soft p-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </h4>
              <div className="space-y-1">
                <QuickAction
                  icon={UploadCloud}
                  label="Upload Evidence"
                  onClick={() => fileRef.current?.click()}
                />
                <QuickAction
                  icon={UserPlus}
                  label="Add Customer Interview"
                  onClick={() => toast.message("Interview capture isn't wired to a backend yet.")}
                />
                <QuickAction
                  icon={FilePlus2}
                  label="Add Survey Results"
                  onClick={() => toast.message("Survey import isn't wired to a backend yet.")}
                />
                <QuickAction icon={Sparkles} label="Generate AI Report" onClick={doGenerateAI} />
                <QuickAction
                  icon={FlaskConical}
                  label="Create Feasibility Study"
                  onClick={() =>
                    toast.success("Feasibility Study is auto-created when the record is Validated.")
                  }
                  disabled={status !== "validated"}
                />
              </div>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </div>

            <div className="card-soft p-5">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Attachments{" "}
                  {input.attachments.length > 0 && (
                    <span className="text-primary">({input.attachments.length})</span>
                  )}
                </h4>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={!editable}
                  className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  Upload
                </button>
              </div>
              {input.attachments.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                  No attachments
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {input.attachments.slice(0, 6).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
                      <a
                        href={a.url}
                        download={a.filename}
                        className="flex min-w-0 items-center gap-1.5 text-foreground hover:text-primary"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{a.filename}</span>
                      </a>
                      {editable && (
                        <button
                          onClick={() =>
                            setInput((p) => ({
                              ...p,
                              attachments: p.attachments.filter((x) => x.id !== a.id),
                            }))
                          }
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>

        {/* -------------------------------- Footer -------------------------------- */}
        <div className="card-soft flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
          <FooterItem
            label="Created By"
            value={record?.createdBy ?? "Priya Sharma"}
            sub={record ? new Date(record.createdAt).toLocaleString("en-IN") : "—"}
          />
          <FooterItem
            label="Last Modified By"
            value={record?.lastModifiedBy ?? "—"}
            sub={record ? new Date(record.updatedAt).toLocaleString("en-IN") : "—"}
          />
          <FooterItem
            label="Workflow Stage"
            value={PV_STAGE_LABEL[record?.currentStage ?? "problem_definition"]}
          />
          <FooterItem label="Version" value={`${record?.version ?? 1}.0`} />
          <ErpButton size="sm" variant="outline" onClick={() => setHistoryOpen(true)}>
            <HistoryIcon className="h-4 w-4" /> View Activity History
          </ErpButton>
        </div>
      </div>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Activity History</DialogTitle>
            <DialogDescription>{record?.formCode ?? "Unsaved record"}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] space-y-2 overflow-y-auto">
            {(record?.auditTrail ?? []).length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No activity yet.</p>
            ) : (
              [...(record?.auditTrail ?? [])].reverse().map((a, i) => (
                <div key={i} className="rounded-lg border border-border px-3 py-2 text-xs">
                  <p className="font-medium text-foreground">{a.event}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {a.actor} · {new Date(a.at).toLocaleString("en-IN")}
                    {a.stage ? ` · ${PV_STAGE_LABEL[a.stage]}` : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/* ------------------------------ Small pieces ------------------------------ */
function RatingRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <StarRating
        value={value}
        onChange={onChange}
        readOnly={disabled}
        size="sm"
        aria-label={label}
      />
    </div>
  );
}
function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
        </div>
        <span className="w-8 text-right text-xs font-bold tabular text-foreground">{value}</span>
      </div>
    </div>
  );
}
function AISideRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-bold tabular text-foreground">
        {value}
        <span className="text-[10px] font-medium text-muted-foreground">/100</span>
      </dd>
    </div>
  );
}
function StageAction({
  stage,
  record,
  busy,
  onComplete,
}: {
  stage: PVStage;
  record: { stages: { stage: PVStage; status: string }[]; status: string } | undefined;
  busy: string | null;
  onComplete: (s: PVStage) => void;
}) {
  if (!record) return null;
  const st = record.stages.find((s) => s.stage === stage)?.status;
  if (st === "completed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
        <Check className="h-3 w-3" /> Completed
      </span>
    );
  if (
    st !== "in_progress" ||
    !["draft", "in_progress", "more_research_required", "revision_required"].includes(record.status)
  )
    return null;
  return (
    <ErpButton size="xs" loading={busy === `stage-${stage}`} onClick={() => onComplete(stage)}>
      {busy === `stage-${stage}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Complete
      Stage
    </ErpButton>
  );
}
function HeaderCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}
function ChipShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
const CHIP_CLS =
  "inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10";

function DesignThinkingChip({
  label,
  code,
  id,
}: {
  label: string;
  code: string | null | undefined;
  id: string | null | undefined;
}) {
  return (
    <ChipShell label={label}>
      {code && id ? (
        <Link
          to="/development/research-innovation/design-thinking/new"
          search={{ id }}
          className={CHIP_CLS}
        >
          {code} <ExternalLink className="h-3 w-3" />
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </ChipShell>
  );
}
function OpportunityChip({
  label,
  code,
  id,
}: {
  label: string;
  code: string | null | undefined;
  id: string | null | undefined;
}) {
  return (
    <ChipShell label={label}>
      {code && id ? (
        <Link
          to="/development/research-innovation/opportunity-discovery/new"
          search={{ id }}
          className={CHIP_CLS}
        >
          {code} <ExternalLink className="h-3 w-3" />
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </ChipShell>
  );
}
function IdeaChip({
  label,
  code,
  ideaId,
}: {
  label: string;
  code: string | null | undefined;
  ideaId: string | null | undefined;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1">
        {code && ideaId ? (
          <Link
            to="/development/research-innovation/idea-management/$ideaId"
            params={{ ideaId }}
            className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            {code} <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">{code ?? "—"}</span>
        )}
      </div>
    </div>
  );
}
function QuickAction({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof UploadCloud;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground"
    >
      <Icon className="h-4 w-4 text-primary" /> {label}
    </button>
  );
}
function FooterItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold text-foreground">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
