import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  Users,
  Lightbulb,
  Target,
  Box,
  FlaskConical,
  Sparkles,
  UploadCloud,
  UserPlus,
  ClipboardList,
  CalendarClock,
  Paperclip,
  History as HistoryIcon,
  Check,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  DesignThinkingTabBar,
  DT_STATUS_LABEL,
  DT_STAGE_LABEL,
} from "@/components/erp/DesignThinkingTabBar";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mock-data";
import { designThinkingService } from "@/services";
import type {
  DesignThinkingFormInput,
  DesignThinkingLookups,
  DesignThinkingStage,
  DTAttachment,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/design-thinking/new")({
  head: () => ({ meta: [{ title: "Design Thinking Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: DesignThinkingFormPage,
});

/* --------------------------------- Defaults -------------------------------- */
const EMPTY: DesignThinkingFormInput = {
  projectName: "",
  workshopDate: new Date().toISOString().slice(0, 10),
  facilitator: "Priya Sharma",
  businessUnit: "",
  department: "",
  linkedOpportunityId: null,
  empathize: {
    customerType: "",
    targetPersona: "",
    userJourney: "",
    customerGoals: "",
    painPoints: "",
    frustrations: "",
    existingWorkaround: "",
    customerQuotes: [],
    observationNotes: "",
    interviewSummary: "",
  },
  define: {
    problemStatement: "",
    rootCause: "",
    customerNeed: "",
    opportunityStatement: "",
    designChallenge: "",
    businessImpact: "",
    successCriteria: "",
  },
  ideate: {
    brainstormSession: "",
    totalIdeasGenerated: 0,
    selectedIdea: "",
    alternativeSolutions: [],
    innovationLevel: "",
    technologyUsed: [],
    estimatedCustomerValue: 5,
    estimatedBusinessValue: 5,
  },
  prototype: {
    prototypeType: "",
    prototypeObjective: "",
    prototypeDescription: "",
    prototypeVersion: "V1.0",
    materialsRequired: "",
    estimatedCost: 0,
    estimatedDuration: 0,
    prototypeOwner: "",
  },
  test: {
    testParticipants: 0,
    testingMethod: "",
    customerFeedback: "",
    positiveFeedback: "",
    improvementSuggestions: "",
    satisfactionScore: 5,
    testResult: "",
    recommendation: "",
  },
  attachments: [],
};

const STAGES: { key: DesignThinkingStage; label: string; sub: string; icon: typeof Users }[] = [
  { key: "empathize", label: "Empathize", sub: "Customer Understanding", icon: Users },
  { key: "define", label: "Define", sub: "Problem Definition", icon: Target },
  { key: "ideate", label: "Ideate", sub: "Solution Brainstorming", icon: Lightbulb },
  { key: "prototype", label: "Prototype", sub: "Prototype Planning", icon: Box },
  { key: "test", label: "Test", sub: "User Validation", icon: FlaskConical },
];
const STAGE_ACCENT: Record<DesignThinkingStage, string> = {
  empathize: "bg-[#3B82F6]/10 text-[#3B82F6]",
  define: "bg-[#7C5CFF]/10 text-[#7C5CFF]",
  ideate: "bg-[#22C55E]/10 text-[#22C55E]",
  prototype: "bg-[#F59E0B]/10 text-[#F59E0B]",
  test: "bg-primary/10 text-primary",
};

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
        className={cn(INPUT, "border-border tabular", p.prefix && "pl-7")}
        value={Number.isFinite(p.value) ? p.value : 0}
        disabled={p.disabled}
        onChange={(e) => p.onChange(Number(e.target.value))}
      />
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
/** Repeatable free-text list (customer quotes, alternative solutions). */
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
              className="flex items-start justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs"
            >
              <span className="text-foreground">{it}</span>
              {!p.disabled && (
                <button
                  onClick={() => p.onChange(p.items.filter((_, x) => x !== i))}
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

function ScoreTile({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 7.5 ? "text-success" : value >= 5 ? "text-[#F59E0B]" : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
      <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
      <div className={cn("font-display text-lg font-bold tabular", tone)}>
        {value}
        <span className="text-[10px] font-medium text-muted-foreground">/10</span>
      </div>
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const rad = 42;
  const c = 2 * Math.PI * rad;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const color = value >= 70 ? "#22c55e" : value >= 45 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative h-[92px] w-[92px] shrink-0">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={rad} fill="none" stroke="var(--muted)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={rad}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-lg font-bold tabular text-foreground">{value}</div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">/100</div>
        </div>
      </div>
    </div>
  );
}

function Section({
  n,
  title,
  sub,
  stage,
  children,
  locked,
  right,
  className,
}: {
  n: number;
  title: string;
  sub?: string;
  stage?: DesignThinkingStage;
  children: ReactNode;
  locked?: boolean;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-soft p-5", locked && "opacity-60", className)}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="text-sm font-bold text-foreground">{title}</h3>
            {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
          </div>
        </div>
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

/* ================================== Page =================================== */
function DesignThinkingFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: editId } = Route.useSearch();

  const lookupsQuery = useQuery({
    queryKey: ["design-thinking", "lookups"],
    queryFn: () => designThinkingService.fetchLookups(),
  });
  const oppsQuery = useQuery({
    queryKey: ["design-thinking", "approved-opps"],
    queryFn: () => designThinkingService.fetchApprovedOpportunities(),
  });
  const projectQuery = useQuery({
    queryKey: ["design-thinking", "detail", editId],
    queryFn: () => designThinkingService.fetchProject(editId as string),
    enabled: !!editId,
  });

  const record = projectQuery.data?.record;
  const glance = projectQuery.data?.glance ?? null;

  const [input, setInput] = useState<DesignThinkingFormInput>(EMPTY);
  const [seeded, setSeeded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editId && record && !seeded) {
      setInput({
        projectName: record.projectName,
        workshopDate: record.workshopDate,
        facilitator: record.facilitator,
        businessUnit: record.businessUnit,
        department: record.department,
        linkedOpportunityId: record.linkedOpportunityId,
        empathize: record.empathize,
        define: record.define,
        ideate: record.ideate,
        prototype: record.prototype,
        test: record.test,
        attachments: record.attachments,
      });
      setSeeded(true);
    }
  }, [editId, record, seeded]);

  const L: DesignThinkingLookups = lookupsQuery.data ?? {
    customerTypes: [],
    testingMethods: [],
    prototypeTypes: [],
    innovationLevels: [],
    testResults: [],
    recommendations: [],
    technologies: [],
    facilitators: [],
    projects: [],
    businessUnits: [],
    departments: [],
    attachmentCategories: [],
  };

  const status = record?.status ?? "draft";
  const editable = ["draft", "in_progress", "revision_required"].includes(status);
  const stageState = (s: DesignThinkingStage) => record?.stages.find((x) => x.stage === s);
  const stageLocked = (s: DesignThinkingStage) =>
    record ? stageState(s)?.status === "pending" : s !== "empathize";
  const stageEditable = (s: DesignThinkingStage) => editable && !stageLocked(s);

  function patch<K extends keyof DesignThinkingFormInput>(
    section: K,
    part: Partial<DesignThinkingFormInput[K]>,
  ) {
    setInput((prev) => ({ ...prev, [section]: { ...(prev[section] as object), ...part } }));
  }

  /* -------------------------------- Actions -------------------------------- */
  async function doSave() {
    if (!input.linkedOpportunityId) {
      toast.error("Select an approved Opportunity first.");
      return;
    }
    setBusy("save");
    try {
      const res = await designThinkingService.saveDraft(input, record?.id);
      queryClient.invalidateQueries({ queryKey: ["design-thinking"] });
      toast.success(`Saved · ${res.record.formCode}`);
      if (!editId)
        navigate({
          to: "/development/research-innovation/design-thinking/new",
          search: { id: res.record.id },
        });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function doCompleteStage(stage: DesignThinkingStage) {
    if (!record) return;
    setBusy(`stage-${stage}`);
    try {
      await designThinkingService.saveDraft(input, record.id);
      const res = await designThinkingService.completeStage(record.id, stage);
      queryClient.invalidateQueries({ queryKey: ["design-thinking"] });
      toast.success(`${DT_STAGE_LABEL[stage]} completed — AI analysis generated.`);
      if (res.record.status === "in_progress" && res.record.currentStage !== stage) {
        toast.message(`Next: ${DT_STAGE_LABEL[res.record.currentStage]}`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function doGenerateAI() {
    if (!record) {
      toast.error("Save the project first.");
      return;
    }
    setBusy("ai");
    try {
      await designThinkingService.saveDraft(input, record.id);
      await designThinkingService.generateAIInsights(record.id);
      queryClient.invalidateQueries({ queryKey: ["design-thinking"] });
      toast.success("AI insights generated.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function doSubmit() {
    if (!record) {
      toast.error("Save the project first.");
      return;
    }
    setBusy("submit");
    try {
      await designThinkingService.saveDraft(input, record.id);
      await designThinkingService.submitForReview(record.id);
      queryClient.invalidateQueries({ queryKey: ["design-thinking"] });
      toast.success("Submitted for design review.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function doReview(decision: "Approved" | "Revision Required" | "Rejected") {
    if (!record) return;
    setBusy("review");
    try {
      const res = await designThinkingService.review({
        id: record.id,
        decision,
        comments: decision === "Revision Required" ? "Reviewer requested changes" : undefined,
        returnToStage: decision === "Revision Required" ? "ideate" : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["design-thinking"] });
      toast.success(
        res.record.problemValidationCode
          ? `Approved — Problem Validation ${res.record.problemValidationCode} created.`
          : `Design review: ${decision}`,
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const added: DTAttachment[] = Array.from(files).map((f) => ({
      id: `att-${Date.now()}-${f.name}`,
      category: L.attachmentCategories[0] ?? "Design Documents",
      filename: f.name,
      fileType: (f.name.split(".").pop() ?? "FILE").toUpperCase(),
      uploadedBy: "Priya Sharma",
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(f),
    }));
    setInput((p) => ({ ...p, attachments: [...p.attachments, ...added] }));
    toast.success(`${added.length} file(s) attached — remember to Save.`);
  }

  /* ------------------------------ Creation gate ----------------------------- */
  const approvedOpps = oppsQuery.data ?? [];
  const selectedOpp = approvedOpps.find((o) => o.id === input.linkedOpportunityId);

  function pickOpportunity(id: string) {
    const o = approvedOpps.find((x) => x.id === id);
    if (!o) {
      setInput((p) => ({ ...p, linkedOpportunityId: null }));
      return;
    }
    // Auto-retrieve idea + opportunity + customer context into the form.
    setInput((p) => ({
      ...p,
      linkedOpportunityId: o.id,
      projectName: p.projectName || o.name,
      businessUnit: p.businessUnit || o.businessUnit,
      department: p.department || o.department,
      empathize: {
        ...p.empathize,
        customerType: p.empathize.customerType || o.targetCustomer,
        painPoints: p.empathize.painPoints || o.painPoints,
      },
      define: { ...p.define, customerNeed: p.define.customerNeed || o.customerNeed },
    }));
    toast.success(
      `Context pulled from ${o.opportunityCode}${o.ideaCode ? ` and ${o.ideaCode}` : ""}`,
    );
  }

  if (editId && !seeded && projectQuery.isLoading) {
    return (
      <AppShell
        title="Design Thinking"
        breadcrumb="Research & Innovation Development"
        tabs={<InnovationAreaTabs sub={<DesignThinkingTabBar />} />}
      >
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-[500px] animate-pulse rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  const assessment = record?.assessment;
  const ai = record?.aiAssistant;

  return (
    <AppShell
      title="Design Thinking"
      breadcrumb="Research & Innovation Development"
      description="Run design-thinking cycles from empathy through tested prototypes."
      tabs={<InnovationAreaTabs sub={<DesignThinkingTabBar />} />}
    >
      <div className="space-y-5">
        {/* ---------------------------- Record header ---------------------------- */}
        <div className="card-soft p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid flex-1 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              <HeaderCell label="Form Code" value={record?.formCode ?? "—"} />
              <HeaderCell label="Design Thinking ID" value={record?.designThinkingId ?? "—"} />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Project
                </div>
                {editable ? (
                  <select
                    className={cn(INPUT, "mt-1 border-border")}
                    value={input.projectName}
                    onChange={(e) => setInput((p) => ({ ...p, projectName: e.target.value }))}
                  >
                    <option value="">Select project…</option>
                    {L.projects.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    {record?.projectName || "—"}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Linked Opportunity
                </div>
                <div className="mt-1">
                  {record?.linkedOpportunityId ? (
                    <Link
                      to="/development/research-innovation/opportunity-discovery/new"
                      search={{ id: record.linkedOpportunityId }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
                    >
                      {record.linkedOpportunityCode}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not linked</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Linked Idea
                </div>
                <div className="mt-1">
                  {record?.linkedIdeaId ? (
                    <Link
                      to="/development/research-innovation/idea-management/$ideaId"
                      params={{ ideaId: record.linkedIdeaId }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
                    >
                      {record.linkedIdeaCode}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Status
                </div>
                <div className="mt-1.5">
                  <StatusBadge status={DT_STATUS_LABEL[status] ?? status} />
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
                aria-label="Save Draft"
                title="Save Draft"
              >
                <Save className="h-4 w-4" />
              </ErpButton>
              <ErpButton
                size="sm"
                loading={busy === "submit"}
                disabled={!editable || !record}
                onClick={doSubmit}
                aria-label="Submit for Review"
                title="Submit for Review"
              >
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
                  <DropdownMenuItem
                    onClick={() => {
                      const blob = new Blob(
                        [
                          JSON.stringify(
                            { code: record?.formCode, input, assessment, ai },
                            null,
                            2,
                          ),
                        ],
                        { type: "application/json" },
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${record?.formCode ?? "design-thinking"}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Exported JSON");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" /> Export JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.message("Deleting projects isn't enabled yet.")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Creation gate: pick an approved opportunity */}
          {!record && (
            <div className="mt-4 rounded-lg border border-primary/25 bg-primary/5 p-3">
              <p className="mb-2 text-xs font-semibold text-foreground">
                A Design Thinking project starts from an{" "}
                <span className="text-primary">approved Opportunity</span>.
              </p>
              {approvedOpps.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No approved opportunities yet —{" "}
                  <Link
                    to="/development/research-innovation/opportunity-discovery"
                    className="font-semibold text-primary hover:underline"
                  >
                    approve one in Opportunity Discovery
                  </Link>{" "}
                  first.
                </p>
              ) : (
                <select
                  className={cn(INPUT, "border-border")}
                  value={input.linkedOpportunityId ?? ""}
                  onChange={(e) => pickOpportunity(e.target.value)}
                >
                  <option value="">Select an approved opportunity…</option>
                  {approvedOpps.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.opportunityCode} — {o.name}
                    </option>
                  ))}
                </select>
              )}
              {selectedOpp && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Will pull context from {selectedOpp.opportunityCode}
                  {selectedOpp.ideaCode ? ` and ${selectedOpp.ideaCode}` : ""}. Click{" "}
                  <strong>Save Draft</strong> to create.
                </p>
              )}
            </div>
          )}

          {record?.reviewComments && status === "revision_required" && (
            <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-[oklch(0.45_0.15_75)]">
              <span className="font-semibold">Revision requested:</span> {record.reviewComments}
            </div>
          )}
        </div>

        {/* --------------------------- Process tracker --------------------------- */}
        <div className="card-soft overflow-x-auto p-4">
          <div className="flex min-w-max items-center gap-2">
            {STAGES.map((s, i) => {
              const st =
                stageState(s.key)?.status ?? (i === 0 && !record ? "in_progress" : "pending");
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center">
                  <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                        st === "completed"
                          ? "bg-success/15 text-success"
                          : st === "in_progress"
                            ? STAGE_ACCENT[s.key]
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
                          "text-[13px] font-bold",
                          st === "pending" ? "text-muted-foreground" : "text-foreground",
                        )}
                      >
                        {s.label}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wide",
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
                        "h-0.5 w-8 rounded",
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
            {/* 1 — Empathize */}
            <Section
              n={1}
              title="Empathize"
              sub="Customer Understanding"
              stage="empathize"
              locked={stageLocked("empathize")}
              right={
                <StageAction
                  stage="empathize"
                  record={record}
                  busy={busy}
                  onComplete={doCompleteStage}
                />
              }
            >
              <div className="space-y-3">
                <Field label="Customer Type" required>
                  <Select
                    value={input.empathize.customerType}
                    onChange={(v) => patch("empathize", { customerType: v })}
                    options={L.customerTypes}
                    disabled={!stageEditable("empathize")}
                  />
                </Field>
                <Field label="Target Persona" required>
                  <TextInput
                    value={input.empathize.targetPersona}
                    onChange={(v) => patch("empathize", { targetPersona: v })}
                    disabled={!stageEditable("empathize")}
                  />
                </Field>
                <Field label="User Journey">
                  <TextArea
                    value={input.empathize.userJourney}
                    onChange={(v) => patch("empathize", { userJourney: v })}
                    disabled={!stageEditable("empathize")}
                  />
                </Field>
                <Field label="Customer Goals">
                  <TextArea
                    value={input.empathize.customerGoals}
                    onChange={(v) => patch("empathize", { customerGoals: v })}
                    disabled={!stageEditable("empathize")}
                  />
                </Field>
                <Field label="Pain Points">
                  <TextArea
                    value={input.empathize.painPoints}
                    onChange={(v) => patch("empathize", { painPoints: v })}
                    disabled={!stageEditable("empathize")}
                  />
                </Field>
                <Field label="Frustrations">
                  <TextArea
                    value={input.empathize.frustrations}
                    onChange={(v) => patch("empathize", { frustrations: v })}
                    disabled={!stageEditable("empathize")}
                  />
                </Field>
                <Field label="Existing Workaround">
                  <TextArea
                    value={input.empathize.existingWorkaround}
                    onChange={(v) => patch("empathize", { existingWorkaround: v })}
                    disabled={!stageEditable("empathize")}
                  />
                </Field>
                <Field label="Customer Quotes">
                  <RepeatList
                    items={input.empathize.customerQuotes}
                    onChange={(v) => patch("empathize", { customerQuotes: v })}
                    placeholder='"We need early alerts…" — Maintenance Head'
                    disabled={!stageEditable("empathize")}
                  />
                </Field>
                <Field label="Observation Notes">
                  <TextArea
                    value={input.empathize.observationNotes}
                    onChange={(v) => patch("empathize", { observationNotes: v })}
                    disabled={!stageEditable("empathize")}
                  />
                </Field>
                <Field label="Interview Summary">
                  <TextArea
                    value={input.empathize.interviewSummary}
                    onChange={(v) => patch("empathize", { interviewSummary: v })}
                    disabled={!stageEditable("empathize")}
                  />
                </Field>
              </div>
            </Section>

            {/* 2 — Define */}
            <Section
              n={2}
              title="Define"
              sub="Problem Definition"
              stage="define"
              locked={stageLocked("define")}
              right={
                <StageAction
                  stage="define"
                  record={record}
                  busy={busy}
                  onComplete={doCompleteStage}
                />
              }
            >
              <div className="space-y-3">
                <Field label="Problem Statement" required>
                  <TextArea
                    value={input.define.problemStatement}
                    onChange={(v) => patch("define", { problemStatement: v })}
                    rows={3}
                    disabled={!stageEditable("define")}
                  />
                </Field>
                <Field label="Root Cause">
                  <TextArea
                    value={input.define.rootCause}
                    onChange={(v) => patch("define", { rootCause: v })}
                    disabled={!stageEditable("define")}
                  />
                </Field>
                <Field label="Customer Need">
                  <TextArea
                    value={input.define.customerNeed}
                    onChange={(v) => patch("define", { customerNeed: v })}
                    disabled={!stageEditable("define")}
                  />
                </Field>
                <Field label="Opportunity Statement">
                  <TextArea
                    value={input.define.opportunityStatement}
                    onChange={(v) => patch("define", { opportunityStatement: v })}
                    disabled={!stageEditable("define")}
                  />
                </Field>
                <Field label="Design Challenge">
                  <TextArea
                    value={input.define.designChallenge}
                    onChange={(v) => patch("define", { designChallenge: v })}
                    disabled={!stageEditable("define")}
                  />
                </Field>
                <Field label="Business Impact">
                  <TextArea
                    value={input.define.businessImpact}
                    onChange={(v) => patch("define", { businessImpact: v })}
                    disabled={!stageEditable("define")}
                  />
                </Field>
                <Field label="Success Criteria">
                  <TextArea
                    value={input.define.successCriteria}
                    onChange={(v) => patch("define", { successCriteria: v })}
                    disabled={!stageEditable("define")}
                  />
                </Field>
              </div>
            </Section>

            {/* 3 — Ideate */}
            <Section
              n={3}
              title="Ideate"
              sub="Solution Brainstorming"
              stage="ideate"
              locked={stageLocked("ideate")}
              right={
                <StageAction
                  stage="ideate"
                  record={record}
                  busy={busy}
                  onComplete={doCompleteStage}
                />
              }
            >
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Brainstorm Session">
                    <TextInput
                      value={input.ideate.brainstormSession}
                      onChange={(v) => patch("ideate", { brainstormSession: v })}
                      disabled={!stageEditable("ideate")}
                      placeholder="DT Workshop — 20 May"
                    />
                  </Field>
                  <Field label="Total Ideas Generated">
                    <NumberInput
                      value={input.ideate.totalIdeasGenerated}
                      onChange={(v) => patch("ideate", { totalIdeasGenerated: v })}
                      disabled={!stageEditable("ideate")}
                    />
                  </Field>
                </div>
                <Field label="Selected Idea" required>
                  <TextInput
                    value={input.ideate.selectedIdea}
                    onChange={(v) => patch("ideate", { selectedIdea: v })}
                    disabled={!stageEditable("ideate")}
                  />
                </Field>
                <Field label="Alternative Solutions">
                  <RepeatList
                    items={input.ideate.alternativeSolutions}
                    onChange={(v) => patch("ideate", { alternativeSolutions: v })}
                    placeholder="IoT sensors, vibration analysis…"
                    disabled={!stageEditable("ideate")}
                  />
                </Field>
                <Field label="Innovation Level">
                  <Select
                    value={input.ideate.innovationLevel}
                    onChange={(v) => patch("ideate", { innovationLevel: v })}
                    options={L.innovationLevels}
                    disabled={!stageEditable("ideate")}
                  />
                </Field>
                <Field label="Technology Used">
                  <ChipMulti
                    options={L.technologies}
                    selected={input.ideate.technologyUsed}
                    disabled={!stageEditable("ideate")}
                    onToggle={(v) =>
                      patch("ideate", {
                        technologyUsed: input.ideate.technologyUsed.includes(v)
                          ? input.ideate.technologyUsed.filter((x) => x !== v)
                          : [...input.ideate.technologyUsed, v],
                      })
                    }
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-semibold text-foreground">
                      Est. Customer Value
                    </span>
                    <div className="mt-1">
                      <StarRating
                        value={input.ideate.estimatedCustomerValue}
                        onChange={(v) => patch("ideate", { estimatedCustomerValue: v })}
                        readOnly={!stageEditable("ideate")}
                        size="sm"
                        aria-label="Estimated Customer Value"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground">
                      Est. Business Value
                    </span>
                    <div className="mt-1">
                      <StarRating
                        value={input.ideate.estimatedBusinessValue}
                        onChange={(v) => patch("ideate", { estimatedBusinessValue: v })}
                        readOnly={!stageEditable("ideate")}
                        size="sm"
                        aria-label="Estimated Business Value"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* 4 — Prototype */}
            <Section
              n={4}
              title="Prototype Development"
              sub="Prototype Planning"
              stage="prototype"
              locked={stageLocked("prototype")}
              right={
                <StageAction
                  stage="prototype"
                  record={record}
                  busy={busy}
                  onComplete={doCompleteStage}
                />
              }
            >
              <div className="space-y-3">
                <Field label="Prototype Type" required>
                  <Select
                    value={input.prototype.prototypeType}
                    onChange={(v) => patch("prototype", { prototypeType: v })}
                    options={L.prototypeTypes}
                    disabled={!stageEditable("prototype")}
                  />
                </Field>
                <Field label="Prototype Objective">
                  <TextArea
                    value={input.prototype.prototypeObjective}
                    onChange={(v) => patch("prototype", { prototypeObjective: v })}
                    disabled={!stageEditable("prototype")}
                  />
                </Field>
                <Field label="Prototype Description">
                  <TextArea
                    value={input.prototype.prototypeDescription}
                    onChange={(v) => patch("prototype", { prototypeDescription: v })}
                    disabled={!stageEditable("prototype")}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Prototype Version">
                    <TextInput value={input.prototype.prototypeVersion} disabled />
                  </Field>
                  <Field label="Prototype Owner">
                    <Select
                      value={input.prototype.prototypeOwner}
                      onChange={(v) => patch("prototype", { prototypeOwner: v })}
                      options={L.facilitators}
                      disabled={!stageEditable("prototype")}
                    />
                  </Field>
                </div>
                <Field label="Materials Required">
                  <TextArea
                    value={input.prototype.materialsRequired}
                    onChange={(v) => patch("prototype", { materialsRequired: v })}
                    disabled={!stageEditable("prototype")}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Estimated Cost">
                    <NumberInput
                      value={input.prototype.estimatedCost}
                      onChange={(v) => patch("prototype", { estimatedCost: v })}
                      prefix="₹"
                      disabled={!stageEditable("prototype")}
                    />
                  </Field>
                  <Field label="Estimated Duration (days)">
                    <NumberInput
                      value={input.prototype.estimatedDuration}
                      onChange={(v) => patch("prototype", { estimatedDuration: v })}
                      disabled={!stageEditable("prototype")}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* 5 — Test */}
            <Section
              n={5}
              title="Test"
              sub="User Validation"
              stage="test"
              locked={stageLocked("test")}
              right={
                <StageAction
                  stage="test"
                  record={record}
                  busy={busy}
                  onComplete={doCompleteStage}
                />
              }
            >
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Test Participants">
                    <NumberInput
                      value={input.test.testParticipants}
                      onChange={(v) => patch("test", { testParticipants: v })}
                      disabled={!stageEditable("test")}
                    />
                  </Field>
                  <Field label="Testing Method" required>
                    <Select
                      value={input.test.testingMethod}
                      onChange={(v) => patch("test", { testingMethod: v })}
                      options={L.testingMethods}
                      disabled={!stageEditable("test")}
                    />
                  </Field>
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground">Satisfaction Score</span>
                  <div className="mt-1">
                    <StarRating
                      value={input.test.satisfactionScore}
                      onChange={(v) => patch("test", { satisfactionScore: v })}
                      readOnly={!stageEditable("test")}
                      size="sm"
                      aria-label="Satisfaction Score"
                    />
                  </div>
                </div>
                <Field label="Customer Feedback">
                  <TextArea
                    value={input.test.customerFeedback}
                    onChange={(v) => patch("test", { customerFeedback: v })}
                    disabled={!stageEditable("test")}
                  />
                </Field>
                <Field label="Positive Feedback">
                  <TextArea
                    value={input.test.positiveFeedback}
                    onChange={(v) => patch("test", { positiveFeedback: v })}
                    disabled={!stageEditable("test")}
                  />
                </Field>
                <Field label="Improvement Suggestions">
                  <TextArea
                    value={input.test.improvementSuggestions}
                    onChange={(v) => patch("test", { improvementSuggestions: v })}
                    disabled={!stageEditable("test")}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Test Result" required>
                    <Select
                      value={input.test.testResult}
                      onChange={(v) => patch("test", { testResult: v })}
                      options={L.testResults}
                      disabled={!stageEditable("test")}
                    />
                  </Field>
                  <Field label="Recommendation">
                    <Select
                      value={input.test.recommendation}
                      onChange={(v) => patch("test", { recommendation: v })}
                      options={L.recommendations}
                      disabled={!stageEditable("test")}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* 6 — Innovation Assessment */}
            <Section n={6} title="Innovation Assessment" sub="Calculated from all stages">
              {assessment ? (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <ScoreTile label="Customer Value" value={assessment.customerValueScore} />
                    <ScoreTile label="Innovation" value={assessment.innovationScore} />
                    <ScoreTile
                      label="Technical Feasibility"
                      value={assessment.technicalFeasibility}
                    />
                    <ScoreTile
                      label="Business Feasibility"
                      value={assessment.businessFeasibility}
                    />
                    <ScoreTile label="Market Potential" value={assessment.marketPotential} />
                    <ScoreTile label="ESG Impact" value={assessment.esgImpact} />
                  </div>
                  <div className="mt-3 rounded-lg border border-primary/25 bg-primary/5 py-3 text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Overall Design Score
                    </div>
                    <div className="font-display text-3xl font-bold text-primary">
                      {assessment.overallDesignScore}
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Save the project to calculate assessment scores.
                </p>
              )}
            </Section>

            {/* 7 — AI Assistant */}
            <Section
              n={7}
              title="AI Design Thinking Assistant"
              sub="Generated from the entered data"
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
                <div className="space-y-2.5">
                  <AIRow label="AI Persona Analysis" text={ai.personaAnalysis} />
                  <AIRow label="AI Pain Point Analysis" text={ai.painPointAnalysis} />
                  <AIRow label="AI Suggested Ideas" text={ai.suggestedIdeas} />
                  <AIRow label="AI Prototype Suggestions" text={ai.prototypeSuggestions} />
                  <AIRow label="AI Risk Analysis" text={ai.riskAnalysis} />
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-border p-3">
                    <ScoreRing value={ai.aiOpportunityScore} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">AI Recommendation</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {ai.recommendation}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        Generated {new Date(ai.generatedAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Run <strong>Generate AI Insights</strong> (or complete a stage) to populate this
                  panel.
                </p>
              )}
            </Section>
          </div>

          {/* -------------------------------- Sidebar -------------------------------- */}
          <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
            <div className="card-soft p-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Opportunity At A Glance
              </h4>
              {glance ? (
                <dl className="space-y-2.5 text-sm">
                  <GlanceRow label="Opportunity Name" value={glance.name} />
                  <GlanceRow label="Opportunity Category" value={glance.category || "—"} />
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-muted-foreground">Market Potential</dt>
                    <dd>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-bold",
                          glance.marketPotential === "High"
                            ? "bg-success/10 text-success"
                            : "bg-warning/15 text-[oklch(0.45_0.15_75)]",
                        )}
                      >
                        {glance.marketPotential}
                      </span>
                    </dd>
                  </div>
                  <GlanceRow
                    label="Strategic Initiative"
                    value={glance.strategicInitiative || "—"}
                  />
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <dt className="text-xs text-muted-foreground">Overall Opportunity Score</dt>
                    <dd className="font-display text-lg font-bold text-primary">
                      {glance.overallOpportunityScore}
                      <span className="text-[10px] text-muted-foreground">/100</span>
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Link an approved opportunity to see its summary.
                </p>
              )}
            </div>

            {/* Reviewer actions when under review */}
            {status === "under_review" && (
              <div className="card-soft p-5">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Design Review
                </h4>
                <div className="flex flex-wrap gap-2">
                  <ErpButton
                    size="sm"
                    loading={busy === "review"}
                    onClick={() => doReview("Approved")}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
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
                    onClick={() => doReview("Rejected")}
                  >
                    Reject
                  </ErpButton>
                </div>
              </div>
            )}

            {status === "approved" && record?.problemValidationCode && (
              <div className="card-soft border-success/30 bg-success/5 p-5">
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-success">
                  Problem Validation Created
                </h4>
                <p className="font-display text-lg font-bold text-foreground">
                  {record.problemValidationCode}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Auto-created on design review approval.
                </p>
              </div>
            )}

            <div className="card-soft p-5">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Next Action
              </h4>
              <p className="text-sm font-medium text-foreground">
                {record?.nextAction ?? "Select an approved opportunity to begin"}
              </p>
            </div>

            <div className="card-soft p-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </h4>
              <div className="space-y-1">
                <QuickAction
                  icon={UploadCloud}
                  label="Upload File"
                  onClick={() => fileRef.current?.click()}
                />
                <QuickAction
                  icon={UserPlus}
                  label="Add Team Member"
                  onClick={() => toast.message("Team management isn't wired to a backend yet.")}
                />
                <QuickAction
                  icon={ClipboardList}
                  label="Create Prototype Task"
                  onClick={() => toast.message("Task creation isn't wired to a backend yet.")}
                />
                <QuickAction
                  icon={CalendarClock}
                  label="Schedule User Test"
                  onClick={() => toast.message("Scheduling isn't wired to a backend yet.")}
                />
                <QuickAction icon={Sparkles} label="Generate AI Insights" onClick={doGenerateAI} />
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
                        <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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

            <div className="card-soft p-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Activity Timeline
              </h4>
              {(record?.auditTrail ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">No activity yet.</p>
              ) : (
                <>
                  <ol className="space-y-3">
                    {[...(record?.auditTrail ?? [])]
                      .reverse()
                      .slice(0, 5)
                      .map((a, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">{a.event}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {a.actor} · {new Date(a.at).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </li>
                      ))}
                  </ol>
                  <button
                    onClick={() => setHistoryOpen(true)}
                    className="mt-3 text-xs font-semibold text-primary hover:underline"
                  >
                    View Full Timeline →
                  </button>
                </>
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
            value={DT_STAGE_LABEL[record?.currentStage ?? "empathize"]}
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
            <DialogDescription>{record?.formCode ?? "Unsaved project"}</DialogDescription>
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
                    {a.stage ? ` · ${DT_STAGE_LABEL[a.stage]}` : ""}
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
function StageAction({
  stage,
  record,
  busy,
  onComplete,
}: {
  stage: DesignThinkingStage;
  record: { stages: { stage: DesignThinkingStage; status: string }[]; status: string } | undefined;
  busy: string | null;
  onComplete: (s: DesignThinkingStage) => void;
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
    !["draft", "in_progress", "revision_required"].includes(record.status)
  )
    return null;
  return (
    <ErpButton size="xs" loading={busy === `stage-${stage}`} onClick={() => onComplete(stage)}>
      {busy === `stage-${stage}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      Complete Stage
    </ErpButton>
  );
}

function AIRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-[11px] font-bold text-foreground">{label}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function GlanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-xs font-semibold text-foreground">{value}</dd>
    </div>
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

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof UploadCloud;
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

function FooterItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold text-foreground">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
