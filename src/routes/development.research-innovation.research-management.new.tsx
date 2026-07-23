import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
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
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  ResearchInnerTabs,
  ResearchMgmtPageTabBar,
  RESEARCH_STATUS_LABEL,
  RESEARCH_TAB_LABEL,
  type ResearchTab,
} from "@/components/erp/ResearchMgmtTabBar";
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
import { researchManagementService } from "@/services";
import type {
  ResearchApprovalDecision,
  ResearchFormInput,
  ResearchManagementRecord,
  ResearchMilestone,
  ResearchStage,
  ResearchStatus,
  ResearchTRL,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/research-management/new")({
  head: () => ({ meta: [{ title: "Research Management Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string; tab?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  component: ResearchFormPage,
});

/* --------------------------------- Consts --------------------------------- */
const EDITABLE: ResearchStatus[] = [
  "planning",
  "resource_planning",
  "in_progress",
  "approved_with_conditions",
  "revision_required",
];
const STAGE_LABEL: Record<ResearchStage, string> = {
  research_planning: "Research Planning",
  resource_planning: "Resource Planning",
  research_execution: "Research Execution",
  review_approval: "Review & Approval",
};
const TRL_LEVELS: ResearchTRL[] = [
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
const DEFAULT_MILESTONE_LABELS = [
  "Literature Review Completed",
  "Coil Design & Simulation",
  "Prototype Development",
  "Testing & Validation",
  "Patent Filing",
  "Final Report",
];

function makeDefaultMilestones(): ResearchMilestone[] {
  return DEFAULT_MILESTONE_LABELS.map((label, i) => ({
    id: `ms-${i}`,
    label,
    targetDate: "",
    completed: false,
  }));
}

const EMPTY: ResearchFormInput = {
  researchTitle: "",
  researchCategory: "Applied Research",
  researchType: "Experimental Research",
  businessUnit: "",
  department: "",
  principalInvestigator: "Arjun Mehta",
  linkedOpportunityId: null,
  linkedTechnologyScoutingId: null,
  overview: {
    researchObjective: "",
    linkedInnovationPortfolioId: null,
    researchDomain: "",
    technologyDomain: "",
    strategicTheme: "",
    keywords: [],
    expectedOutcome: "",
  },
  planning: {
    researchMethodology: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    estimatedDuration: "",
    milestones: makeDefaultMilestones(),
  },
  literature: {
    papersReviewed: 0,
    patentsReviewed: 0,
    standardsReviewed: 0,
    researchGap: "",
    literatureSummary: "",
  },
  experimental: {
    testMethod: "",
    laboratory: "",
    equipmentRequired: "",
    safetyRequirements: "",
  },
  resources: {
    researchTeam: [],
    universities: [],
    budgetApproved: 0,
    budgetUtilized: 0,
  },
  outputs: {
    prototypeGenerated: false,
    publications: 0,
    patentOpportunities: 0,
    technologyDeveloped: "",
  },
  trl: "TRL 4 - Validated in Lab",
  risk: {
    technicalRisk: 5,
    marketRisk: 3,
    regulatoryRisk: 3,
    supplyChainRisk: 5,
  },
  commercialization: {
    marketSize: 0,
    commercialPotential: "Medium",
    licensingOpportunity: false,
    startupOpportunity: false,
  },
  attachments: [],
  productDevelopmentRecommendation: "",
};

function recordToInput(r: ResearchManagementRecord): ResearchFormInput {
  return {
    researchTitle: r.researchTitle,
    researchCategory: r.researchCategory,
    researchType: r.researchType,
    businessUnit: r.businessUnit,
    department: r.department,
    principalInvestigator: r.principalInvestigator,
    linkedOpportunityId: r.linkedOpportunityId,
    linkedTechnologyScoutingId: r.linkedTechnologyScoutingId,
    overview: r.overview,
    planning: r.planning,
    literature: r.literature,
    experimental: r.experimental,
    resources: r.resources,
    outputs: r.outputs,
    trl: r.trl,
    risk: r.risk,
    commercialization: r.commercialization,
    attachments: r.attachments,
    productDevelopmentRecommendation: r.productDevelopmentRecommendation,
  };
}

function monthsBetween(start: string, end: string): string {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return "";
  const months = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  return `${months} Month${months === 1 ? "" : "s"}`;
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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {p.prefix}
        </span>
      )}
      <input
        type="number"
        className={cn(INPUT, "border-border tabular", p.prefix && "pl-7", p.suffix && "pr-10")}
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
function KeywordInput(p: {
  selected: string[];
  suggestions: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const add = (kw: string) => {
    const v = kw.trim();
    if (!v || p.selected.includes(v)) return;
    p.onChange([...p.selected, v]);
    setDraft("");
  };
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {p.selected.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
          >
            {kw}
            {!p.disabled && (
              <button
                type="button"
                className="text-primary/60 hover:text-primary"
                onClick={() => p.onChange(p.selected.filter((k) => k !== kw))}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {p.selected.length === 0 && (
          <span className="text-xs text-muted-foreground">No keywords yet</span>
        )}
      </div>
      {!p.disabled && (
        <input
          className={cn(INPUT, "border-border")}
          placeholder="Add keyword and press Enter…"
          value={draft}
          list="rm-keyword-suggestions"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
        />
      )}
      <datalist id="rm-keyword-suggestions">
        {p.suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
function SectionCard(p: { n: number; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card-soft space-y-3 p-4", p.className)}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
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
        </div>
      </div>
    </div>
  );
}
function RiskBar({ label, value }: { label: string; value: number }) {
  // value 1..10 → Low/Medium/High
  const band = value >= 6.5 ? "High" : value >= 4 ? "Medium" : "Low";
  const color =
    band === "High" ? "bg-destructive" : band === "Medium" ? "bg-[#F59E0B]" : "bg-[#22C55E]";
  const textColor =
    band === "High" ? "text-destructive" : band === "Medium" ? "text-[#F59E0B]" : "text-[#22C55E]";
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs font-semibold text-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value * 10}%` }} />
      </div>
      <span className={cn("w-14 shrink-0 text-right text-xs font-bold", textColor)}>{band}</span>
    </div>
  );
}
function AIScoreRow({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? "text-success" : value >= 5 ? "text-[#F59E0B]" : "text-destructive";
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular font-bold", color)}>
        {value.toFixed(1)}{" "}
        <span className="text-[10px] font-normal text-muted-foreground">/10</span>
      </span>
    </div>
  );
}
function KpiTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-bold tabular text-foreground">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function PlaceholderTab({ tab }: { tab: ResearchTab }) {
  return (
    <div className="card-soft flex min-h-[280px] flex-col items-center justify-center gap-2 p-10 text-center">
      <FlaskConical className="h-8 w-8 text-muted-foreground/40" />
      <div className="text-sm font-bold text-foreground">{RESEARCH_TAB_LABEL[tab]}</div>
      <p className="max-w-md text-xs text-muted-foreground">
        This tab is part of the Research Management form shell. The Overview tab is fully
        functional; this section is a placeholder for a future pass.
      </p>
    </div>
  );
}

/* ================================== Page ================================== */
function ResearchFormPage() {
  const { id, tab } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const activeTab: ResearchTab = (tab as ResearchTab) || "overview";

  const lookupsQuery = useQuery({
    queryKey: ["research-management", "lookups"],
    queryFn: () => researchManagementService.fetchLookups(),
  });
  const recordQuery = useQuery({
    queryKey: ["research-management", "record", id],
    queryFn: () => researchManagementService.fetchRecord(id!),
    enabled: Boolean(id),
  });
  const sourcesQuery = useQuery({
    queryKey: ["research-management", "sources"],
    queryFn: () => researchManagementService.fetchSources(),
    enabled: !id,
  });

  const lookups = lookupsQuery.data;
  const record = recordQuery.data ?? null;

  const [form, setForm] = useState<ResearchFormInput>(EMPTY);
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (record && loadedIdRef.current !== record.id) {
      loadedIdRef.current = record.id;
      setForm(recordToInput(record));
    }
  }, [record]);

  const status: ResearchStatus = record?.status ?? "planning";
  const editable = !record || EDITABLE.includes(status);
  const currentStage = record?.currentStage ?? "research_planning";
  const allStagesDone = record ? record.stages.every((s) => s.status === "completed") : false;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<ResearchApprovalDecision>("Approved");
  const [reviewNextAction, setReviewNextAction] = useState("Proceed to Feasibility Study");
  const [reviewComments, setReviewComments] = useState("");
  const [attachCategory, setAttachCategory] = useState("Research Proposal");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["research-management"] });

  const saveMut = useMutation({
    mutationFn: () => researchManagementService.saveDraft(form, record?.id),
    onSuccess: (r) => {
      invalidate();
      toast.success(
        record ? "Research project saved." : `Research project ${r.researchId} created.`,
      );
      if (!record) {
        navigate({
          to: "/development/research-innovation/research-management/new",
          search: { id: r.id },
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const stageMut = useMutation({
    mutationFn: () => researchManagementService.completeStage(record!.id, currentStage),
    onSuccess: (r) => {
      invalidate();
      toast.success(`${STAGE_LABEL[currentStage]} completed — AI analytics updated.`);
      void r;
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const submitMut = useMutation({
    mutationFn: () => researchManagementService.submitForReview(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Research report submitted for review.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reviewMut = useMutation({
    mutationFn: () =>
      researchManagementService.review({
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
        toast.success(
          `Research approved — Feasibility Study ${r.feasibilityProjectCode} initiated.`,
        );
      else if (r.status === "approved_with_conditions")
        toast.success("Approved with conditions — improve research.");
      else if (r.status === "rejected") toast.success("Research rejected and archived.");
      else toast.success("Revision required — continue research activities.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reportMut = useMutation({
    mutationFn: () => researchManagementService.generateReport(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Research report generated — analytics refreshed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy =
    saveMut.isPending ||
    stageMut.isPending ||
    submitMut.isPending ||
    reviewMut.isPending ||
    reportMut.isPending;

  const set = <K extends keyof ResearchFormInput>(key: K, value: ResearchFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setOverview = (patch: Partial<ResearchFormInput["overview"]>) =>
    setForm((f) => ({ ...f, overview: { ...f.overview, ...patch } }));
  const setPlanning = (patch: Partial<ResearchFormInput["planning"]>) =>
    setForm((f) => ({ ...f, planning: { ...f.planning, ...patch } }));
  const setLiterature = (patch: Partial<ResearchFormInput["literature"]>) =>
    setForm((f) => ({ ...f, literature: { ...f.literature, ...patch } }));
  const setExperimental = (patch: Partial<ResearchFormInput["experimental"]>) =>
    setForm((f) => ({ ...f, experimental: { ...f.experimental, ...patch } }));
  const setResources = (patch: Partial<ResearchFormInput["resources"]>) =>
    setForm((f) => ({ ...f, resources: { ...f.resources, ...patch } }));
  const setOutputs = (patch: Partial<ResearchFormInput["outputs"]>) =>
    setForm((f) => ({ ...f, outputs: { ...f.outputs, ...patch } }));
  const setRisk = (patch: Partial<ResearchFormInput["risk"]>) =>
    setForm((f) => ({ ...f, risk: { ...f.risk, ...patch } }));
  const setComm = (patch: Partial<ResearchFormInput["commercialization"]>) =>
    setForm((f) => ({ ...f, commercialization: { ...f.commercialization, ...patch } }));

  const toggleMilestone = (msId: string) => {
    setForm((f) => ({
      ...f,
      planning: {
        ...f.planning,
        milestones: f.planning.milestones.map((m) =>
          m.id === msId ? { ...m, completed: !m.completed } : m,
        ),
      },
    }));
  };
  const setMilestoneDate = (msId: string, date: string) => {
    setForm((f) => ({
      ...f,
      planning: {
        ...f.planning,
        milestones: f.planning.milestones.map((m) =>
          m.id === msId ? { ...m, targetDate: date } : m,
        ),
      },
    }));
  };

  // Live-derived values (before persistence, so the sidebar stays in sync).
  const liveProgress = form.planning.milestones.length
    ? Math.round(
        (form.planning.milestones.filter((m) => m.completed).length /
          form.planning.milestones.length) *
          100,
      )
    : 0;
  const remainingBudget = form.resources.budgetApproved - form.resources.budgetUtilized;
  const estDuration = monthsBetween(form.planning.startDate, form.planning.endDate);

  const applyOpportunity = (oppId: string) => {
    const opp = (sourcesQuery.data?.opportunities ?? []).find((o) => o.id === oppId);
    set("linkedOpportunityId", oppId || null);
    if (!opp) return;
    setForm((f) => ({
      ...f,
      linkedOpportunityId: oppId,
      researchTitle: f.researchTitle || opp.name,
      overview: {
        ...f.overview,
        researchObjective: f.overview.researchObjective || opp.description,
        technologyDomain: f.overview.technologyDomain || opp.technologyDomain,
      },
      commercialization: {
        ...f.commercialization,
        marketSize: f.commercialization.marketSize || opp.marketSize,
      },
    }));
    toast.success(`Context loaded from ${opp.opportunityCode}.`);
  };
  const applyTechnology = (tsId: string) => {
    const ts = (sourcesQuery.data?.technologies ?? []).find((t) => t.id === tsId);
    set("linkedTechnologyScoutingId", tsId || null);
    if (!ts) return;
    setForm((f) => ({
      ...f,
      linkedTechnologyScoutingId: tsId,
      researchTitle: f.researchTitle || ts.technologyName,
      overview: {
        ...f.overview,
        technologyDomain: f.overview.technologyDomain || ts.technologyDomain,
      },
      trl: (ts.trl as ResearchTRL) || f.trl,
      commercialization: {
        ...f.commercialization,
        marketSize: f.commercialization.marketSize || ts.marketSize,
      },
    }));
    toast.success(`Context loaded from ${ts.scoutingId}.`);
  };
  const applyPortfolio = (pfId: string) => {
    const pf = (sourcesQuery.data?.portfolios ?? []).find((p) => p.id === pfId);
    setOverview({ linkedInnovationPortfolioId: pfId || null });
    if (!pf) return;
    setForm((f) => ({
      ...f,
      overview: {
        ...f.overview,
        linkedInnovationPortfolioId: pfId,
        strategicTheme: f.overview.strategicTheme || pf.strategicTheme,
      },
    }));
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
        uploadedBy: form.principalInvestigator || "Arjun Mehta",
        uploadedAt: new Date().toISOString(),
        url: "#",
      },
    ]);
    toast.success(`${file.name} attached.`);
  };

  const ai = record?.aiAnalytics ?? null;
  const kpis = record?.kpis ?? null;

  if (id && recordQuery.isLoading) {
    return (
      <AppShell
        title="Research Management"
        breadcrumb="Research & Innovation Development · Research Management"
        description="Research Management Form"
        tabs={<ResearchMgmtPageTabBar />}
      >
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-12 animate-pulse rounded-xl bg-muted" />
          <div className="h-[480px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Research Management"
      breadcrumb="Research & Innovation Development · Research Management"
      description="Research Management Form"
      tabs={<ResearchMgmtPageTabBar />}
    >
      <div className="space-y-5">
        {/* ------------------------- Record header bar ------------------------- */}
        <div className="card-soft p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Field label="Research ID">
              <TextInput value={record?.researchId ?? "Auto-generated"} disabled />
            </Field>
            <Field label="Research Title" required>
              <TextInput
                value={form.researchTitle}
                onChange={(v) => set("researchTitle", v)}
                disabled={!editable}
                placeholder="e.g. High Efficiency Wireless Power Transfer for EV Charging"
              />
            </Field>
            <Field label="Research Category" required>
              <Select
                value={form.researchCategory}
                onChange={(v) => set("researchCategory", v)}
                options={lookups?.researchCategories ?? []}
                disabled={!editable}
              />
            </Field>
            <Field label="Research Type" required>
              <Select
                value={form.researchType}
                onChange={(v) => set("researchType", v)}
                options={lookups?.researchTypes ?? []}
                disabled={!editable}
              />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Status</span>
              <div className="flex h-[38px] items-center">
                <StatusBadge status={RESEARCH_STATUS_LABEL[status]} />
              </div>
            </div>
          </div>

          {!record && (
            <div className="mt-3 grid gap-3 border-t border-border pt-3 md:grid-cols-3">
              <Field label="Source Opportunity (prefills context)">
                <select
                  className={cn(INPUT, "border-border")}
                  value={form.linkedOpportunityId ?? ""}
                  onChange={(e) => applyOpportunity(e.target.value)}
                >
                  <option value="">None</option>
                  {(sourcesQuery.data?.opportunities ?? []).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.opportunityCode} — {o.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Source Technology">
                <select
                  className={cn(INPUT, "border-border")}
                  value={form.linkedTechnologyScoutingId ?? ""}
                  onChange={(e) => applyTechnology(e.target.value)}
                >
                  <option value="">None</option>
                  {(sourcesQuery.data?.technologies ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.scoutingId} — {t.technologyName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Innovation Portfolio">
                <select
                  className={cn(INPUT, "border-border")}
                  value={form.overview.linkedInnovationPortfolioId ?? ""}
                  onChange={(e) => applyPortfolio(e.target.value)}
                >
                  <option value="">None</option>
                  {(sourcesQuery.data?.portfolios ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.portfolioCode} — {p.portfolioName}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="text-xs text-muted-foreground">
              {record ? (
                <>
                  {record.linkedOpportunityCode && (
                    <span className="mr-3">
                      Source: <span className="font-semibold">{record.linkedOpportunityCode}</span>
                    </span>
                  )}
                  Next action: <span className="font-semibold">{record.nextAction}</span>
                </>
              ) : (
                "Fill the Overview sections, then create the research project to start Stage 1."
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
                  {record ? "Save Draft" : "Create Research Project"}
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
                      <FileText className="h-4 w-4" /> Generate Research Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
                      <Activity className="h-4 w-4" /> View Full History
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

        {/* --------------------------- Inner tab bar --------------------------- */}
        <ResearchInnerTabs active={activeTab} id={record?.id ?? id} />

        {/* --------------------------- Status banners --------------------------- */}
        {record && status === "under_review" && (
          <div className="card-soft flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-warning p-4">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-[oklch(0.45_0.15_75)]" />
              <div>
                <div className="text-sm font-bold text-foreground">
                  Awaiting Innovation Committee Review
                </div>
                <div className="text-xs text-muted-foreground">
                  Innovation Director and CTO decide: approve, approve with conditions, revise, or
                  reject.
                </div>
              </div>
            </div>
            <ErpButton variant="outline" onClick={() => setReviewOpen(true)}>
              Record Decision <ChevronRight className="h-4 w-4" />
            </ErpButton>
          </div>
        )}
        {record && status === "approved_with_conditions" && record.reviewConditions && (
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
        {record && status === "approved" && record.feasibilityProjectCode && (
          <div className="card-soft flex items-center gap-2 border-l-4 border-l-success p-4 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="font-bold text-foreground">
              Feasibility Study {record.feasibilityProjectCode} initiated.
            </span>
            <span className="text-muted-foreground">Proceed to the next stage of development.</span>
          </div>
        )}

        {/* ------------------------------ Tab content ------------------------------ */}
        {!record && activeTab !== "overview" ? (
          <div className="card-soft p-6 text-center text-sm text-muted-foreground">
            Create the research project first to use the other tabs.
          </div>
        ) : activeTab !== "overview" ? (
          <PlaceholderTab tab={activeTab} />
        ) : (
          <div className="grid items-start gap-5 xl:grid-cols-[1fr_330px]">
            {/* ----------------------------- Form sections ----------------------------- */}
            <div className="grid gap-5 md:grid-cols-2">
              <SectionCard n={1} title="Research Overview">
                <Field label="Research Objective" required>
                  <TextArea
                    value={form.overview.researchObjective}
                    onChange={(v) => setOverview({ researchObjective: v })}
                    rows={3}
                    disabled={!editable}
                    placeholder="Develop next-generation high efficiency (>90%) wireless power transfer system for EV charging."
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Research Domain" required>
                    <Select
                      value={form.overview.researchDomain}
                      onChange={(v) => setOverview({ researchDomain: v })}
                      options={lookups?.researchDomains ?? []}
                      disabled={!editable}
                    />
                  </Field>
                  <Field label="Technology Domain" required>
                    <Select
                      value={form.overview.technologyDomain}
                      onChange={(v) => setOverview({ technologyDomain: v })}
                      options={lookups?.technologyDomains ?? []}
                      disabled={!editable}
                    />
                  </Field>
                </div>
                <Field label="Strategic Theme" required>
                  <Select
                    value={form.overview.strategicTheme}
                    onChange={(v) => setOverview({ strategicTheme: v })}
                    options={lookups?.strategicThemes ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Keywords" required>
                  <KeywordInput
                    selected={form.overview.keywords}
                    suggestions={lookups?.keywordSuggestions ?? []}
                    onChange={(v) => setOverview({ keywords: v })}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Expected Outcome" required>
                  <TextArea
                    value={form.overview.expectedOutcome}
                    onChange={(v) => setOverview({ expectedOutcome: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
              </SectionCard>

              <SectionCard n={2} title="Research Planning">
                <Field label="Research Methodology" required>
                  <Select
                    value={form.planning.researchMethodology}
                    onChange={(v) => setPlanning({ researchMethodology: v })}
                    options={lookups?.researchMethodologies ?? []}
                    disabled={!editable}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start Date" required>
                    <input
                      type="date"
                      className={cn(INPUT, "border-border")}
                      value={form.planning.startDate}
                      disabled={!editable}
                      onChange={(e) => setPlanning({ startDate: e.target.value })}
                    />
                  </Field>
                  <Field label="End Date" required>
                    <input
                      type="date"
                      className={cn(INPUT, "border-border")}
                      value={form.planning.endDate}
                      disabled={!editable}
                      onChange={(e) => setPlanning({ endDate: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Estimated Duration">
                  <TextInput value={estDuration || "—"} disabled />
                </Field>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">Milestones</span>
                  <div className="space-y-1.5">
                    {form.planning.milestones.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-2.5 py-1.5"
                      >
                        <button
                          type="button"
                          disabled={!editable}
                          onClick={() => toggleMilestone(m.id)}
                          className="shrink-0"
                          aria-label={`Toggle ${m.label}`}
                        >
                          {m.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </button>
                        <span
                          className={cn(
                            "flex-1 text-xs font-medium",
                            m.completed ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {m.label}
                        </span>
                        <input
                          type="date"
                          className="rounded border border-border bg-white px-1.5 py-0.5 text-[11px] text-muted-foreground disabled:bg-muted/40"
                          value={m.targetDate}
                          disabled={!editable}
                          onChange={(e) => setMilestoneDate(m.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              <SectionCard n={3} title="Literature Review">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-border bg-[#3B82F6]/5 p-2.5 text-center">
                    <div className="font-display text-lg font-bold tabular text-foreground">
                      {form.literature.papersReviewed}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Papers Reviewed</div>
                  </div>
                  <div className="rounded-lg border border-border bg-[#22C55E]/5 p-2.5 text-center">
                    <div className="font-display text-lg font-bold tabular text-foreground">
                      {form.literature.patentsReviewed}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Patents Reviewed</div>
                  </div>
                  <div className="rounded-lg border border-border bg-[#F59E0B]/5 p-2.5 text-center">
                    <div className="font-display text-lg font-bold tabular text-foreground">
                      {form.literature.standardsReviewed}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Standards Reviewed</div>
                  </div>
                </div>
                {editable && (
                  <div className="grid grid-cols-3 gap-2">
                    <NumberInput
                      value={form.literature.papersReviewed}
                      onChange={(v) => setLiterature({ papersReviewed: v })}
                    />
                    <NumberInput
                      value={form.literature.patentsReviewed}
                      onChange={(v) => setLiterature({ patentsReviewed: v })}
                    />
                    <NumberInput
                      value={form.literature.standardsReviewed}
                      onChange={(v) => setLiterature({ standardsReviewed: v })}
                    />
                  </div>
                )}
                <Field label="Research Gap" required>
                  <TextArea
                    value={form.literature.researchGap}
                    onChange={(v) => setLiterature({ researchGap: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Literature Summary" required>
                  <TextArea
                    value={form.literature.literatureSummary}
                    onChange={(v) => setLiterature({ literatureSummary: v })}
                    rows={2}
                    disabled={!editable}
                  />
                </Field>
                <button className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline">
                  <BookOpen className="h-3.5 w-3.5" /> View References
                </button>
              </SectionCard>

              <SectionCard n={4} title="Experimental Design">
                <Field label="Test Method" required>
                  <Select
                    value={form.experimental.testMethod}
                    onChange={(v) => setExperimental({ testMethod: v })}
                    options={lookups?.testMethods ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Laboratory">
                  <Select
                    value={form.experimental.laboratory}
                    onChange={(v) => setExperimental({ laboratory: v })}
                    options={lookups?.laboratories ?? []}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Equipment Required" required>
                  <TextArea
                    value={form.experimental.equipmentRequired}
                    onChange={(v) => setExperimental({ equipmentRequired: v })}
                    rows={2}
                    disabled={!editable}
                    placeholder="Vector Network Analyzer, Power Analyzer, Thermal Camera, Oscilloscope"
                  />
                </Field>
                <Field label="Safety Requirements" required>
                  <TextArea
                    value={form.experimental.safetyRequirements}
                    onChange={(v) => setExperimental({ safetyRequirements: v })}
                    rows={2}
                    disabled={!editable}
                    placeholder="High voltage safety, electromagnetic radiation monitoring, thermal safety"
                  />
                </Field>
              </SectionCard>

              <SectionCard n={5} title="Research Resources">
                <Field label="Research Team">
                  <ChipMulti
                    options={lookups?.researchTeamMembers ?? []}
                    selected={form.resources.researchTeam}
                    onToggle={(v) =>
                      setResources({
                        researchTeam: form.resources.researchTeam.includes(v)
                          ? form.resources.researchTeam.filter((x) => x !== v)
                          : [...form.resources.researchTeam, v],
                      })
                    }
                    disabled={!editable}
                  />
                </Field>
                <Field label="Universities / Partner Institutions">
                  <ChipMulti
                    options={lookups?.universities ?? []}
                    selected={form.resources.universities}
                    onToggle={(v) =>
                      setResources({
                        universities: form.resources.universities.includes(v)
                          ? form.resources.universities.filter((x) => x !== v)
                          : [...form.resources.universities, v],
                      })
                    }
                    disabled={!editable}
                  />
                </Field>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Budget Approved">
                    <NumberInput
                      value={form.resources.budgetApproved}
                      onChange={(v) => setResources({ budgetApproved: v })}
                      prefix="₹"
                      disabled={!editable}
                    />
                  </Field>
                  <Field label="Budget Utilized">
                    <NumberInput
                      value={form.resources.budgetUtilized}
                      onChange={(v) => setResources({ budgetUtilized: v })}
                      prefix="₹"
                      disabled={!editable}
                    />
                  </Field>
                  <Field label="Remaining Budget">
                    <TextInput value={formatCurrency(remainingBudget, true)} disabled />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard n={6} title="Research Outputs">
                <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                  <span className="text-xs font-semibold text-foreground">Prototype Generated</span>
                  <Toggle
                    value={form.outputs.prototypeGenerated}
                    onChange={(v) => setOutputs({ prototypeGenerated: v })}
                    disabled={!editable}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Publications">
                    <NumberInput
                      value={form.outputs.publications}
                      onChange={(v) => setOutputs({ publications: v })}
                      disabled={!editable}
                    />
                  </Field>
                  <Field label="Patent Opportunities">
                    <NumberInput
                      value={form.outputs.patentOpportunities}
                      onChange={(v) => setOutputs({ patentOpportunities: v })}
                      disabled={!editable}
                    />
                  </Field>
                </div>
                <Field label="Technology Developed" required>
                  <TextArea
                    value={form.outputs.technologyDeveloped}
                    onChange={(v) => setOutputs({ technologyDeveloped: v })}
                    rows={2}
                    disabled={!editable}
                    placeholder="High efficiency IPT coil design with optimized compensation network"
                  />
                </Field>
              </SectionCard>

              <SectionCard n={7} title="Technology Readiness">
                <div className="flex flex-wrap gap-1">
                  {TRL_LEVELS.map((level, i) => {
                    const n = i + 1;
                    const currentN = TRL_LEVELS.indexOf(form.trl) + 1;
                    const active = n <= currentN;
                    return (
                      <button
                        key={level}
                        type="button"
                        disabled={!editable}
                        onClick={() => set("trl", level)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-colors disabled:cursor-default",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/20",
                          n === currentN && "ring-2 ring-primary/40",
                        )}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
                <div className="text-sm font-semibold text-foreground">{form.trl}</div>
              </SectionCard>

              <SectionCard n={8} title="Risk Assessment">
                <div className="space-y-2.5">
                  <RiskBar label="Technical Risk" value={form.risk.technicalRisk} />
                  <RiskBar label="Market Risk" value={form.risk.marketRisk} />
                  <RiskBar label="Regulatory Risk" value={form.risk.regulatoryRisk} />
                  <RiskBar label="Supply Chain Risk" value={form.risk.supplyChainRisk} />
                </div>
                {editable && (
                  <div className="space-y-2 border-t border-border pt-3">
                    {(
                      [
                        ["Technical", "technicalRisk"],
                        ["Market", "marketRisk"],
                        ["Regulatory", "regulatoryRisk"],
                        ["Supply Chain", "supplyChainRisk"],
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
              </SectionCard>

              <SectionCard n={9} title="Commercialization">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Market Size">
                    <NumberInput
                      value={form.commercialization.marketSize}
                      onChange={(v) => setComm({ marketSize: v })}
                      prefix="₹"
                      disabled={!editable}
                    />
                  </Field>
                  <Field label="Commercial Potential">
                    <Select
                      value={form.commercialization.commercialPotential}
                      onChange={(v) =>
                        setComm({ commercialPotential: v as "Low" | "Medium" | "High" })
                      }
                      options={["Low", "Medium", "High"]}
                      disabled={!editable}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                    <span className="text-xs font-semibold text-foreground">Licensing</span>
                    <Toggle
                      value={form.commercialization.licensingOpportunity}
                      onChange={(v) => setComm({ licensingOpportunity: v })}
                      disabled={!editable}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                    <span className="text-xs font-semibold text-foreground">Startup</span>
                    <Toggle
                      value={form.commercialization.startupOpportunity}
                      onChange={(v) => setComm({ startupOpportunity: v })}
                      disabled={!editable}
                    />
                  </div>
                </div>
                <Field label="Product Development Recommendation">
                  <Select
                    value={form.productDevelopmentRecommendation}
                    onChange={(v) => set("productDevelopmentRecommendation", v)}
                    options={lookups?.productDevelopmentRecommendations ?? []}
                    disabled={!editable}
                  />
                </Field>
              </SectionCard>

              <SectionCard n={10} title="Review & Approval" className="md:col-span-2">
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
                      Reviewers are assigned when the project is created.
                    </p>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Approval Decision">
                    <TextInput value={record?.approvalDecision ?? "Under Review"} disabled />
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

              <SectionCard n={11} title="Attachments" className="md:col-span-2">
                {form.attachments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No documents attached yet.</p>
                ) : (
                  <ul className="grid gap-1.5 md:grid-cols-2">
                    {form.attachments.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-foreground">
                              {a.filename}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{a.category}</div>
                          </div>
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
                      </li>
                    ))}
                  </ul>
                )}
                {editable && (
                  <div className="flex items-center gap-2 border-t border-border pt-3">
                    <select
                      className={cn(INPUT, "border-border flex-1")}
                      value={attachCategory}
                      onChange={(e) => setAttachCategory(e.target.value)}
                    >
                      {(lookups?.attachmentCategories ?? []).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ErpButton variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="h-4 w-4" /> Attach
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

            {/* ------------------------------- Sidebar ------------------------------- */}
            <aside className="space-y-5 xl:sticky xl:top-4">
              <div className="card-soft space-y-3 p-4">
                <h3 className="text-sm font-bold text-foreground">Research Progress</h3>
                <div className="flex items-center gap-4">
                  <ProgressRing value={liveProgress} />
                  <ul className="flex-1 space-y-1.5">
                    {form.planning.milestones.slice(0, 6).map((m, i) => (
                      <li key={m.id} className="flex items-center gap-2 text-xs">
                        {m.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                        ) : i === form.planning.milestones.findIndex((x) => !x.completed) ? (
                          <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                        )}
                        <span
                          className={cn(
                            "truncate",
                            m.completed ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {m.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="card-soft space-y-3 p-4">
                <h3 className="text-sm font-bold text-foreground">Key Research KPIs</h3>
                <div className="grid grid-cols-2 gap-2">
                  <KpiTile
                    label="Research Impact"
                    value={record ? `${kpis?.researchImpactScore ?? 0}/10` : "—"}
                  />
                  <KpiTile
                    label="TRL"
                    value={`${TRL_LEVELS.indexOf(form.trl) + 1}`}
                    sub={form.trl.split(" - ")[1] ?? ""}
                  />
                  <KpiTile
                    label="Publications"
                    value={`${form.outputs.publications}`}
                    sub="Journals"
                  />
                  <KpiTile
                    label="Patent Opportunities"
                    value={`${form.outputs.patentOpportunities}`}
                    sub="In Development"
                  />
                </div>
              </div>

              <div className="card-soft space-y-3 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Brain className="h-4 w-4 text-primary" /> AI Research Analytics
                </h3>
                {ai ? (
                  <>
                    <div className="space-y-2">
                      <AIScoreRow label="AI Novelty Score" value={ai.aiNoveltyScore} />
                      <AIScoreRow label="AI Technical Merit" value={ai.aiTechnicalMerit} />
                      <AIScoreRow
                        label="AI Commercial Potential"
                        value={ai.aiCommercialPotential}
                      />
                      <AIScoreRow
                        label="AI Publication Potential"
                        value={ai.aiPublicationPotential}
                      />
                      <AIScoreRow label="AI Patent Potential" value={ai.aiPatentPotential} />
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Recommendation
                      </div>
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
                    AI analytics are generated on creation and refreshed as each stage completes.
                  </p>
                )}
              </div>

              <div className="card-soft space-y-3 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Activity className="h-4 w-4 text-primary" /> Recent Activity
                </h3>
                {record && record.auditTrail.length > 0 ? (
                  <ul className="space-y-2.5">
                    {[...record.auditTrail]
                      .slice(-4)
                      .reverse()
                      .map((a, i) => (
                        <li key={i} className="relative pl-4">
                          <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
                          <div className="text-xs font-semibold leading-snug text-foreground">
                            {a.event}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(a.at).toLocaleString("en-IN")}
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Actions on this project appear here automatically.
                  </p>
                )}
                {record && (
                  <button
                    className="text-xs font-semibold text-primary hover:underline"
                    onClick={() => setHistoryOpen(true)}
                  >
                    View Full History →
                  </button>
                )}
              </div>

              <div className="card-soft space-y-2 p-4">
                <h3 className="text-sm font-bold text-foreground">Quick Actions</h3>
                <QuickAction
                  icon={<Upload className="h-4 w-4" />}
                  label="Upload Research Data"
                  onClick={() => {
                    if (!editable) return toast.error("Project is locked in this status.");
                    fileInputRef.current?.click();
                  }}
                  disabled={!record}
                />
                <QuickAction
                  icon={<FileText className="h-4 w-4" />}
                  label="Generate Research Report"
                  onClick={() => reportMut.mutate()}
                  disabled={!record || busy}
                />
                <QuickAction
                  icon={<Landmark className="h-4 w-4" />}
                  label="Create Patent Application"
                  onClick={() =>
                    toast.success(
                      `Patent application drafted from ${record?.outputs.patentOpportunities ?? 0} opportunity(ies).`,
                    )
                  }
                  disabled={!record}
                />
                <QuickAction
                  icon={<Rocket className="h-4 w-4" />}
                  label="Advance to PoC"
                  onClick={() => {
                    if (status !== "approved")
                      return toast.error(
                        "Advance to PoC is available once the project is Approved.",
                      );
                    toast.success("Advancing to Proof of Concept.");
                  }}
                  disabled={!record || status !== "approved"}
                  highlight={status === "approved"}
                />
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* --------------------------- Committee Review dialog --------------------------- */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Innovation Committee Review</DialogTitle>
            <DialogDescription>
              {record
                ? `${record.researchTitle || record.researchId} — impact ${record.kpis.researchImpactScore}/10.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Approval Decision" required>
              <Select
                value={reviewDecision}
                onChange={(v) => setReviewDecision(v as ResearchApprovalDecision)}
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
              {record ? `${record.researchId} — full audit trail.` : ""}
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
            <DialogTitle>AI Research Insights</DialogTitle>
            <DialogDescription>
              Stage-by-stage outputs generated from the research data.
            </DialogDescription>
          </DialogHeader>
          {ai && (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs font-bold text-foreground">
                  Research Completeness Score — {ai.researchCompletenessScore}/100
                </div>
                <p className="text-xs text-muted-foreground">{ai.literatureGapAnalysis}</p>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Novelty Assessment</div>
                <p className="text-xs text-muted-foreground">{ai.noveltyAssessment}</p>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">
                  Resource & Budget Optimization
                </div>
                <p className="text-xs text-muted-foreground">
                  {ai.resourceOptimization} {ai.budgetOptimization}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Risk Assessment</div>
                <p className="text-xs text-muted-foreground">{ai.riskAssessment}</p>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">
                  Progress & Quality — quality score {ai.researchQualityScore}/100
                </div>
                <p className="text-xs text-muted-foreground">{ai.progressAnalysis}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs font-bold text-foreground">Recommendation</div>
                <p className="text-xs text-muted-foreground">{ai.recommendation}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
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
