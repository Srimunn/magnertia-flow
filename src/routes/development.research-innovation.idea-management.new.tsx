import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Save,
  Send,
  Sparkles,
  Plus,
  Trash2,
  MoreHorizontal,
  Copy,
  Download,
  FileText,
  UploadCloud,
  MessageSquarePlus,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  History as HistoryIcon,
  PencilLine,
  Search,
  CheckCircle2,
  XCircle,
  Archive,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AppShell } from "@/components/erp/AppShell";
import { IdeaTabBar } from "@/components/erp/IdeaTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { ErpButton } from "@/components/erp/Button";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { StarRating } from "@/components/erp/StarRating";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mock-data";
import { ideaManagementService } from "@/services";
import type {
  IdeaAttachmentCategory,
  IdeaFormInput,
  IdeaLookups,
  IdeaRecord,
  IdeaStatus,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/idea-management/new")({
  head: () => ({ meta: [{ title: "Idea Submission Form · Magnertia ERP" }] }),
  // `?id=<ideaId>` loads an existing Draft / Revision Required idea for editing.
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: IdeaSubmissionPage,
});

/* --------------------------------- Defaults -------------------------------- */
const EMPTY_INPUT: IdeaFormInput = {
  basic: {
    title: "",
    shortDescription: "",
    detailedDescription: "",
    category: "",
    subCategory: "",
    businessUnit: "",
    department: "",
    productLine: "",
    project: "",
    strategicInitiative: "",
    innovationTheme: "",
    teamMembers: [],
  },
  classification: {
    innovationType: "",
    innovationLevel: "",
    technologyArea: [],
    industry: "",
    applicationArea: "",
    marketSegment: "",
    customerType: "",
    productCategory: "",
    internalExternal: "Internal",
    openInnovation: false,
  },
  problem: {
    existingProblem: "",
    currentSolution: "",
    painPoints: "",
    rootCause: "",
    opportunityDescription: "",
    customerNeed: "",
    evidenceAvailable: false,
  },
  solution: {
    proposedSolution: "",
    uniqueValueProposition: "",
    keyFeatures: "",
    technologyUsed: [],
    noveltyDescription: "",
    competitiveAdvantage: "",
    expectedBenefits: "",
  },
  innovation: {
    technicalNovelty: 5,
    businessValue: 5,
    customerValue: 5,
    strategicAlignment: 5,
    scalability: 5,
    sustainability: 5,
    complexity: 5,
    riskLevel: 5,
  },
  businessImpact: {
    expectedRevenue: 0,
    costSaving: 0,
    timeSaving: 0,
    productivityImprovement: 0,
    qualityImprovement: 0,
    customerSatisfactionImpact: 5,
    marketExpansionPotential: 5,
    competitiveDifferentiation: 5,
  },
  technical: {
    technologyReadinessLevel: "",
    technologyAvailability: "",
    requiredRnD: false,
    prototypeRequired: false,
    estimatedDevelopmentTime: 0,
    estimatedDevelopmentCost: 0,
    requiredResources: "",
    requiredSkills: "",
  },
  ip: {
    patentable: false,
    patentSearchCompleted: false,
    existingPatentReferences: [],
    tradeSecret: false,
    copyrightApplicable: false,
    trademarkApplicable: false,
    ipComments: "",
  },
  market: {
    targetMarket: "",
    marketSize: 0,
    tam: 0,
    sam: 0,
    som: 0,
    marketGrowthRate: 0,
    customerDemand: 5,
    competitorAvailability: "",
    marketReadiness: 5,
  },
  risk: {
    technicalRisk: 5,
    financialRisk: 5,
    marketRisk: 5,
    regulatoryRisk: 5,
    operationalRisk: 5,
    supplyChainRisk: 5,
  },
  esg: {
    environmentalImpact: 5,
    energyEfficiency: 5,
    carbonReduction: 5,
    wasteReduction: 5,
    socialImpact: 5,
    governanceImpact: 5,
  },
  financials: { estimatedInvestment: 0, fundingRequired: 0 },
  attachments: [],
};

/** Extract the editable payload from a persisted idea (edit-loading). */
function recordToInput(rec: IdeaRecord): IdeaFormInput {
  return {
    basic: rec.basic,
    classification: rec.classification,
    problem: rec.problem,
    solution: rec.solution,
    innovation: rec.innovation,
    businessImpact: rec.businessImpact,
    technical: rec.technical,
    ip: {
      patentable: rec.ip.patentable,
      patentSearchCompleted: rec.ip.patentSearchCompleted,
      existingPatentReferences: rec.ip.existingPatentReferences,
      tradeSecret: rec.ip.tradeSecret,
      copyrightApplicable: rec.ip.copyrightApplicable,
      trademarkApplicable: rec.ip.trademarkApplicable,
      ipComments: rec.ip.ipComments,
    },
    market: rec.market,
    risk: rec.risk,
    esg: rec.esg,
    financials: {
      estimatedInvestment: rec.financials.estimatedInvestment,
      fundingRequired: rec.financials.fundingRequired,
    },
    attachments: rec.attachments,
  };
}

const ATTACHMENT_CATEGORIES: IdeaAttachmentCategory[] = [
  "Sketches",
  "Drawings",
  "Images",
  "CAD Files",
  "Documents",
  "Research Papers",
  "Patent Documents",
  "Videos",
  "Presentations",
];

