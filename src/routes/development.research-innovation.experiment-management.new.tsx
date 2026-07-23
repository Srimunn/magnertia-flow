/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity,
  Award,
  Beaker,
  Brain,
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Circle,
  Cpu,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  Gauge,
  Image as ImageIcon,
  Landmark,
  Loader2,
  MoreHorizontal,
  Plus,
  Rocket,
  Save,
  Send,
  Sparkles,
  TestTubes,
  Trash2,
  Upload,
  UserCheck,
  Video,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  ExperimentMgmtPageTabBar,
  EXPERIMENT_STATUS_LABEL,
} from "@/components/erp/ExperimentMgmtTabBar";
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
import { experimentMgmtService } from "@/services";
import type {
  ExperimentApprovalDecision,
  ExperimentFormInput,
  ExperimentProjectRecord,
  ExperimentStage,
  ExperimentStatus,
} from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/experiment-management/new")({
  head: () => ({ meta: [{ title: "Experiment Management Form · Magnertia ERP" }] }),
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: ExperimentFormPage,
});

/* --------------------------------- Consts --------------------------------- */
const EDITABLE: ExperimentStatus[] = [
  "draft",
  "experiment_planning",
  "laboratory_preparation",
  "experiment_execution",
  "validation",
  "technical_review",
  "approved_with_conditions",
  "revision_required",
];

const STAGE_LABEL: Record<ExperimentStage, string> = {
  experiment_planning: "Experiment Planning",
  laboratory_preparation: "Laboratory Preparation",
  experiment_execution: "Experiment Execution",
  validation: "Validation",
  technical_review: "Technical Review",
};

const PROGRESS_PHASES = ["Planning", "Setup", "Execution", "Analysis", "Review"];

const PHASES_DONE: Record<ExperimentStatus, number> = {
  draft: 0,
  experiment_planning: 1,
  laboratory_preparation: 2,
  experiment_execution: 3,
  validation: 4,
  technical_review: 4,
  approved: 5,
  approved_with_conditions: 4,
  revision_required: 2,
  rejected: 5,
  archived: 5,
};

const EMPTY: ExperimentFormInput = {
  experimentTitle: "Docking Mechanism Durability Test",
  experimentCategory: "Performance Test",
  laboratory: "Advanced Engineering Lab",
  principalInvestigator: "Rohit Verma",
  startDate: "2024-05-20",
  endDate: "2024-05-30",
  linkedPrototypeId: null,
  overview: {
    objective:
      "Evaluate the durability and reliability of the docking mechanism under repetitive load cycles and harsh environments.",
    hypothesis: "The docking mechanism will withstand >10,000 cycles without failure.",
    engineeringProblem: "Unplanned failure during repetitive docking reduces product reliability.",
    scope: "Cycle testing, load variation, temperature stress, and vibration.",
    expectedOutcome: "Validate the durability and define the expected lifecycle.",
    successCriteria: "No failure up to 10,000 cycles with less than 10% performance degradation.",
    priority: "High",
  },
  design: {
    experimentMethod: "Accelerated Life Test (ALT)",
    testProcedure: "Follow ALT procedure as per EXP-PRO-012 Rev 1.2",
    independentVariables: "Load (25N, 50N, 75N), Temperature (25°C, 50°C), Humidity (30%, 60%)",
    dependentVariables: "Cycle Life, Force Decay, Wear Rate",
    controlledVariables: "Docking Speed (10 mm/s), Alignment Tolerance (±0.2 mm)",
    sampleSize: 5,
    numberOfTrials: 3,
    statisticalMethod: "Weibull Analysis",
  },
  environment: {
    testBench: "Docking Test Bench - DTB-01",
    equipmentUsed: [
      "Universal Testing Machine (UTM)",
      "Environmental Chamber",
      "Data Acquisition System",
    ],
    instrumentCalibration: true,
    environmentalConditions: "Temperature: 25°C-50°C, Humidity: 30%-60%, Vibration: 5-200 Hz",
    softwareTools: ["LabVIEW", "MATLAB", "OriginPro"],
    safetyChecklist: "EXP-SAF-021 Rev 1.1",
  },
  resources: {
    projectTeam: ["Rohit Verma", "Priya Sharma", "Neha Sharma", "Vikram Singh", "Arjun Mehta"],
    technicalExperts: ["Dr. Anita Patel", "Sundar Rao", "Kavya Nair"],
    materialsRequired: "Test samples, lubricants, mounting fixtures, cables, connectors",
    budgetApproved: 200000,
    budgetUtilized: 95300,
  },
  observations: {
    trialNumber: 2,
    totalTrials: 3,
    observations: "Slight increase in wear observed after 6,300 cycles at 50N load.",
    measurements: "Cycle Count: 6,000; Force Decay: 6.2%; Wear Rate: 0.012 mm/cycle",
    anomalies: "None",
    rawDataFiles: [
      { id: "rd-0", name: "trial2_rawdata.csv", fileType: "csv", sizeLabel: "3.4 MB" },
    ],
    imageFiles: [{ id: "im-0", name: "trial2_wear.jpg", fileType: "jpg", sizeLabel: "1.8 MB" }],
    videoFiles: [{ id: "vd-0", name: "trial2_test.mp4", fileType: "mp4", sizeLabel: "12.4 MB" }],
    sensorDataFiles: [
      { id: "sn-0", name: "trial2_sensor.csv", fileType: "csv", sizeLabel: "3.2 MB" },
    ],
  },
  dataAnalysis: {
    dataProcessingMethod: "Signal Filtering + Outlier Removal",
    statisticalAnalysis: "Weibull analysis indicates B10 life of 11,420 cycles at 50N load.",
    performanceMetrics: "MTTF: 12,250 cycles; Mean Force: 48.6 N; Std Deviation: 2.1",
    varianceAnalysis: "Variance within acceptable limit (p < 0.05).",
    rootCauseAnalysis: "Wear due to misalignment under high load.",
    interpretation: "Mechanism meets durability requirements with minor optimization.",
    chartFiles: [{ id: "ch-0", name: "weibull_plot.png", fileType: "png", sizeLabel: "512 KB" }],
  },
  validation: {
    objectiveAchieved: true,
    accuracy: 90,
    precision: 88,
    repeatability: 5,
    reliability: 4,
    compliance: 5,
    validationSummary:
      "Experiment results are within acceptable limits and confirm the durability of the docking mechanism.",
  },
  attachments: [
    {
      id: "att-1",
      category: "Experiment Protocol",
      filename: "EXP-PRO-012.pdf",
      fileType: "pdf",
      uploadedBy: "Rohit Verma",
      uploadedAt: "2024-05-20T09:30:00Z",
      url: "#",
    },
    {
      id: "att-2",
      category: "Test Reports",
      filename: "Test_Reports.pdf",
      fileType: "pdf",
      uploadedBy: "Rohit Verma",
      uploadedAt: "2024-05-22T14:15:00Z",
      url: "#",
    },
    {
      id: "att-3",
      category: "Calibration Certificate",
      filename: "CAL-UTM-043.pdf",
      fileType: "pdf",
      uploadedBy: "Neha Sharma",
      uploadedAt: "2024-05-20T10:00:00Z",
      url: "#",
    },
    {
      id: "att-4",
      category: "Sensor Logs",
      filename: "Sensor_Logs.csv",
      fileType: "csv",
      uploadedBy: "Vikram Singh",
      uploadedAt: "2024-05-21T16:20:00Z",
      url: "#",
    },
    {
      id: "att-5",
      category: "Data Sheets",
      filename: "DataSheets.xlsx",
      fileType: "xlsx",
      uploadedBy: "Rohit Verma",
      uploadedAt: "2024-05-20T11:00:00Z",
      url: "#",
    },
    {
      id: "att-6",
      category: "Images",
      filename: "exp_images.zip",
      fileType: "zip",
      uploadedBy: "Rohit Verma",
      uploadedAt: "2024-05-22T17:00:00Z",
      url: "#",
    },
    {
      id: "att-7",
      category: "Videos",
      filename: "exp_videos.zip",
      fileType: "zip",
      uploadedBy: "Rohit Verma",
      uploadedAt: "2024-05-22T17:30:00Z",
      url: "#",
    },
    {
      id: "att-8",
      category: "Analysis Report",
      filename: "Analysis_Report.pdf",
      fileType: "pdf",
      uploadedBy: "Dr. Anita Patel",
      uploadedAt: "2024-05-23T11:00:00Z",
      url: "#",
    },
  ],
  recommendation: "Proceed to Engineering Validation",
};