/* ------------------------------ Stage stepper ------------------------------ */
const STAGES = [
  { key: "Draft", icon: PencilLine },
  { key: "Submitted", icon: Send },
  { key: "Under Review", icon: Search },
  { key: "Approved", icon: CheckCircle2 },
  { key: "Rejected", icon: XCircle },
  { key: "Archived", icon: Archive },
] as const;

/** Map a granular workflow status to the 6 high-level stepper buckets. */
function stageIndex(status: IdeaStatus | "Draft"): number {
  switch (status) {
    case "Draft":
      return 0;
    case "Submitted":
      return 1;
    case "Initial Screening":
    case "Technical Review":
    case "Business Review":
    case "Patentability Review":
    case "Innovation Committee Review":
    case "Revision Required":
    case "On Hold":
      return 2;
    case "Approved":
    case "Converted to Feasibility Study":
      return 3;
    case "Rejected":
      return 4;
    case "Archived":
      return 5;
    default:
      return 0;
  }
}

function StageStepper({ status }: { status: IdeaStatus }) {
  const current = stageIndex(status);
  const rejectedPath = current >= 4;
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {STAGES.map((s, i) => {
        const Icon = s.icon;
        // On the rejected/archived branch the "Approved" node is skipped/muted.
        const isSkipped = rejectedPath && i === 3;
        const done = i < current && !isSkipped;
        const active = i === current;
        return (
          <div key={s.key} className="flex shrink-0 items-center">
            <div className="flex flex-col items-center gap-1 px-1.5">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border-2 transition-colors",
                  active
                    ? s.key === "Rejected"
                      ? "border-destructive bg-destructive text-white"
                      : "border-primary bg-primary text-white"
                    : done
                      ? "border-success bg-success/10 text-success"
                      : "border-border bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] font-semibold",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.key}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <span className={cn("h-0.5 w-6 rounded", i < current ? "bg-success" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ Gauges (calc) ------------------------------ */
function bandLabel(score: number) {
  if (score >= 80) return "High Potential";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Moderate";
  if (score >= 35) return "Developing";
  return "Early Stage";
}
function scoreColor(score: number) {
  if (score >= 65) return "#22c55e";
  if (score >= 45) return "#f59e0b";
  return "#ef4444";
}
function riskColor(score: number) {
  if (score < 34) return "#22c55e";
  if (score < 67) return "#f59e0b";
  return "#ef4444";
}
function riskLabel(score: number) {
  if (score < 34) return "Low Risk";
  if (score < 67) return "Medium Risk";
  return "High Risk";
}

/** Full-circle progress ring with a centered value. */
function ScoreRing({ value, size = 132 }: { value: number; size?: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const color = scoreColor(value);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
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

/** Semicircular speedometer gauge (0..100). */
function RiskGauge({ value }: { value: number }) {
  const r = 40;
  const len = Math.PI * r;
  const off = len * (1 - Math.max(0, Math.min(100, value)) / 100);
  const color = riskColor(value);
  return (
    <div className="relative w-[132px]">
      <svg viewBox="0 0 100 56">
        <path
          d="M6 50 A44 44 0 0 1 94 50"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M6 50 A44 44 0 0 1 94 50"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="font-display text-xl font-bold tabular text-foreground">{value}</div>
        <div className="text-[11px] font-semibold" style={{ color }}>
          {riskLabel(value)}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Field primitives --------------------------- */
const INPUT =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60";

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <input
      className={cn(INPUT, error ? "border-destructive" : "border-border")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  error?: boolean;
}) {
  return (
    <textarea
      className={cn(INPUT, "resize-y", error ? "border-destructive" : "border-border")}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <input
        type="number"
        className={cn(INPUT, "border-border tabular", prefix && "pl-7", suffix && "pr-8")}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <select
      className={cn(INPUT, error ? "border-destructive" : "border-border")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      aria-label={label}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        value ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
          value ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function ToggleRow({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <Toggle value={value} onChange={onChange} label={label} />
    </div>
  );
}

function ChipMulti({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
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

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ------------------------------ Section shell ------------------------------ */
function Section({
  n,
  title,
  children,
  className,
  right,
}: {
  n: number;
  title: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <div className={cn("card-soft p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ViewMore({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-3 text-xs font-semibold text-primary hover:underline"
    >
      {open ? "View less" : "View more"}
    </button>
  );
}

const RATING_ROW = "flex items-center justify-between gap-3 py-1";

/* -------------------------------- Calc ------------------------------------- */
function avg(nums: number[]) {
  return nums.length ? nums.reduce((s, n) => s + (n || 0), 0) / nums.length : 0;
}
function calc(input: IdeaFormInput) {
  const inv = input.innovation;
  const innovationScore = Math.round(
    avg([
      inv.technicalNovelty,
      inv.businessValue,
      inv.customerValue,
      inv.strategicAlignment,
      inv.scalability,
      inv.sustainability,
    ]) * 10,
  );
  const rk = input.risk;
  const riskScore = Math.round(
    avg([
      rk.technicalRisk,
      rk.financialRisk,
      rk.marketRisk,
      rk.regulatoryRisk,
      rk.operationalRisk,
      rk.supplyChainRisk,
    ]) * 10,
  );
  return { innovationScore, riskScore };
}

const TAM_COLORS = ["#0a3c75", "#3b82f6", "#93c5fd"];

/* ================================ Page ==================================== */
function IdeaSubmissionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: editId } = Route.useSearch();

  const lookupsQuery = useQuery({
    queryKey: ["ideas", "lookups"],
    queryFn: () => ideaManagementService.fetchLookups(),
  });
  const lookups = lookupsQuery.data;

  const editQuery = useQuery({
    queryKey: ["ideas", "detail", editId],
    queryFn: () => ideaManagementService.fetchIdea(editId as string),
    enabled: !!editId,
  });
  const editRecord = editQuery.data;
  const isEdit = !!editId;

  const [input, setInput] = useState<IdeaFormInput>(EMPTY_INPUT);
  const [ideaId, setIdeaId] = useState<string | undefined>(undefined);
  const [seeded, setSeeded] = useState(false);
  const [busy, setBusy] = useState<null | "draft" | "submit">(null);
  const [showErrors, setShowErrors] = useState(false);
  const [more, setMore] = useState<Record<string, boolean>>({});
  const [attachOpen, setAttachOpen] = useState(false);

  useEffect(() => {
    if (editId && editRecord && !seeded) {
      setInput(recordToInput(editRecord));
      setIdeaId(editRecord.id);
      setSeeded(true);
    }
  }, [editId, editRecord, seeded]);

  const scores = useMemo(() => calc(input), [input]);
  const status: IdeaStatus = editRecord?.status ?? "Draft";
  const nextStageLabel = STAGES[Math.min(stageIndex(status) + 1, STAGES.length - 1)].key;

  function patch<K extends keyof IdeaFormInput>(section: K, part: Partial<IdeaFormInput[K]>) {
    setInput((prev) => ({ ...prev, [section]: { ...prev[section], ...part } }));
  }
  function toggleIn<K extends keyof IdeaFormInput>(
    section: K,
    key: keyof IdeaFormInput[K],
    value: string,
  ) {
    setInput((prev) => {
      const arr = (prev[section][key] as unknown as string[]) ?? [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [section]: { ...prev[section], [key]: next } };
    });
  }
  const toggleMore = (k: string) => setMore((m) => ({ ...m, [k]: !m[k] }));

  // Required-field validation.
  const missing = useMemo(() => {
    const m: string[] = [];
    if (!input.basic.title.trim()) m.push("Idea Title");
    if (!input.basic.category) m.push("Category");
    if (!input.basic.department) m.push("Department");
    if (!input.basic.shortDescription.trim()) m.push("Short Description");
    if (!input.problem.existingProblem.trim()) m.push("Existing Problem");
    if (!input.solution.proposedSolution.trim()) m.push("Proposed Solution");
    return m;
  }, [input]);
  const err = (name: string) => showErrors && missing.includes(name);

  async function doSave(): Promise<string | undefined> {
    setBusy("draft");
    try {
      const rec = await ideaManagementService.saveIdeaDraft(input, ideaId);
      setIdeaId(rec.id);
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success(`Draft saved · ${rec.ideaCode}`);
      return rec.id;
    } catch (e) {
      toast.error((e as Error).message);
      return undefined;
    } finally {
      setBusy(null);
    }
  }

  async function doSubmit() {
    if (missing.length > 0) {
      setShowErrors(true);
      toast.error(`Please complete: ${missing.join(", ")}`);
      return;
    }
    setBusy("submit");
    try {
      const id = ideaId ?? (await ideaManagementService.saveIdeaDraft(input, undefined)).id;
      const rec = await ideaManagementService.submitIdea(id);
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success(`${rec.ideaCode} submitted for review.`);
      navigate({
        to: "/development/research-innovation/idea-management/$ideaId",
        params: { ideaId: rec.id },
      });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function doDuplicate() {
    setBusy("draft");
    try {
      const dup: IdeaFormInput = {
        ...input,
        basic: { ...input.basic, title: `${input.basic.title} (Copy)` },
      };
      const rec = await ideaManagementService.saveIdeaDraft(dup, undefined);
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success(`Duplicated as ${rec.ideaCode}`);
      navigate({
        to: "/development/research-innovation/idea-management/new",
        search: { id: rec.id },
      });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function doExport() {
    const blob = new Blob(
      [JSON.stringify({ ideaCode: editRecord?.ideaCode ?? "DRAFT", input }, null, 2)],
      {
        type: "application/json",
      },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editRecord?.ideaCode ?? "idea-draft"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported idea JSON");
  }

  const L: IdeaLookups =
    lookups ??
    ({
      categories: [],
      businessUnits: [],
      departments: [],
      productLines: [],
      projects: [],
      strategicInitiatives: [],
      innovationThemes: [],
      employees: [],
      innovationTypes: [],
      innovationLevels: [],
      technologyAreas: [],
      industries: [],
      applicationAreas: [],
      marketSegments: [],
      customerTypes: [],
      productCategories: [],
      technologyReadinessLevels: [],
      existingPatents: [],
    } as IdeaLookups);
  const subCategories =
    L.categories.find((c) => c.name === input.basic.category)?.subCategories ?? [];

  const tamData = [
    { name: "SOM", value: Math.max(0, input.market.som) },
    { name: "SAM", value: Math.max(0, input.market.sam - input.market.som) },
    { name: "TAM", value: Math.max(0, input.market.tam - input.market.sam) },
  ];
  const tamHasData = input.market.tam > 0 || input.market.sam > 0 || input.market.som > 0;

  if (isEdit && !seeded && editQuery.isLoading) {
    return (
      <AppShell
        title="Idea Management"
        breadcrumb="Research & Innovation Development"
        tabs={<InnovationAreaTabs sub={<IdeaTabBar />} />}
      >
        <div className="space-y-4">
          <div className="h-20 animate-pulse rounded-xl bg-muted" />
          <div className="h-[500px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <ErpButton variant="outline" size="sm" loading={busy === "draft"} onClick={doSave} aria-label="Save Draft" title="Save Draft">
        <Save className="h-4 w-4" />
      </ErpButton>
      <ErpButton size="sm" loading={busy === "submit"} onClick={doSubmit} aria-label="Submit Idea" title="Submit Idea">
        <Send className="h-4 w-4" />
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
          <DropdownMenuItem onClick={doDuplicate}>
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={doExport}>
            <Download className="mr-2 h-4 w-4" /> Export JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.message("Deleting ideas isn't enabled yet.")}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <AppShell
      title="Idea Management"
      breadcrumb="Research & Innovation Development"
      description="Capture, evaluate, and track ideas through the innovation pipeline."
      tabs={<InnovationAreaTabs sub={<IdeaTabBar />} />}
    >
      <div className="space-y-5">
        {/* Idea header bar */}
        <div className="card-soft flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <div className="font-display text-xl font-bold text-foreground">
                {editRecord?.ideaCode ?? "IDEA"}
              </div>
            </div>
            <StageStepper status={status} />
          </div>
          {headerActions}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main sections */}
          <div className="min-w-0">
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {/* 1. Basic Information (full width) */}
              <Section n={1} title="Basic Information" className="lg:col-span-2 2xl:col-span-3">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="sm:col-span-2 xl:col-span-3">
                    <Field label="Idea Title" required>
                      <TextInput
                        value={input.basic.title}
                        onChange={(v) => patch("basic", { title: v })}
                        placeholder="A concise name for the idea"
                        error={err("Idea Title")}
                      />
                    </Field>
                  </div>
                  <Field label="Category" required>
                    <Select
                      value={input.basic.category}
                      onChange={(v) => patch("basic", { category: v, subCategory: "" })}
                      options={L.categories.map((c) => c.name)}
                      error={err("Category")}
                    />
                  </Field>
                  <Field label="Sub Category">
                    <Select
                      value={input.basic.subCategory}
                      onChange={(v) => patch("basic", { subCategory: v })}
                      options={subCategories}
                    />
                  </Field>
                  <Field label="Innovation Theme">
                    <Select
                      value={input.basic.innovationTheme}
                      onChange={(v) => patch("basic", { innovationTheme: v })}
                      options={L.innovationThemes}
                    />
                  </Field>
                  <div className="sm:col-span-2 xl:col-span-3">
                    <Field label="Short Description" required>
                      <TextArea
                        value={input.basic.shortDescription}
                        onChange={(v) => patch("basic", { shortDescription: v })}
                        rows={2}
                        error={err("Short Description")}
                      />
                    </Field>
                  </div>
                  <Field label="Business Unit">
                    <Select
                      value={input.basic.businessUnit}
                      onChange={(v) => patch("basic", { businessUnit: v })}
                      options={L.businessUnits}
                    />
                  </Field>
                  <Field label="Department" required>
                    <Select
                      value={input.basic.department}
                      onChange={(v) => patch("basic", { department: v })}
                      options={L.departments}
                      error={err("Department")}
                    />
                  </Field>
                  <Field label="Product Line">
                    <Select
                      value={input.basic.productLine}
                      onChange={(v) => patch("basic", { productLine: v })}
                      options={L.productLines}
                    />
                  </Field>
                  <Field label="Project">
                    <Select
                      value={input.basic.project}
                      onChange={(v) => patch("basic", { project: v })}
                      options={L.projects}
                    />
                  </Field>
                  <Field label="Strategic Initiative">
                    <Select
                      value={input.basic.strategicInitiative}
                      onChange={(v) => patch("basic", { strategicInitiative: v })}
                      options={L.strategicInitiatives}
                    />
                  </Field>
                  <Field label="Submitted By">
                    <div className="flex h-[38px] items-center gap-2 rounded-lg border border-border bg-muted/40 px-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {initials(editRecord?.submittedBy ?? "Priya Sharma")}
                      </span>
                      <span className="text-sm text-foreground">
                        {editRecord?.submittedBy ?? "Priya Sharma"}
                      </span>
                    </div>
                  </Field>
                  <div id="team-members" className="sm:col-span-2 xl:col-span-3">
                    <Field label="Team Members" hint="Imported from Employee Master (mock)">
                      <div className="space-y-2">
                        {input.basic.teamMembers.length > 0 && (
                          <div className="flex items-center gap-1">
                            {input.basic.teamMembers.slice(0, 6).map((m) => (
                              <span
                                key={m}
                                title={m}
                                className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary ring-2 ring-white"
                              >
                                {initials(m)}
                              </span>
                            ))}
                            {input.basic.teamMembers.length > 6 && (
                              <span className="text-xs text-muted-foreground">
                                +{input.basic.teamMembers.length - 6}
                              </span>
                            )}
                          </div>
                        )}
                        <ChipMulti
                          options={L.employees}
                          selected={input.basic.teamMembers}
                          onToggle={(v) => toggleIn("basic", "teamMembers", v)}
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              </Section>

              {/* 2. Idea Classification */}
              <Section n={2} title="Idea Classification">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Innovation Type">
                    <Select
                      value={input.classification.innovationType}
                      onChange={(v) => patch("classification", { innovationType: v })}
                      options={L.innovationTypes}
                    />
                  </Field>
                  <Field label="Innovation Level">
                    <Select
                      value={input.classification.innovationLevel}
                      onChange={(v) => patch("classification", { innovationLevel: v })}
                      options={L.innovationLevels}
                    />
                  </Field>
                  <Field label="Industry">
                    <Select
                      value={input.classification.industry}
                      onChange={(v) => patch("classification", { industry: v })}
                      options={L.industries}
                    />
                  </Field>
                  <Field label="Application Area">
                    <Select
                      value={input.classification.applicationArea}
                      onChange={(v) => patch("classification", { applicationArea: v })}
                      options={L.applicationAreas}
                    />
                  </Field>
                  <Field label="Market Segment">
                    <Select
                      value={input.classification.marketSegment}
                      onChange={(v) => patch("classification", { marketSegment: v })}
                      options={L.marketSegments}
                    />
                  </Field>
                  <Field label="Customer Type">
                    <Select
                      value={input.classification.customerType}
                      onChange={(v) => patch("classification", { customerType: v })}
                      options={L.customerTypes}
                    />
                  </Field>
                  <Field label="Product / Category">
                    <Select
                      value={input.classification.productCategory}
                      onChange={(v) => patch("classification", { productCategory: v })}
                      options={L.productCategories}
                    />
                  </Field>
                  <Field label="Internal / External">
                    <Select
                      value={input.classification.internalExternal}
                      onChange={(v) => patch("classification", { internalExternal: v })}
                      options={["Internal", "External"]}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Technology Area">
                      <ChipMulti
                        options={L.technologyAreas}
                        selected={input.classification.technologyArea}
                        onToggle={(v) => toggleIn("classification", "technologyArea", v)}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <ToggleRow
                      label="Open Innovation"
                      value={input.classification.openInnovation}
                      onChange={(v) => patch("classification", { openInnovation: v })}
                    />
                  </div>
                </div>
              </Section>

              {/* 3. Problem Statement */}
              <Section n={3} title="Problem Statement">
                <div className="space-y-3">
                  <Field label="Existing Problem" required>
                    <TextArea
                      value={input.problem.existingProblem}
                      onChange={(v) => patch("problem", { existingProblem: v })}
                      rows={2}
                      error={err("Existing Problem")}
                    />
                  </Field>
                  <Field label="Current Solution">
                    <TextArea
                      value={input.problem.currentSolution}
                      onChange={(v) => patch("problem", { currentSolution: v })}
                      rows={2}
                    />
                  </Field>
                  <Field label="Pain Points">
                    <TextArea
                      value={input.problem.painPoints}
                      onChange={(v) => patch("problem", { painPoints: v })}
                      rows={2}
                    />
                  </Field>
                  <Field label="Opportunity Description">
                    <TextArea
                      value={input.problem.opportunityDescription}
                      onChange={(v) => patch("problem", { opportunityDescription: v })}
                      rows={2}
                    />
                  </Field>
                  <Field label="Customer Need">
                    <TextArea
                      value={input.problem.customerNeed}
                      onChange={(v) => patch("problem", { customerNeed: v })}
                      rows={2}
                    />
                  </Field>
                  <ToggleRow
                    label="Evidence Available"
                    value={input.problem.evidenceAvailable}
                    onChange={(v) => patch("problem", { evidenceAvailable: v })}
                  />
                </div>
              </Section>

              {/* 4. Proposed Solution */}
              <Section n={4} title="Proposed Solution">
                <div className="space-y-3">
                  <Field label="Proposed Solution" required>
                    <TextArea
                      value={input.solution.proposedSolution}
                      onChange={(v) => patch("solution", { proposedSolution: v })}
                      rows={2}
                      error={err("Proposed Solution")}
                    />
                  </Field>
                  <Field label="Unique Value Proposition">
                    <TextArea
                      value={input.solution.uniqueValueProposition}
                      onChange={(v) => patch("solution", { uniqueValueProposition: v })}
                      rows={2}
                    />
                  </Field>
                  <Field label="Key Features">
                    <TextArea
                      value={input.solution.keyFeatures}
                      onChange={(v) => patch("solution", { keyFeatures: v })}
                      rows={2}
                      placeholder="One feature per line"
                    />
                  </Field>
                  {more["solution"] && (
                    <>
                      <Field label="Novelty Description">
                        <TextArea
                          value={input.solution.noveltyDescription}
                          onChange={(v) => patch("solution", { noveltyDescription: v })}
                          rows={2}
                        />
                      </Field>
                      <Field label="Competitive Advantage">
                        <TextArea
                          value={input.solution.competitiveAdvantage}
                          onChange={(v) => patch("solution", { competitiveAdvantage: v })}
                          rows={2}
                        />
                      </Field>
                      <Field label="Expected Benefits">
                        <TextArea
                          value={input.solution.expectedBenefits}
                          onChange={(v) => patch("solution", { expectedBenefits: v })}
                          rows={2}
                        />
                      </Field>
                      <Field label="Technology Used">
                        <ChipMulti
                          options={L.technologyAreas}
                          selected={input.solution.technologyUsed}
                          onToggle={(v) => toggleIn("solution", "technologyUsed", v)}
                        />
                      </Field>
                    </>
                  )}
                  <ViewMore open={!!more["solution"]} onToggle={() => toggleMore("solution")} />
                </div>
              </Section>

              {/* 5. Innovation Assessment */}
              <Section
                n={5}
                title="Innovation Assessment"
                right={
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {scores.innovationScore}/100
                  </span>
                }
              >
                <div className="space-y-0.5">
                  {(
                    [
                      ["Technical Novelty", "technicalNovelty"],
                      ["Business Value", "businessValue"],
                      ["Customer Value", "customerValue"],
                      ["Strategic Alignment", "strategicAlignment"],
                      ["Scalability", "scalability"],
                      ["Sustainability", "sustainability"],
                      ["Complexity", "complexity"],
                      ["Risk Level (lower is better)", "riskLevel"],
                    ] as const
                  ).map(([label, key]) => (
                    <div key={key} className={RATING_ROW}>
                      <span className="text-xs font-medium text-foreground">{label}</span>
                      <StarRating
                        value={input.innovation[key]}
                        onChange={(v) =>
                          patch("innovation", { [key]: v } as Partial<IdeaFormInput["innovation"]>)
                        }
                        invert={key === "riskLevel" || key === "complexity"}
                        size="sm"
                        aria-label={label}
                      />
                    </div>
                  ))}
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs font-bold text-foreground">
                      Overall Innovation Score
                    </span>
                    <span className="font-display text-lg font-bold tabular text-primary">
                      {scores.innovationScore}/100
                    </span>
                  </div>
                </div>
              </Section>

              {/* 6. Business Impact */}
              <Section n={6} title="Business Impact">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Expected Revenue">
                    <NumberInput
                      value={input.businessImpact.expectedRevenue}
                      onChange={(v) => patch("businessImpact", { expectedRevenue: v })}
                      prefix="₹"
                    />
                  </Field>
                  <Field label="Cost Saving">
                    <NumberInput
                      value={input.businessImpact.costSaving}
                      onChange={(v) => patch("businessImpact", { costSaving: v })}
                      prefix="₹"
                    />
                  </Field>
                  <Field label="Time Saving (hrs/yr)">
                    <NumberInput
                      value={input.businessImpact.timeSaving}
                      onChange={(v) => patch("businessImpact", { timeSaving: v })}
                    />
                  </Field>
                  <Field label="Productivity Improvement">
                    <NumberInput
                      value={input.businessImpact.productivityImprovement}
                      onChange={(v) => patch("businessImpact", { productivityImprovement: v })}
                      suffix="%"
                    />
                  </Field>
                  <Field label="Quality Improvement">
                    <NumberInput
                      value={input.businessImpact.qualityImprovement}
                      onChange={(v) => patch("businessImpact", { qualityImprovement: v })}
                      suffix="%"
                    />
                  </Field>
                  <div />
                  <div className={RATING_ROW}>
                    <span className="text-xs font-medium text-foreground">
                      Customer Satisfaction Impact
                    </span>
                    <StarRating
                      value={input.businessImpact.customerSatisfactionImpact}
                      onChange={(v) => patch("businessImpact", { customerSatisfactionImpact: v })}
                      size="sm"
                      aria-label="Customer Satisfaction Impact"
                    />
                  </div>
                  <div className={RATING_ROW}>
                    <span className="text-xs font-medium text-foreground">
                      Market Expansion Potential
                    </span>
                    <StarRating
                      value={input.businessImpact.marketExpansionPotential}
                      onChange={(v) => patch("businessImpact", { marketExpansionPotential: v })}
                      size="sm"
                      aria-label="Market Expansion Potential"
                    />
                  </div>
                  <div className={RATING_ROW}>
                    <span className="text-xs font-medium text-foreground">
                      Competitive Differentiation
                    </span>
                    <StarRating
                      value={input.businessImpact.competitiveDifferentiation}
                      onChange={(v) => patch("businessImpact", { competitiveDifferentiation: v })}
                      size="sm"
                      aria-label="Competitive Differentiation"
                    />
                  </div>
                </div>
              </Section>

              {/* 7. Technical Feasibility */}
              <Section n={7} title="Technical Feasibility">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Technology Readiness Level">
                    <Select
                      value={input.technical.technologyReadinessLevel}
                      onChange={(v) => patch("technical", { technologyReadinessLevel: v })}
                      options={L.technologyReadinessLevels}
                    />
                  </Field>
                  <Field label="Technology Availability">
                    <Select
                      value={input.technical.technologyAvailability}
                      onChange={(v) => patch("technical", { technologyAvailability: v })}
                      options={[
                        "Readily Available",
                        "Partially Available",
                        "Needs Development",
                        "Not Available",
                      ]}
                    />
                  </Field>
                  <ToggleRow
                    label="Required R&D"
                    value={input.technical.requiredRnD}
                    onChange={(v) => patch("technical", { requiredRnD: v })}
                  />
                  <ToggleRow
                    label="Prototype Required"
                    value={input.technical.prototypeRequired}
                    onChange={(v) => patch("technical", { prototypeRequired: v })}
                  />
                  <Field label="Estimated Development Time (months)">
                    <NumberInput
                      value={input.technical.estimatedDevelopmentTime}
                      onChange={(v) => patch("technical", { estimatedDevelopmentTime: v })}
                    />
                  </Field>
                  <Field label="Estimated Development Cost">
                    <NumberInput
                      value={input.technical.estimatedDevelopmentCost}
                      onChange={(v) => patch("technical", { estimatedDevelopmentCost: v })}
                      prefix="₹"
                    />
                  </Field>
                  {more["technical"] && (
                    <>
                      <Field label="Required Resources">
                        <TextArea
                          value={input.technical.requiredResources}
                          onChange={(v) => patch("technical", { requiredResources: v })}
                          rows={2}
                        />
                      </Field>
                      <Field label="Required Skills">
                        <TextArea
                          value={input.technical.requiredSkills}
                          onChange={(v) => patch("technical", { requiredSkills: v })}
                          rows={2}
                        />
                      </Field>
                    </>
                  )}
                </div>
                <ViewMore open={!!more["technical"]} onToggle={() => toggleMore("technical")} />
              </Section>

              {/* 8. Intellectual Property */}
              <Section n={8} title="Intellectual Property">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <ToggleRow
                    label="Patentable"
                    value={input.ip.patentable}
                    onChange={(v) => patch("ip", { patentable: v })}
                  />
                  <ToggleRow
                    label="Patent Search Completed"
                    value={input.ip.patentSearchCompleted}
                    onChange={(v) => patch("ip", { patentSearchCompleted: v })}
                  />
                  <ToggleRow
                    label="Trade Secret"
                    value={input.ip.tradeSecret}
                    onChange={(v) => patch("ip", { tradeSecret: v })}
                  />
                  <ToggleRow
                    label="Copyright Applicable"
                    value={input.ip.copyrightApplicable}
                    onChange={(v) => patch("ip", { copyrightApplicable: v })}
                  />
                  <ToggleRow
                    label="Trademark Applicable"
                    value={input.ip.trademarkApplicable}
                    onChange={(v) => patch("ip", { trademarkApplicable: v })}
                  />
                </div>
                {more["ip"] && (
                  <div className="mt-3 space-y-3">
                    <Field
                      label="Existing Patent References"
                      hint="Imported from Patent Management (mock)"
                    >
                      <ChipMulti
                        options={L.existingPatents}
                        selected={input.ip.existingPatentReferences}
                        onToggle={(v) => toggleIn("ip", "existingPatentReferences", v)}
                      />
                    </Field>
                    <Field label="IP Comments">
                      <TextArea
                        value={input.ip.ipComments}
                        onChange={(v) => patch("ip", { ipComments: v })}
                        rows={2}
                      />
                    </Field>
                  </div>
                )}
                <ViewMore open={!!more["ip"]} onToggle={() => toggleMore("ip")} />
              </Section>

              {/* 9. Market Opportunity */}
              <Section n={9} title="Market Opportunity">
                <div className="grid gap-4 sm:grid-cols-[132px_1fr]">
                  <div className="flex flex-col items-center justify-center">
                    {tamHasData ? (
                      <div className="relative h-[120px] w-[120px]">
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={tamData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={34}
                              outerRadius={54}
                              paddingAngle={2}
                              stroke="none"
                            >
                              {tamData.map((_, i) => (
                                <Cell key={i} fill={TAM_COLORS[i]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              TAM
                            </div>
                            <div className="font-display text-[13px] font-bold text-foreground">
                              {formatCurrency(input.market.tam, true)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid h-[120px] w-[120px] place-items-center rounded-full border border-dashed border-border text-center text-[10px] text-muted-foreground">
                        Enter TAM / SAM / SOM
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <Field label="Target Market">
                      <TextInput
                        value={input.market.targetMarket}
                        onChange={(v) => patch("market", { targetMarket: v })}
                      />
                    </Field>
                    <Field label="Market Growth Rate">
                      <NumberInput
                        value={input.market.marketGrowthRate}
                        onChange={(v) => patch("market", { marketGrowthRate: v })}
                        suffix="%"
                      />
                    </Field>
                    <Field label="TAM">
                      <NumberInput
                        value={input.market.tam}
                        onChange={(v) => patch("market", { tam: v })}
                        prefix="₹"
                      />
                    </Field>
                    <Field label="SAM">
                      <NumberInput
                        value={input.market.sam}
                        onChange={(v) => patch("market", { sam: v })}
                        prefix="₹"
                      />
                    </Field>
                    <Field label="SOM">
                      <NumberInput
                        value={input.market.som}
                        onChange={(v) => patch("market", { som: v })}
                        prefix="₹"
                      />
                    </Field>
                    <div />
                    <div className={RATING_ROW}>
                      <span className="text-xs font-medium text-foreground">Customer Demand</span>
                      <StarRating
                        value={input.market.customerDemand}
                        onChange={(v) => patch("market", { customerDemand: v })}
                        size="sm"
                        aria-label="Customer Demand"
                      />
                    </div>
                    <div className={RATING_ROW}>
                      <span className="text-xs font-medium text-foreground">Market Readiness</span>
                      <StarRating
                        value={input.market.marketReadiness}
                        onChange={(v) => patch("market", { marketReadiness: v })}
                        size="sm"
                        aria-label="Market Readiness"
                      />
                    </div>
                  </div>
                </div>
              </Section>

              {/* 10. Risk Assessment */}
              <Section n={10} title="Risk Assessment">
                <div className="grid gap-4 sm:grid-cols-[132px_1fr]">
                  <div className="grid place-items-center">
                    <RiskGauge value={scores.riskScore} />
                  </div>
                  <div className="space-y-0.5">
                    {(
                      [
                        ["Technical Risk", "technicalRisk"],
                        ["Financial Risk", "financialRisk"],
                        ["Market Risk", "marketRisk"],
                        ["Regulatory Risk", "regulatoryRisk"],
                        ["Operational Risk", "operationalRisk"],
                        ["Supply Chain Risk", "supplyChainRisk"],
                      ] as const
                    ).map(([label, key]) => (
                      <div key={key} className={RATING_ROW}>
                        <span className="text-xs font-medium text-foreground">{label}</span>
                        <StarRating
                          value={input.risk[key]}
                          onChange={(v) =>
                            patch("risk", { [key]: v } as Partial<IdeaFormInput["risk"]>)
                          }
                          invert
                          size="sm"
                          aria-label={label}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              {/* 11. ESG Assessment */}
              <Section n={11} title="ESG Assessment">
                <div className="space-y-0.5">
                  {(
                    [
                      ["Environmental Impact", "environmentalImpact"],
                      ["Energy Efficiency", "energyEfficiency"],
                      ["Carbon Reduction", "carbonReduction"],
                      ["Waste Reduction", "wasteReduction"],
                      ["Social Impact", "socialImpact"],
                      ["Governance Impact", "governanceImpact"],
                    ] as const
                  ).map(([label, key]) => (
                    <div key={key} className={RATING_ROW}>
                      <span className="text-xs font-medium text-foreground">{label}</span>
                      <StarRating
                        value={input.esg[key]}
                        onChange={(v) =>
                          patch("esg", { [key]: v } as Partial<IdeaFormInput["esg"]>)
                        }
                        size="sm"
                        aria-label={label}
                      />
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>

          {/* Right sidebar (sticky) */}
          <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
            {/* Overall Innovation Score */}
            <div className="card-soft p-5 text-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Overall Innovation Score
              </h4>
              <div className="mt-3 grid place-items-center">
                <ScoreRing value={scores.innovationScore} />
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                  {bandLabel(scores.innovationScore)}
                </span>
                <p className="mt-2 text-xs text-muted-foreground">
                  Priority Ranking:{" "}
                  <span className="font-semibold text-foreground">
                    {bandLabel(scores.innovationScore)}
                  </span>
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                  Calculated from ratings · AI ranking coming soon
                </p>
              </div>
            </div>

            {/* Workflow Information */}
            <div className="card-soft p-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workflow Information
              </h4>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Current Stage</dt>
                  <dd>
                    <StatusBadge status={status} />
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Next Stage</dt>
                  <dd className="font-medium text-foreground">
                    {status === "Draft" ? "Submit Idea" : nextStageLabel}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Last Updated</dt>
                  <dd className="text-foreground">
                    {editRecord
                      ? new Date(editRecord.updatedAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Updated By</dt>
                  <dd className="font-medium text-foreground">
                    {editRecord?.submittedBy ?? "Priya Sharma"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Actions */}
            <div className="card-soft p-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </h4>
              <div className="space-y-1">
                <QuickAction icon={Save} label="Save Draft" onClick={doSave} />
                <QuickAction icon={Send} label="Submit Idea" onClick={doSubmit} />
                <QuickAction
                  icon={UserPlus}
                  label="Add Team Members"
                  onClick={() =>
                    document
                      .getElementById("team-members")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                />
                <QuickAction
                  icon={UploadCloud}
                  label="Upload Attachments"
                  onClick={() => setAttachOpen((o) => !o)}
                />
                <QuickAction
                  icon={MessageSquarePlus}
                  label="Request Feedback"
                  onClick={() => toast.success("Feedback request noted for reviewers.")}
                />
              </div>
              {attachOpen && <AttachmentEditor input={input} setInput={setInput} />}
            </div>

            {/* Related Links */}
            <div className="card-soft p-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Related Links
              </h4>
              <div className="space-y-1 text-sm">
                <RelatedLink icon={BookOpen} label="Idea Guidelines" />
                <RelatedLink icon={FileText} label="Innovation Policy" />
                <RelatedLink icon={ClipboardCheck} label="Idea Evaluation Criteria" />
                <Link
                  to="/development/research-innovation/idea-management"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  <HistoryIcon className="h-4 w-4" /> Past Ideas
                </Link>
                <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-muted-foreground/60">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> AI Similar Ideas
                  </span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase">
                    Soon
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Save;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
    >
      <Icon className="h-4 w-4 text-primary" /> {label}
    </button>
  );
}

function RelatedLink({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.message(`${label} — reference doc coming soon.`)}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function AttachmentEditor({
  input,
  setInput,
}: {
  input: IdeaFormInput;
  setInput: React.Dispatch<React.SetStateAction<IdeaFormInput>>;
}) {
  const [category, setCategory] = useState<IdeaAttachmentCategory>("Documents");
  const [filename, setFilename] = useState("");
  function add() {
    if (!filename.trim()) return;
    const ext = filename.includes(".") ? filename.split(".").pop()!.toUpperCase() : "FILE";
    setInput((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        {
          id: `att-${Date.now()}`,
          category,
          filename: filename.trim(),
          fileType: ext,
          uploadedBy: "Priya Sharma",
          uploadedAt: new Date().toISOString(),
          url: `https://mock.magnertia.local/idea-attachments/${encodeURIComponent(filename.trim())}`,
        },
      ],
    }));
    setFilename("");
  }
  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <select
        className={cn(INPUT, "border-border")}
        value={category}
        onChange={(e) => setCategory(e.target.value as IdeaAttachmentCategory)}
      >
        {ATTACHMENT_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          className={cn(INPUT, "border-border")}
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="filename.pdf"
        />
        <ErpButton size="sm" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" />
        </ErpButton>
      </div>
      {input.attachments.length > 0 && (
        <ul className="space-y-1">
          {input.attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-foreground">{a.filename}</span>
              <button
                onClick={() =>
                  setInput((prev) => ({
                    ...prev,
                    attachments: prev.attachments.filter((x) => x.id !== a.id),
                  }))
                }
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