const DEFAULT_OBS_FILES = {
  rawDataFiles: [{ id: "rd-0", name: "trial2_rawdata.csv", fileType: "csv", sizeLabel: "3.4 MB" }],
  imageFiles: [{ id: "im-0", name: "trial2_wear.jpg", fileType: "jpg", sizeLabel: "1.8 MB" }],
  videoFiles: [{ id: "vd-0", name: "trial2_test.mp4", fileType: "mp4", sizeLabel: "12.4 MB" }],
  sensorDataFiles: [
    { id: "sn-0", name: "trial2_sensor.csv", fileType: "csv", sizeLabel: "3.2 MB" },
  ],
};

const DEFAULT_CHART_FILES = [
  { id: "ch-0", name: "weibull_plot.png", fileType: "png", sizeLabel: "512 KB" },
];

function recordToInput(r: ExperimentProjectRecord): ExperimentFormInput {
  return {
    experimentTitle: r.experimentTitle,
    experimentCategory: r.experimentCategory,
    laboratory: r.laboratory,
    principalInvestigator: r.principalInvestigator,
    startDate: r.startDate,
    endDate: r.endDate,
    linkedPrototypeId: r.linkedPrototypeId,
    overview: r.overview,
    design: r.design,
    environment: r.environment,
    resources: r.resources,
    observations: r.observations,
    dataAnalysis: r.dataAnalysis,
    validation: r.validation,
    attachments: r.attachments,
    recommendation: r.summary.recommendation,
  };
}

/* ------------------------------ UI Primitives ------------------------------ */
const INPUT =
  "w-full rounded-lg border bg-white px-3 py-2 text-xs text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 disabled:bg-muted/40 disabled:text-muted-foreground";

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
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={p.value}
        disabled={p.disabled}
        onClick={() => p.onChange(!p.value)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 cursor-pointer",
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
      <span className="text-xs font-semibold text-foreground">{p.value ? "Yes" : "No"}</span>
    </div>
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
              "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-60 cursor-pointer",
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
    <section className={cn("card-soft space-y-3.5 p-4", p.className)}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold text-white shadow-xs",
            p.accent ?? "bg-primary",
          )}
        >
          {p.n}
        </span>
        <span>
          {p.n}. {p.title}
        </span>
      </h3>
      {p.children}
    </section>
  );
}

function ProgressRing({ value, size = 120 }: { value: number; size?: number }) {
  const rad = 40;
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
          <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">
            Completed
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreTile({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  tone: string;
}) {
  return (
    <div className={cn("rounded-xl border p-3 shadow-xs", tone)}>
      <div className="text-[10px] font-semibold text-muted-foreground leading-tight">{label}</div>
      <div className="font-display text-lg font-bold tabular text-foreground mt-0.5">
        {value}
        <span className="text-[10px] font-normal text-muted-foreground"> {unit}</span>
      </div>
    </div>
  );
}

function AIScoreRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  const color = value >= 70 ? "text-success" : value >= 50 ? "text-[#F59E0B]" : "text-destructive";
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className={cn("tabular font-bold text-sm", color)}>
        {value} <span className="text-[10px] font-normal text-muted-foreground">{unit}</span>
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

function AvatarPile({ users, maxDisplay = 3 }: { users: string[]; maxDisplay?: number }) {
  if (!users || users.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const visible = users.slice(0, maxDisplay);
  const extra = users.length - maxDisplay;
  const bgColors = [
    "bg-blue-600",
    "bg-indigo-600",
    "bg-violet-600",
    "bg-emerald-600",
    "bg-amber-600",
  ];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2 overflow-hidden py-0.5">
        {visible.map((name, i) => {
          const initials = name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2);
          const bg = bgColors[i % bgColors.length];
          return (
            <div
              key={name}
              title={name}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white shadow-xs",
                bg,
              )}
            >
              {initials}
            </div>
          );
        })}
      </div>
      {extra > 0 && (
        <span className="inline-flex h-6 items-center justify-center rounded-full bg-muted px-2 text-[10px] font-bold text-muted-foreground">
          +{extra}
        </span>
      )}
    </div>
  );
}

function AttachmentCard({
  name,
  size,
  category,
  onRemove,
  editable,
}: {
  name: string;
  size: string;
  category: string;
  onRemove?: () => void;
  editable?: boolean;
}) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "file";
  const iconColor =
    ext === "pdf"
      ? "text-rose-600 bg-rose-50 border-rose-200"
      : ext === "csv" || ext === "xlsx"
        ? "text-emerald-600 bg-emerald-50 border-emerald-200"
        : ext === "zip"
          ? "text-purple-600 bg-purple-50 border-purple-200"
          : "text-blue-600 bg-blue-50 border-blue-200";

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-white p-2.5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            iconColor,
          )}
        >
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-foreground">{name}</div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>{category}</span>
            <span>•</span>
            <span>{size}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => toast.success(`Downloading ${name}…`)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          title="Download"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
        {editable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
            title="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function MediaFileCard({
  name,
  sizeLabel,
  fileType,
  icon: Icon,
}: {
  name: string;
  sizeLabel: string;
  fileType: string;
  icon: any;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white p-2 text-xs shadow-xs">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-foreground">{name}</div>
          <div className="text-[10px] text-muted-foreground">{sizeLabel}</div>
        </div>
      </div>
      <button
        type="button"
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        title={`Download ${name}`}
        onClick={() => toast.success(`Downloading ${name}…`)}
      >
        <Download className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ================================== Page ================================== */
function ExperimentFormPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const lookupsQuery = useQuery({
    queryKey: ["experiment-management", "lookups"],
    queryFn: () => experimentMgmtService.fetchLookups(),
  });
  const recordQuery = useQuery({
    queryKey: ["experiment-management", "record", id],
    queryFn: () => experimentMgmtService.fetchRecord(id!),
    enabled: Boolean(id),
  });
  const sourcesQuery = useQuery({
    queryKey: ["experiment-management", "approved-prototypes"],
    queryFn: () => experimentMgmtService.fetchApprovedPrototypes(),
    enabled: !id,
  });

  const lookups = lookupsQuery.data;
  const record = recordQuery.data ?? null;

  const [form, setForm] = useState<ExperimentFormInput>(EMPTY);
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (record && loadedIdRef.current !== record.id) {
      loadedIdRef.current = record.id;
      setForm(recordToInput(record));
    }
  }, [record]);

  const status: ExperimentStatus = record?.status ?? "draft";
  const editable = !record || EDITABLE.includes(status);
  const currentStage = record?.currentStage ?? "experiment_planning";
  const allStagesDone = record ? record.stages.every((s) => s.status === "completed") : false;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  // Quick Action Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("2024-05-25");
  const [scheduleLab, setScheduleLab] = useState("Advanced Engineering Lab");
  const [scheduleNotes, setScheduleNotes] = useState("");

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [testPlanModalOpen, setTestPlanModalOpen] = useState(false);

  const [reviewDecision, setReviewDecision] = useState<ExperimentApprovalDecision>(
    "Approved with Conditions",
  );
  const [reviewNextAction, setReviewNextAction] = useState("Proceed to Engineering Validation");
  const [reviewComments, setReviewComments] = useState(
    "Increase sample size to 8 for next validation.",
  );
  const [attachCategory, setAttachCategory] = useState("Experiment Protocol");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["experiment-management"] });

  const saveMut = useMutation({
    mutationFn: () => experimentMgmtService.saveDraft(form, record?.id),
    onSuccess: (r) => {
      invalidate();
      toast.success(record ? "Experiment saved." : `Experiment ${r.experimentId} created.`);
      if (!record) {
        navigate({
          to: "/development/research-innovation/experiment-management/new",
          search: { id: r.id },
        });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const stageMut = useMutation({
    mutationFn: () => experimentMgmtService.completeStage(record!.id, currentStage),
    onSuccess: () => {
      invalidate();
      toast.success(`${STAGE_LABEL[currentStage]} completed — AI assessment updated.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const submitMut = useMutation({
    mutationFn: () => experimentMgmtService.submitForReview(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Experiment report submitted to the Technical Review Committee.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reviewMut = useMutation({
    mutationFn: () =>
      experimentMgmtService.review({
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
          `Approved — Engineering Validation ${r.engineeringValidationCode} auto-created.`,
        );
      else if (r.status === "approved_with_conditions")
        toast.success("Approved with improvements — perform additional experiments.");
      else if (r.status === "rejected") toast.success("Experiment rejected and archived.");
      else toast.success("Revision required — update experiment design.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reportMut = useMutation({
    mutationFn: () => experimentMgmtService.generateReport(record!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Experiment report generated — scores refreshed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy =
    saveMut.isPending ||
    stageMut.isPending ||
    submitMut.isPending ||
    reviewMut.isPending ||
    reportMut.isPending;

  const set = <K extends keyof ExperimentFormInput>(key: K, value: ExperimentFormInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setOverview = (patch: Partial<ExperimentFormInput["overview"]>) =>
    setForm((f) => ({ ...f, overview: { ...f.overview, ...patch } }));
  const setDesign = (patch: Partial<ExperimentFormInput["design"]>) =>
    setForm((f) => ({ ...f, design: { ...f.design, ...patch } }));
  const setEnv = (patch: Partial<ExperimentFormInput["environment"]>) =>
    setForm((f) => ({ ...f, environment: { ...f.environment, ...patch } }));
  const setRes = (patch: Partial<ExperimentFormInput["resources"]>) =>
    setForm((f) => ({ ...f, resources: { ...f.resources, ...patch } }));
  const setObs = (patch: Partial<ExperimentFormInput["observations"]>) =>
    setForm((f) => ({ ...f, observations: { ...f.observations, ...patch } }));
  const setData = (patch: Partial<ExperimentFormInput["dataAnalysis"]>) =>
    setForm((f) => ({ ...f, dataAnalysis: { ...f.dataAnalysis, ...patch } }));
  const setVal = (patch: Partial<ExperimentFormInput["validation"]>) =>
    setForm((f) => ({ ...f, validation: { ...f.validation, ...patch } }));

  const applyPrototype = (protoId: string) => {
    const proto = (sourcesQuery.data ?? []).find((p) => p.id === protoId);
    set("linkedPrototypeId", protoId || null);
    if (!proto) return;
    setForm((f) => ({
      ...f,
      linkedPrototypeId: protoId,
      experimentTitle: f.experimentTitle || `${proto.prototypeName} Durability Test`,
      principalInvestigator: proto.prototypeOwner || f.principalInvestigator,
      overview: {
        ...f.overview,
        objective: f.overview.objective || proto.designObjective,
        successCriteria: f.overview.successCriteria || proto.successCriteria,
      },
      observations: {
        ...f.observations,
        ...DEFAULT_OBS_FILES,
      },
      dataAnalysis: {
        ...f.dataAnalysis,
        chartFiles: f.dataAnalysis.chartFiles.length
          ? f.dataAnalysis.chartFiles
          : DEFAULT_CHART_FILES,
      },
    }));
    toast.success(`Context loaded from ${proto.prototypeCode}.`);
  };

  const addAttachment = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "file";
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    set("attachments", [
      ...form.attachments,
      {
        id: crypto.randomUUID(),
        category: attachCategory,
        filename: file.name,
        fileType: ext,
        uploadedBy: form.principalInvestigator || "Rohit Verma",
        uploadedAt: new Date().toISOString(),
        url: "#",
      },
    ]);
    toast.success(`${file.name} (${sizeInMB}) attached.`);
  };

  const ai = record?.aiAssessment ?? {
    aiExperimentScore: 84,
    aiDataQualityScore: 86,
    aiConfidenceLevel: 82,
    trendAnalysis: "Performance degradation is linear within expected range.",
    failurePrediction: "Low probability of failure before 11,000 cycles.",
    optimizationSuggestions: "Consider surface coating to reduce wear by 15%.",
    recommendation: "Proceed to validation.",
    experimentalDesignScore: 88,
    sampleSizeRecommendation: "Sample size is adequate for the chosen statistical method.",
    riskAssessment: "Low experimental risk — design and data quality are strong.",
    statisticalConfidence: 86,
    repeatabilityScore: 90,
    generatedAt: new Date().toISOString(),
  };

  const summary = record?.summary ?? {
    technicalScore: 78,
    statisticalConfidence: 86,
    validationScore: 74,
    overallExperimentScore: 76,
    recommendation: "Proceed to Engineering Validation",
  };

  const progress = record?.progressPercentage ?? 56;
  const phasesDone = record ? PHASES_DONE[status] : 3;
  const remainingBudget = form.resources.budgetApproved - form.resources.budgetUtilized;
  const durationDays =
    form.startDate && form.endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 10;

  if (id && recordQuery.isLoading) {
    return (
      <AppShell
        title="Experiment Management"
        breadcrumb="Development > Research & Innovation Development > Experiment Management > Experiment Management Form"
        description="Experiment Management Form"
        tabs={<ExperimentMgmtPageTabBar />}
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
      title="Experiment Management"
      breadcrumb="Development > Research & Innovation Development > Experiment Management > Experiment Management Form"
      description="Experiment Management Form"
      tabs={<ExperimentMgmtPageTabBar />}
    >
      <div className="space-y-5">
        {/* ------------------------- Record header bar ------------------------- */}
        <div className="card-soft space-y-3 p-4">
          {/* Row 1 */}
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7 items-end">
            <Field label="Experiment ID">
              <TextInput value={record?.experimentId ?? "EXP-2024-0096"} disabled />
            </Field>
            <Field label="Form Code">
              <TextInput value={record?.formCode ?? "EXP-2024-25"} disabled />
            </Field>
            <Field label="Experiment Title" required>
              <TextInput
                value={form.experimentTitle}
                onChange={(v) => set("experimentTitle", v)}
                disabled={!editable}
                placeholder="Docking Mechanism Durability Test"
              />
            </Field>
            <HeaderLinkChip
              label="Linked Prototype"
              code={record?.linkedPrototypeCode ?? "PRD-2024-0012"}
              to="/development/research-innovation/prototype-development/new"
            />
            <HeaderLinkChip
              label="Linked PoC"
              code={record?.linkedPocCode ?? "POC-2024-0045"}
              to="/development/research-innovation/proof-of-concept/new"
            />
            <Field label="Category" required>
              <Select
                value={form.experimentCategory}
                onChange={(v) => set("experimentCategory", v)}
                options={
                  lookups?.experimentCategories ?? [
                    "Performance Test",
                    "Functional Test",
                    "Reliability Test",
                  ]
                }
                disabled={!editable}
              />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-foreground">Workflow Status</span>
              <div className="flex h-[38px] items-center">
                <StatusBadge status={EXPERIMENT_STATUS_LABEL[status] ?? "In Progress"} />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-3 xl:grid-cols-5 items-end">
            <Field label="Laboratory">
              <div className="relative flex items-center">
                <FlaskConical className="absolute left-2.5 h-4 w-4 text-primary pointer-events-none" />
                <select
                  className={cn(INPUT, "border-border pl-9")}
                  value={form.laboratory}
                  disabled={!editable}
                  onChange={(e) => set("laboratory", e.target.value)}
                >
                  {(lookups?.laboratories ?? ["Advanced Engineering Lab"]).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Principal Investigator">
              <div className="relative flex items-center">
                <div className="absolute left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  RV
                </div>
                <select
                  className={cn(INPUT, "border-border pl-9")}
                  value={form.principalInvestigator}
                  disabled={!editable}
                  onChange={(e) => set("principalInvestigator", e.target.value)}
                >
                  {(lookups?.principalInvestigators ?? ["Rohit Verma"]).map((pi) => (
                    <option key={pi} value={pi}>
                      {pi}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Start Date" required>
              <input
                type="date"
                className={cn(INPUT, "border-border")}
                value={form.startDate}
                disabled={!editable}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Field>
            <Field label="End Date" required>
              <input
                type="date"
                className={cn(INPUT, "border-border")}
                value={form.endDate}
                disabled={!editable}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </Field>
            <Field label="Priority">
              <div className="flex h-[38px] items-center gap-2">
                <select
                  className={cn(INPUT, "border-border flex-1")}
                  value={form.overview.priority}
                  disabled={!editable}
                  onChange={(e) => setOverview({ priority: e.target.value })}
                >
                  {(lookups?.priorities ?? ["High", "Medium", "Low"]).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold text-white shadow-xs shrink-0",
                    form.overview.priority === "High" || form.overview.priority === "Critical"
                      ? "bg-rose-600"
                      : form.overview.priority === "Medium"
                        ? "bg-amber-500"
                        : "bg-blue-600",
                  )}
                >
                  {form.overview.priority}
                </span>
              </div>
            </Field>
          </div>

          {!record && (
            <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-[1fr_auto]">
              <Field label="Source Approved Prototype (required)" required>
                <select
                  className={cn(INPUT, "border-border")}
                  value={form.linkedPrototypeId ?? ""}
                  onChange={(e) => applyPrototype(e.target.value)}
                >
                  <option value="">Select an approved prototype…</option>
                  {(sourcesQuery.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.prototypeCode} — {p.prototypeName}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <span className="pb-2 text-xs text-muted-foreground">
                  An experiment can only be created from an approved Prototype. Project, laboratory
                  and asset context is retrieved automatically.
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
                "Select an approved Prototype, fill the sections, then create the experiment to start Stage 1."
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
                  {record ? "Save Draft" : "Save Draft"}
                </ErpButton>
              )}
              {record && editable && !allStagesDone && (
                <ErpButton variant="outline" onClick={() => stageMut.mutate()} disabled={busy}>
                  {stageMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                  Complete {STAGE_LABEL[currentStage]}
                </ErpButton>
              )}
              <ErpButton
                onClick={() =>
                  record && allStagesDone
                    ? submitMut.mutate()
                    : toast.success("Submitted for review.")
                }
                disabled={busy}
              >
                {submitMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit for Review
              </ErpButton>
              {record && status === "technical_review" && (
                <ErpButton onClick={() => setReviewOpen(true)} disabled={busy}>
                  <Landmark className="h-4 w-4" /> Record Committee Decision
                </ErpButton>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground cursor-pointer"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      record ? reportMut.mutate() : toast.success("Report generated.")
                    }
                  >
                    <FileText className="h-4 w-4" /> Generate Report
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
            </div>
          </div>
        </div>

        {/* ---------------------------- Status banners --------------------------- */}
        {record && status === "technical_review" && (
          <div className="card-soft flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-amber-500 p-4">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-amber-600" />
              <div>
                <div className="text-sm font-bold text-foreground">
                  Awaiting Technical Review Committee Decision
                </div>
                <div className="text-xs text-muted-foreground">
                  Approve (auto-creates Engineering Validation), approve with conditions, request
                  revision, or reject.
                </div>
              </div>
            </div>
            <ErpButton variant="outline" onClick={() => setReviewOpen(true)}>
              Record Decision <ChevronRight className="h-4 w-4" />
            </ErpButton>
          </div>
        )}
        {record && status === "approved_with_conditions" && record.reviewConditions && (
          <div className="card-soft border-l-4 border-l-blue-500 p-4 text-sm">
            <span className="font-bold text-foreground">Additional experiments required: </span>
            <span className="text-muted-foreground">{record.reviewConditions}</span>
          </div>
        )}
        {record && status === "revision_required" && record.reviewComments && (
          <div className="card-soft border-l-4 border-l-amber-500 p-4 text-sm">
            <span className="font-bold text-foreground">Review feedback: </span>
            <span className="text-muted-foreground">{record.reviewComments}</span>
          </div>
        )}
        {record && status === "approved" && record.engineeringValidationCode && (
          <div className="card-soft flex items-center gap-2 border-l-4 border-l-emerald-500 p-4 text-sm">
            <Rocket className="h-4 w-4 text-emerald-600" />
            <span className="font-bold text-foreground">
              Engineering Validation {record.engineeringValidationCode} auto-created.
            </span>
            <span className="text-muted-foreground">
              Principal Investigator notified: Proceed to Engineering Validation.
            </span>
          </div>
        )}

        {/* ------------------------------ Main grid ------------------------------ */}
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_320px]">
          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {/* 1 — Experiment Overview */}
            <SectionCard n={1} title="Experiment Overview" accent="bg-blue-600">
              <Field label="Objective" required>
                <TextArea
                  value={form.overview.objective}
                  onChange={(v) => setOverview({ objective: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Evaluate the durability and reliability of the docking mechanism under repetitive load cycles and harsh environments."
                />
              </Field>
              <Field label="Hypothesis" required>
                <TextArea
                  value={form.overview.hypothesis}
                  onChange={(v) => setOverview({ hypothesis: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="The docking mechanism will withstand >10,000 cycles without failure."
                />
              </Field>
              <Field label="Engineering Problem">
                <TextArea
                  value={form.overview.engineeringProblem}
                  onChange={(v) => setOverview({ engineeringProblem: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Unplanned failure during repetitive docking reduces product reliability."
                />
              </Field>
              <Field label="Scope" required>
                <TextArea
                  value={form.overview.scope}
                  onChange={(v) => setOverview({ scope: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Cycle testing, load variation, temperature stress, and vibration."
                />
              </Field>
              <Field label="Expected Outcome" required>
                <TextArea
                  value={form.overview.expectedOutcome}
                  onChange={(v) => setOverview({ expectedOutcome: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Validate the durability and define the expected lifecycle."
                />
              </Field>
              <Field label="Success Criteria" required>
                <TextArea
                  value={form.overview.successCriteria}
                  onChange={(v) => setOverview({ successCriteria: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="No failure up to 10,000 cycles with less than 10% performance degradation."
                />
              </Field>
              <Field label="Priority">
                <Select
                  value={form.overview.priority}
                  onChange={(v) => setOverview({ priority: v })}
                  options={lookups?.priorities ?? ["High", "Medium", "Low"]}
                  disabled={!editable}
                />
              </Field>
            </SectionCard>

            {/* 2 — Experimental Design */}
            <SectionCard n={2} title="Experimental Design" accent="bg-blue-600">
              <Field label="Experiment Method" required>
                <Select
                  value={form.design.experimentMethod}
                  onChange={(v) => setDesign({ experimentMethod: v })}
                  options={lookups?.experimentMethods ?? ["Accelerated Life Test (ALT)"]}
                  disabled={!editable}
                />
              </Field>
              <Field label="Test Procedure" required>
                <TextArea
                  value={form.design.testProcedure}
                  onChange={(v) => setDesign({ testProcedure: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Follow ALT procedure as per EXP-PRO-012 Rev 1.2"
                />
              </Field>
              <Field label="Independent Variables" required>
                <TextArea
                  value={form.design.independentVariables}
                  onChange={(v) => setDesign({ independentVariables: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Load (25N, 50N, 75N), Temperature (25°C, 50°C), Humidity (30%, 60%)"
                />
              </Field>
              <Field label="Dependent Variables" required>
                <TextArea
                  value={form.design.dependentVariables}
                  onChange={(v) => setDesign({ dependentVariables: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Cycle Life, Force Decay, Wear Rate"
                />
              </Field>
              <Field label="Controlled Variables" required>
                <TextArea
                  value={form.design.controlledVariables}
                  onChange={(v) => setDesign({ controlledVariables: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Docking Speed (10 mm/s), Alignment Tolerance (±0.2 mm)"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sample Size" required>
                  <NumberInput
                    value={form.design.sampleSize}
                    onChange={(v) => setDesign({ sampleSize: v })}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Number of Trials" required>
                  <NumberInput
                    value={form.design.numberOfTrials}
                    onChange={(v) => setDesign({ numberOfTrials: v })}
                    disabled={!editable}
                  />
                </Field>
              </div>
              <Field label="Statistical Method" required>
                <Select
                  value={form.design.statisticalMethod}
                  onChange={(v) => setDesign({ statisticalMethod: v })}
                  options={lookups?.statisticalMethods ?? ["Weibull Analysis"]}
                  disabled={!editable}
                />
              </Field>
            </SectionCard>

            {/* 3 — Test Environment */}
            <SectionCard n={3} title="Test Environment" accent="bg-blue-600">
              <Field label="Laboratory">
                <Select
                  value={form.laboratory}
                  onChange={(v) => set("laboratory", v)}
                  options={lookups?.laboratories ?? ["Advanced Engineering Lab"]}
                  disabled={!editable}
                />
              </Field>
              <Field label="Test Bench">
                <Select
                  value={form.environment.testBench}
                  onChange={(v) => setEnv({ testBench: v })}
                  options={lookups?.testBenches ?? ["Docking Test Bench - DTB-01"]}
                  disabled={!editable}
                />
              </Field>
              <Field label="Equipment Used" required>
                <TagMulti
                  options={
                    lookups?.equipment ?? [
                      "Universal Testing Machine (UTM)",
                      "Environmental Chamber",
                      "Data Acquisition System",
                    ]
                  }
                  selected={form.environment.equipmentUsed}
                  onToggle={(v) =>
                    setEnv({
                      equipmentUsed: form.environment.equipmentUsed.includes(v)
                        ? form.environment.equipmentUsed.filter((x) => x !== v)
                        : [...form.environment.equipmentUsed, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                <span className="text-xs font-semibold text-foreground">
                  Instrument Calibration
                </span>
                <Toggle
                  value={form.environment.instrumentCalibration}
                  onChange={(v) => setEnv({ instrumentCalibration: v })}
                  disabled={!editable}
                />
              </div>
              <Field label="Environmental Conditions" required>
                <TextArea
                  value={form.environment.environmentalConditions}
                  onChange={(v) => setEnv({ environmentalConditions: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Temperature: 25°C-50°C, Humidity: 30%-60%, Vibration: 5-200 Hz"
                />
              </Field>
              <Field label="Software Tools" required>
                <TagMulti
                  options={lookups?.softwareTools ?? ["LabVIEW", "MATLAB", "OriginPro"]}
                  selected={form.environment.softwareTools}
                  onToggle={(v) =>
                    setEnv({
                      softwareTools: form.environment.softwareTools.includes(v)
                        ? form.environment.softwareTools.filter((x) => x !== v)
                        : [...form.environment.softwareTools, v],
                    })
                  }
                  disabled={!editable}
                />
              </Field>
              <Field label="Safety Checklist" required>
                <TextInput
                  value={form.environment.safetyChecklist}
                  onChange={(v) => setEnv({ safetyChecklist: v })}
                  disabled={!editable}
                  placeholder="EXP-SAF-021 Rev 1.1"
                />
              </Field>
            </SectionCard>

            {/* 4 — Resource Planning */}
            <SectionCard n={4} title="Resource Planning" accent="bg-amber-500">
              <Field label="Project Team">
                <div className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-1.5">
                  <AvatarPile users={form.resources.projectTeam} maxDisplay={3} />
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {form.resources.projectTeam.length} Members
                  </span>
                </div>
              </Field>
              <Field label="Technical Experts">
                <div className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-1.5">
                  <AvatarPile users={form.resources.technicalExperts} maxDisplay={2} />
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {form.resources.technicalExperts.length} Experts
                  </span>
                </div>
              </Field>
              <Field label="Materials Required" required>
                <TextArea
                  value={form.resources.materialsRequired}
                  onChange={(v) => setRes({ materialsRequired: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Test samples, lubricants, mounting fixtures, cables, connectors"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Remaining Budget">
                  <div className="flex h-[38px] items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700">
                    {formatCurrency(remainingBudget, true)}
                  </div>
                </Field>
                <Field label="Experiment Duration (Days)">
                  <TextInput value={`${durationDays}`} disabled />
                </Field>
              </div>
            </SectionCard>

            {/* 5 — Experimental Observations */}
            <SectionCard n={5} title="Experimental Observations" accent="bg-purple-600">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Trial Number">
                  <TextInput
                    value={`${form.observations.trialNumber} / ${form.observations.totalTrials}`}
                    disabled
                  />
                </Field>
              </div>
              <Field label="Observations" required>
                <TextArea
                  value={form.observations.observations}
                  onChange={(v) => setObs({ observations: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Slight increase in wear observed after 6,300 cycles at 50N load."
                />
              </Field>
              <Field label="Measurements" required>
                <TextArea
                  value={form.observations.measurements}
                  onChange={(v) => setObs({ measurements: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Cycle Count: 6,000; Force Decay: 6.2%; Wear Rate: 0.012 mm/cycle"
                />
              </Field>

              {/* Media Thumbnails Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Media & Data Files
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <MediaFileCard
                    name="trial2_wear.jpg"
                    sizeLabel="1.8 MB"
                    fileType="image"
                    icon={ImageIcon}
                  />
                  <MediaFileCard
                    name="trial2_test.mp4"
                    sizeLabel="12.4 MB"
                    fileType="video"
                    icon={Video}
                  />
                  <MediaFileCard
                    name="trial2_sensor.csv"
                    sizeLabel="3.2 MB"
                    fileType="csv"
                    icon={FileSpreadsheet}
                  />
                  <MediaFileCard
                    name="trial2_rawdata.csv"
                    sizeLabel="3.4 MB"
                    fileType="csv"
                    icon={FileText}
                  />
                </div>
              </div>

              <Field label="Anomalies" required>
                <TextArea
                  value={form.observations.anomalies}
                  onChange={(v) => setObs({ anomalies: v })}
                  rows={1}
                  disabled={!editable}
                  placeholder="None"
                />
              </Field>
            </SectionCard>

            {/* 6 — Data Analysis */}
            <SectionCard n={6} title="Data Analysis" accent="bg-blue-600">
              <Field label="Data Processing Method" required>
                <Select
                  value={form.dataAnalysis.dataProcessingMethod}
                  onChange={(v) => setData({ dataProcessingMethod: v })}
                  options={lookups?.dataProcessingMethods ?? ["Signal Filtering + Outlier Removal"]}
                  disabled={!editable}
                />
              </Field>
              <Field label="Statistical Analysis" required>
                <TextArea
                  value={form.dataAnalysis.statisticalAnalysis}
                  onChange={(v) => setData({ statisticalAnalysis: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Weibull analysis indicates B10 life of 11,420 cycles at 50N load."
                />
              </Field>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Graphs & Charts
                </span>
                <MediaFileCard
                  name="weibull_plot.png"
                  sizeLabel="512 KB"
                  fileType="png"
                  icon={ImageIcon}
                />
              </div>
              <Field label="Performance Metrics" required>
                <TextArea
                  value={form.dataAnalysis.performanceMetrics}
                  onChange={(v) => setData({ performanceMetrics: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="MTTF: 12,250 cycles; Mean Force: 48.6 N; Std Deviation: 2.1"
                />
              </Field>
              <Field label="Variance Analysis" required>
                <TextArea
                  value={form.dataAnalysis.varianceAnalysis}
                  onChange={(v) => setData({ varianceAnalysis: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Variance within acceptable limit (p < 0.05)."
                />
              </Field>
              <Field label="Root Cause Analysis" required>
                <TextArea
                  value={form.dataAnalysis.rootCauseAnalysis}
                  onChange={(v) => setData({ rootCauseAnalysis: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Wear due to misalignment under high load."
                />
              </Field>
              <Field label="Interpretation" required>
                <TextArea
                  value={form.dataAnalysis.interpretation}
                  onChange={(v) => setData({ interpretation: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Mechanism meets durability requirements with minor optimization."
                />
              </Field>
            </SectionCard>

            {/* 7 — Validation Results */}
            <SectionCard n={7} title="Validation Results" accent="bg-emerald-600">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                <span className="text-xs font-semibold text-foreground">Objective Achieved</span>
                <Toggle
                  value={form.validation.objectiveAchieved}
                  onChange={(v) => setVal({ objectiveAchieved: v })}
                  disabled={!editable}
                />
              </div>
              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                <StarRow
                  label="Accuracy"
                  value={5}
                  onChange={(v) => setVal({ accuracy: v * 20 })}
                  editable={editable}
                />
                <StarRow
                  label="Precision"
                  value={5}
                  onChange={(v) => setVal({ precision: v * 20 })}
                  editable={editable}
                />
                <StarRow
                  label="Repeatability"
                  value={form.validation.repeatability}
                  onChange={(v) => setVal({ repeatability: v })}
                  editable={editable}
                />
                <StarRow
                  label="Reliability"
                  value={form.validation.reliability}
                  onChange={(v) => setVal({ reliability: v })}
                  editable={editable}
                />
                <StarRow
                  label="Compliance"
                  value={form.validation.compliance}
                  onChange={(v) => setVal({ compliance: v })}
                  editable={editable}
                />
              </div>
              <Field label="Validation Summary" required>
                <TextArea
                  value={form.validation.validationSummary}
                  onChange={(v) => setVal({ validationSummary: v })}
                  rows={2}
                  disabled={!editable}
                  placeholder="Experiment results are within acceptable limits and confirm the durability of the docking mechanism."
                />
              </Field>
            </SectionCard>

            {/* 8 — AI Experiment Assessment */}
            <SectionCard
              n={8}
              title="AI Experiment Assessment"
              accent="bg-purple-600"
              className="border-purple-200 bg-purple-50/20"
            >
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5 text-center">
                  <div className="text-[10px] font-semibold text-muted-foreground">
                    AI Exp. Score
                  </div>
                  <div className="font-display text-lg font-bold text-emerald-700">
                    {ai.aiExperimentScore}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5 text-center">
                  <div className="text-[10px] font-semibold text-muted-foreground">
                    Data Quality
                  </div>
                  <div className="font-display text-lg font-bold text-emerald-700">
                    {ai.aiDataQualityScore}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-2.5 text-center">
                  <div className="text-[10px] font-semibold text-muted-foreground">Confidence</div>
                  <div className="font-display text-lg font-bold text-purple-700">
                    {ai.aiConfidenceLevel}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="rounded-lg border border-border bg-white p-2.5">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    AI Trend Analysis
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ai.trendAnalysis}</p>
                </div>
                <div className="rounded-lg border border-border bg-white p-2.5">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    AI Failure Prediction
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ai.failurePrediction}</p>
                </div>
                <div className="rounded-lg border border-border bg-white p-2.5">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    AI Optimization Suggestions
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ai.optimizationSuggestions}
                  </p>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                    <Sparkles className="h-3 w-3 text-purple-600" /> AI Recommendation
                  </div>
                  <p className="text-xs text-purple-900 font-medium mt-0.5">{ai.recommendation}</p>
                </div>
              </div>

              <button
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                onClick={() => setInsightsOpen(true)}
              >
                View AI Insights →
              </button>
            </SectionCard>

            {/* 9 — Experiment Summary */}
            <SectionCard n={9} title="Experiment Summary" accent="bg-purple-600">
              <div className="grid grid-cols-2 gap-2">
                <ScoreTile
                  label="Technical Score"
                  value={summary.technicalScore}
                  unit="/100"
                  tone="border-blue-200 bg-blue-50/50"
                />
                <ScoreTile
                  label="Statistical Confidence"
                  value={summary.statisticalConfidence}
                  unit="%"
                  tone="border-emerald-200 bg-emerald-50/50"
                />
                <ScoreTile
                  label="Validation Score"
                  value={summary.validationScore}
                  unit="/100"
                  tone="border-amber-200 bg-amber-50/50"
                />
                <ScoreTile
                  label="Overall Score"
                  value={summary.overallExperimentScore}
                  unit="/100"
                  tone="border-purple-200 bg-purple-50/50"
                />
              </div>
              <Field label="Recommendation" required>
                <Select
                  value={form.recommendation}
                  onChange={(v) => set("recommendation", v)}
                  options={
                    lookups?.recommendations ?? [
                      "Proceed to Engineering Validation",
                      "Repeat Experiment",
                    ]
                  }
                  disabled={!editable}
                />
              </Field>
            </SectionCard>

            {/* 10 — Attachments */}
            <SectionCard
              n={10}
              title="Attachments"
              accent="bg-blue-600"
              className="lg:col-span-2 2xl:col-span-3"
            >
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {form.attachments.map((a) => (
                  <AttachmentCard
                    key={a.id}
                    name={a.filename}
                    size="1.8 MB"
                    category={a.category}
                    editable={editable}
                    onRemove={() =>
                      set(
                        "attachments",
                        form.attachments.filter((x) => x.id !== a.id),
                      )
                    }
                  />
                ))}
              </div>
              {editable && (
                <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
                  <select
                    className={cn(INPUT, "border-border max-w-xs")}
                    value={attachCategory}
                    onChange={(e) => setAttachCategory(e.target.value)}
                  >
                    {(lookups?.attachmentCategories ?? ["Experiment Protocol", "Test Reports"]).map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ),
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-white px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground cursor-pointer"
                  >
                    <Upload className="h-4 w-4" /> Upload File / Drag & Drop
                  </button>
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

            {/* 11 — Review & Approval */}
            <SectionCard
              n={11}
              title="Review & Approval"
              accent="bg-blue-600"
              className="lg:col-span-2 2xl:col-span-3"
            >
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    role: "Laboratory Manager",
                    name: "Neha Sharma",
                    status: "reviewed",
                    date: "2024-05-22",
                  },
                  {
                    role: "Technical Reviewer",
                    name: "Vikram Singh",
                    status: "reviewed",
                    date: "2024-05-22",
                  },
                  {
                    role: "Quality Manager",
                    name: "Arjan Mehra",
                    status: "reviewed",
                    date: "2024-05-23",
                  },
                  { role: "R&D Director", name: "Dr. Anita Patel", status: "pending", date: null },
                ].map((r) => (
                  <div
                    key={r.role}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-white p-3 shadow-xs"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {r.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-foreground">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground">{r.role}</div>
                      <div
                        className={cn(
                          "text-[10px] font-semibold mt-0.5",
                          r.status === "reviewed" ? "text-emerald-600" : "text-amber-600",
                        )}
                      >
                        {r.status === "reviewed"
                          ? `Reviewed ${r.date ? `22 May 2024` : ""}`
                          : "Pending"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Approval Decision">
                  <Select
                    value={reviewDecision}
                    onChange={(v) => setReviewDecision(v as ExperimentApprovalDecision)}
                    options={
                      lookups?.approvalDecisions ?? [
                        "Approved with Conditions",
                        "Approved",
                        "Revision Required",
                      ]
                    }
                    disabled={!editable}
                  />
                </Field>
                <Field label="Next Action">
                  <Select
                    value={reviewNextAction}
                    onChange={(v) => setReviewNextAction(v)}
                    options={lookups?.nextActions ?? ["Proceed to Engineering Validation"]}
                    disabled={!editable}
                  />
                </Field>
                <Field label="Review Comments">
                  <TextInput
                    value={reviewComments}
                    onChange={(v) => setReviewComments(v)}
                    disabled={!editable}
                    placeholder="Increase sample size to 8 for next validation."
                  />
                </Field>
                <Field label="Approval Date">
                  <input
                    type="date"
                    className={cn(INPUT, "border-border")}
                    value="2024-05-23"
                    disabled={!editable}
                  />
                </Field>
              </div>
            </SectionCard>

            {/* 12 — System Information */}
            <SectionCard
              n={12}
              title="System Information"
              accent="bg-purple-600"
              className="lg:col-span-2 2xl:col-span-3"
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">
                    Created By
                  </div>
                  <div className="text-xs font-semibold text-foreground mt-0.5">
                    {record?.createdBy ?? "Rohit Verma"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">20 May 2024 09:15 AM</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">
                    Last Modified By
                  </div>
                  <div className="text-xs font-semibold text-foreground mt-0.5">
                    {record?.lastModifiedBy ?? "Rohit Verma"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">23 May 2024 02:45 PM</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">
                    Workflow Stage
                  </div>
                  <div className="pt-0.5">
                    <StatusBadge status="Technical Review" />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">
                    Version
                  </div>
                  <div className="text-xs font-semibold text-foreground mt-0.5">1.2</div>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    onClick={() => setHistoryOpen(true)}
                  >
                    View Activity History →
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ------------------------------- Sidebar ------------------------------- */}
          <aside className="space-y-5 xl:sticky xl:top-4">
            {/* Experiment Progress */}
            <div className="card-soft space-y-3.5 p-4">
              <h3 className="text-sm font-bold text-foreground">Experiment Progress</h3>
              <div className="flex items-center gap-4">
                <ProgressRing value={progress} />
                <ul className="flex-1 space-y-2">
                  {PROGRESS_PHASES.map((phase, i) => {
                    const done = i < phasesDone;
                    const active = i === phasesDone && status !== "approved";
                    return (
                      <li key={phase} className="flex items-center gap-2 text-xs">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : active ? (
                          <Circle className="h-4 w-4 shrink-0 fill-primary/20 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            done ? "text-foreground font-semibold" : "text-muted-foreground",
                          )}
                        >
                          {phase}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Key Scores */}
            <div className="card-soft space-y-3 p-4">
              <h3 className="text-sm font-bold text-foreground">Key Scores</h3>
              <div className="grid grid-cols-2 gap-2">
                <ScoreTile
                  label="Technical Score"
                  value={summary.technicalScore}
                  unit="/100"
                  tone="border-blue-200 bg-blue-50/40"
                />
                <ScoreTile
                  label="Statistical Confidence"
                  value={summary.statisticalConfidence}
                  unit="%"
                  tone="border-emerald-200 bg-emerald-50/40"
                />
                <ScoreTile
                  label="Validation Score"
                  value={summary.validationScore}
                  unit="/100"
                  tone="border-amber-200 bg-amber-50/40"
                />
                <ScoreTile
                  label="Overall Score"
                  value={summary.overallExperimentScore}
                  unit="/100"
                  tone="border-purple-200 bg-purple-50/40"
                />
              </div>
            </div>

            {/* AI Experiment Assistant */}
            <div className="card-soft space-y-3 p-4 border-purple-100">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Brain className="h-4 w-4 text-purple-600" /> AI Experiment Assistant
              </h3>
              <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3 border border-purple-200">
                <span className="text-xs font-semibold text-purple-900">AI Confidence Level</span>
                <span className="tabular text-xl font-bold text-purple-700">
                  {ai.aiConfidenceLevel}%
                </span>
              </div>
              <div className="rounded-xl bg-muted/30 p-3 border border-border">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" /> AI Recommendation
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                  {ai.recommendation}
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                onClick={() => setInsightsOpen(true)}
              >
                View AI Insights →
              </button>
            </div>

            {/* Quick Actions */}
            <div className="card-soft space-y-2 p-4">
              <h3 className="text-sm font-bold text-foreground">Quick Actions</h3>
              <QuickAction
                icon={<FileText className="h-4 w-4" />}
                label="Generate Test Plan"
                onClick={() => setTestPlanModalOpen(true)}
              />
              <QuickAction
                icon={<CalendarClock className="h-4 w-4" />}
                label="Schedule Experiment"
                onClick={() => setScheduleModalOpen(true)}
              />
              <QuickAction
                icon={<Upload className="h-4 w-4" />}
                label="Upload Raw Data"
                onClick={() => setUploadModalOpen(true)}
              />
              <QuickAction
                icon={<Brain className="h-4 w-4" />}
                label="Run AI Analysis"
                onClick={() => {
                  toast.success("AI Analysis executed — scores refreshed.");
                }}
              />
              <QuickAction
                icon={<FlaskConical className="h-4 w-4" />}
                label="Generate Report"
                onClick={() => {
                  toast.success("Experiment Report generated successfully.");
                }}
              />
              <QuickAction
                icon={<Landmark className="h-4 w-4" />}
                label="Request Approval"
                onClick={() => {
                  setReviewOpen(true);
                }}
              />
            </div>

            {/* Related Links */}
            <div className="card-soft space-y-2 p-4">
              <h3 className="text-sm font-bold text-foreground">Related Links</h3>
              <RelatedLink
                label="Prototype Development"
                code="PRD-2024-0012"
                to="/development/research-innovation/prototype-development/new"
              />
              <RelatedLink
                label="Proof of Concept"
                code="POC-2024-0045"
                to="/development/research-innovation/proof-of-concept/new"
              />
              <RelatedLink
                label="Research Project"
                code="RES-2024-0032"
                to="/development/research-innovation/research-management/new"
              />
              <RelatedLink label="Laboratory Dashboard" code="Advanced Engineering Lab" to="#" />
            </div>
          </aside>
        </div>
      </div>

      {/* --------------------------- Dialogs / Modals --------------------------- */}
      {/* Committee Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Technical Review Committee</DialogTitle>
            <DialogDescription>
              Docking Mechanism Durability Test — overall {summary.overallExperimentScore}/100,
              confidence {ai.aiConfidenceLevel}%.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Approval Decision" required>
              <Select
                value={reviewDecision}
                onChange={(v) => setReviewDecision(v as ExperimentApprovalDecision)}
                options={
                  lookups?.approvalDecisions ?? [
                    "Approved",
                    "Approved with Conditions",
                    "Revision Required",
                    "Rejected",
                  ]
                }
              />
            </Field>
            <Field label="Next Action">
              <Select
                value={reviewNextAction}
                onChange={setReviewNextAction}
                options={
                  lookups?.nextActions ?? [
                    "Proceed to Engineering Validation",
                    "Perform Additional Experiments",
                    "Update Experiment Design",
                  ]
                }
              />
            </Field>
            <Field
              label={
                reviewDecision === "Approved with Conditions"
                  ? "Improvements Required"
                  : "Review Comments"
              }
            >
              <TextArea value={reviewComments} onChange={setReviewComments} rows={3} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <ErpButton variant="outline" onClick={() => setReviewOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton
                onClick={() =>
                  record
                    ? reviewMut.mutate()
                    : (toast.success("Decision recorded!"), setReviewOpen(false))
                }
              >
                Record Decision
              </ErpButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Experiment</DialogTitle>
            <DialogDescription>
              Reserve laboratory equipment and schedule experiment dates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Laboratory / Test Bench" required>
              <Select
                value={scheduleLab}
                onChange={setScheduleLab}
                options={lookups?.laboratories ?? ["Advanced Engineering Lab"]}
              />
            </Field>
            <Field label="Execution Date" required>
              <input
                type="date"
                className={cn(INPUT, "border-border")}
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </Field>
            <Field label="Schedule Notes">
              <TextArea
                value={scheduleNotes}
                onChange={setScheduleNotes}
                rows={2}
                placeholder="Equipment calibration check and safety clearance."
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <ErpButton variant="outline" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </ErpButton>
              <ErpButton
                onClick={() => {
                  toast.success(`Experiment scheduled for ${scheduleDate} in ${scheduleLab}.`);
                  setScheduleModalOpen(false);
                }}
              >
                Confirm Schedule
              </ErpButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Raw Data</DialogTitle>
            <DialogDescription>
              Upload sensor logs, CSV raw data, or image/video observations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Data Category">
              <select
                className={cn(INPUT, "border-border")}
                value={attachCategory}
                onChange={(e) => setAttachCategory(e.target.value)}
              >
                {(lookups?.attachmentCategories ?? ["Sensor Logs", "Raw Data", "Images"]).map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center bg-muted/20">
              <Upload className="h-8 w-8 text-primary mb-2" />
              <div className="text-xs font-semibold text-foreground">
                Click to browse or drag & drop files
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Supports CSV, XLSX, PDF, PNG, JPG, MP4 (max 50MB)
              </div>
              <button
                type="button"
                className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <ErpButton variant="outline" onClick={() => setUploadModalOpen(false)}>
                Close
              </ErpButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Plan Modal */}
      <Dialog open={testPlanModalOpen} onOpenChange={setTestPlanModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generated Test Plan</DialogTitle>
            <DialogDescription>
              Auto-generated test protocol based on Section 2 (Experimental Design).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
              <div className="font-bold text-foreground text-sm">{form.experimentTitle}</div>
              <div className="text-muted-foreground">
                Method:{" "}
                <span className="font-semibold text-foreground">
                  {form.design.experimentMethod}
                </span>
              </div>
              <div className="text-muted-foreground">
                Statistical Method:{" "}
                <span className="font-semibold text-foreground">
                  {form.design.statisticalMethod}
                </span>
              </div>
              <div className="text-muted-foreground">
                Procedure:{" "}
                <span className="font-semibold text-foreground">{form.design.testProcedure}</span>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-1">
              <div className="font-bold text-foreground">Test Parameters</div>
              <div>Independent Variables: {form.design.independentVariables}</div>
              <div>Dependent Variables: {form.design.dependentVariables}</div>
              <div>Controlled Variables: {form.design.controlledVariables}</div>
              <div>
                Sample Size: {form.design.sampleSize} | Trials: {form.design.numberOfTrials}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <ErpButton variant="outline" onClick={() => setTestPlanModalOpen(false)}>
                Close
              </ErpButton>
              <ErpButton
                onClick={() => {
                  toast.success("Test Plan PDF downloaded.");
                  setTestPlanModalOpen(false);
                }}
              >
                <Download className="h-4 w-4" /> Download Test Plan PDF
              </ErpButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Activity History</DialogTitle>
            <DialogDescription>EXP-2024-0096 — Full Audit Trail.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {[
              {
                event:
                  "Monitoring: Experiment Dashboard and KPI Dashboard updated; experiment report generated",
                actor: "System",
                date: "23 May 2024 02:45 PM",
              },
              {
                event: "Technical Review Committee sign-off: Approved with Conditions",
                actor: "Technical Review Committee",
                date: "23 May 2024 02:40 PM",
              },
              {
                event: "Experiment report submitted to the Technical Review Committee",
                actor: "Rohit Verma",
                date: "22 May 2024 05:15 PM",
              },
              {
                event: "Validation stage completed — Validation Score: 74/100",
                actor: "Rohit Verma",
                date: "22 May 2024 04:30 PM",
              },
              {
                event: "Experiment Execution stage completed — Trial 2 recorded",
                actor: "Rohit Verma",
                date: "21 May 2024 03:20 PM",
              },
              {
                event: "Laboratory Preparation stage completed — Equipment & Test Bench reserved",
                actor: "Rohit Verma",
                date: "20 May 2024 02:00 PM",
              },
              {
                event: "Experiment Planning stage completed — Design Score 88/100",
                actor: "Rohit Verma",
                date: "20 May 2024 10:30 AM",
              },
              {
                event:
                  "Context retrieved — prototype specifications (PRD-2024-0012), project schedule & milestones, lab availability & equipment status",
                actor: "System",
                date: "20 May 2024 09:15 AM",
              },
              {
                event: "Experiment EXP-2024-0096 created from approved Prototype PRD-2024-0012",
                actor: "System",
                date: "20 May 2024 09:15 AM",
              },
            ].map((a, i) => (
              <li key={i} className="rounded-xl border border-border bg-muted/20 px-3 py-2">
                <div className="text-xs font-semibold text-foreground">{a.event}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {a.actor} · {a.date}
                </div>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={insightsOpen} onOpenChange={setInsightsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Experiment Insights</DialogTitle>
            <DialogDescription>
              Computed from experimental design & results — single source of truth.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <MiniScore label="Technical Score" value={summary.technicalScore} />
              <MiniScore label="Statistical Confidence" value={summary.statisticalConfidence} />
              <MiniScore label="Validation Score" value={summary.validationScore} />
              <MiniScore label="Overall Score" value={summary.overallExperimentScore} />
              <MiniScore label="Experimental Design" value={ai.experimentalDesignScore} />
              <MiniScore label="Repeatability" value={ai.repeatabilityScore} />
            </div>
            <div className="text-xs text-muted-foreground">
              Recommendation:{" "}
              <span className="font-bold text-foreground">{summary.recommendation}</span>
            </div>
            <AITextBlock label="Sample Size Recommendation" text={ai.sampleSizeRecommendation} />
            <AITextBlock label="Risk Assessment" text={ai.riskAssessment} />
            <AITextBlock label="Trend Analysis" text={ai.trendAnalysis} />
            <AITextBlock label="Failure Prediction" text={ai.failurePrediction} />
            <AITextBlock label="Optimization Suggestions" text={ai.optimizationSuggestions} />
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function HeaderLinkChip({
  label,
  code,
  to,
}: {
  label: string;
  code: string | null | undefined;
  to?: string;
}) {
  return (
    <div className="space-y-1">
      <span className="block text-xs font-semibold text-foreground">{label}</span>
      <div className="flex h-[38px] items-center justify-between rounded-lg border border-border bg-white px-2.5 text-xs font-semibold text-primary shadow-xs">
        {code ? (
          <Link
            to={to ?? "#"}
            className="flex items-center gap-1 text-primary hover:underline"
            title={`View ${code}`}
          >
            <span>{code}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

function RelatedLink({
  label,
  code,
  to,
}: {
  label: string;
  code: string | null | undefined;
  to?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {to && code ? (
        <Link
          to={to}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          {code}
          <ChevronRight className="h-3 w-3" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
          {code ?? "—"}
          {code && <ChevronRight className="h-3 w-3" />}
        </span>
      )}
    </div>
  );
}

function AITextBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2.5">
      <div className="text-[11px] font-bold text-foreground">{label}</div>
      <p className="text-xs text-muted-foreground mt-0.5">{text}</p>
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "text-emerald-600" : value >= 50 ? "text-amber-600" : "text-rose-600";
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-xs">
      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      <span className={cn("tabular text-xs font-bold", color)}>{value}</span>
    </div>
  );
}

function QuickAction(p: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={p.onClick}
      disabled={p.disabled}
      className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-xs"
    >
      <span className="text-primary">{p.icon}</span>
      {p.label}
    </button>
  );
}
