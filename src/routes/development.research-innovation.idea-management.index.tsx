import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Lightbulb,
  CheckCircle2,
  Gauge,
  TrendingUp,
  CalendarPlus,
  ShieldCheck,
  PiggyBank,
  Timer,
  Plus,
  Bell,
  BellOff,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AppShell } from "@/components/erp/AppShell";
import { WidgetPage } from "@/widgets/components/WidgetPage";
import { IdeaTabBar } from "@/components/erp/IdeaTabBar";
import { InnovationAreaTabs } from "@/components/erp/ResearchInnovationTabBar";
import { CardHeader } from "@/components/erp/CardHeader";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable, EmptyState } from "@/components/erp/DataTable";
import { ErpButton } from "@/components/erp/Button";
import { formatCurrency } from "@/lib/mock-data";
import { ideaManagementService } from "@/services";
import type { IdeaListRow } from "@/services/types";

export const Route = createFileRoute("/development/research-innovation/idea-management/")({
  head: () => ({ meta: [{ title: "Idea Management · Magnertia ERP" }] }),
  component: IdeaDashboardPage,
});

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 65
      ? "bg-success/10 text-success"
      : score >= 45
        ? "bg-warning/15 text-[oklch(0.45_0.15_75)]"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tabular ${tone}`}
    >
      {score}
    </span>
  );
}

function IdeaDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ["ideas", "dashboard"],
    queryFn: () => ideaManagementService.fetchDashboard(),
  });
  const notificationsQuery = useQuery({
    queryKey: ["ideas", "notifications"],
    queryFn: () => ideaManagementService.fetchNotifications(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => ideaManagementService.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ideas", "notifications"] }),
  });

  const data = dashboardQuery.data;
  const isLoading = dashboardQuery.isLoading;
  const notifications = notificationsQuery.data ?? [];
  const unread = notifications.filter((n) => !n.read);

  const newIdeaButton = (
    <Link to="/development/research-innovation/idea-management/new">
      <ErpButton>
        <Plus className="h-4 w-4" /> New Idea
      </ErpButton>
    </Link>
  );

  return (
    <AppShell
      title="Idea Management"
      breadcrumb="Research & Innovation Development"
      description="Capture, evaluate, and track ideas through the innovation pipeline."
      tabs={<InnovationAreaTabs sub={<IdeaTabBar />} />}
      topbarActions={newIdeaButton}
    >
      {isLoading || !data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="h-[500px] animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* KPI rows — manual & calculated metrics only (no AI-derived scores) */}
          <WidgetPage pageId="ri-ideas" skeleton={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />))}</div>} />

          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left — ideas register */}
            <div className="min-w-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">Ideas Register</h3>
                <span className="text-xs text-muted-foreground">{data.rows.length} total</span>
              </div>
              {data.rows.length === 0 ? (
                <EmptyState
                  title="No ideas yet"
                  description="Submit an idea to start it through the innovation pipeline."
                  action={newIdeaButton}
                />
              ) : (
                <DataTable<IdeaListRow>
                  data={data.rows}
                  onRowClick={(r) =>
                    navigate({
                      to: "/development/research-innovation/idea-management/$ideaId",
                      params: { ideaId: r.id },
                    })
                  }
                  columns={[
                    {
                      key: "idea",
                      header: "Idea",
                      cell: (r) => (
                        <div>
                          <span className="block font-semibold text-foreground">
                            {r.title || "Untitled"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {r.ideaCode} · {r.category || "Uncategorized"}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: "status",
                      header: "Status",
                      cell: (r) => <StatusBadge status={r.status} />,
                    },
                    {
                      key: "score",
                      header: "Score",
                      align: "center",
                      cell: (r) => <ScorePill score={r.overallEvaluationScore} />,
                    },
                    {
                      key: "submittedBy",
                      header: "Submitted By",
                      cell: (r) => <span className="text-muted-foreground">{r.submittedBy}</span>,
                    },
                    {
                      key: "date",
                      header: "Date",
                      align: "right",
                      cell: (r) => (
                        <span className="text-muted-foreground">{fmtDate(r.dateSubmitted)}</span>
                      ),
                    },
                  ]}
                  mobileCard={(r) => (
                    <div
                      onClick={() =>
                        navigate({
                          to: "/development/research-innovation/idea-management/$ideaId",
                          params: { ideaId: r.id },
                        })
                      }
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{r.title || "Untitled"}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.ideaCode} · {fmtDate(r.dateSubmitted)}
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  )}
                />
              )}
            </div>

            {/* Right — pipeline, breakdowns, notifications */}
            <div className="space-y-5">
              <div className="card-soft p-5">
                <CardHeader title="Innovation Pipeline" />
                <p className="mb-2 mt-1 text-[11px] text-muted-foreground">
                  Submitted vs. approved · last 6 months
                </p>
                <div className="h-[160px] w-full">
                  <ResponsiveContainer>
                    <LineChart
                      data={data.pipelineTrend}
                      margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="submitted"
                        stroke="#22C55E"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="approved"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <BreakdownDonut title="Ideas by Department" unit="Ideas" data={data.byDepartment} />
              <BreakdownDonut
                title="Ideas by Technology Area"
                unit="Tags"
                data={data.byTechnologyArea}
              />

              {/* Notification center */}
              <div className="card-soft p-5">
                <div className="flex items-center justify-between">
                  <CardHeader title="Notifications" />
                  {unread.length > 0 && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                      {unread.length} new
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                      <BellOff className="h-5 w-5" />
                      <span className="text-xs">No notifications yet</span>
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                          n.read ? "border-border bg-transparent" : "border-primary/20 bg-primary/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                              <Bell className="h-3 w-3 shrink-0 text-primary" />
                              <span className="truncate">{n.title}</span>
                            </div>
                            <p className="mt-0.5 text-muted-foreground">{n.body}</p>
                            <span className="mt-0.5 block text-[10px] text-muted-foreground/70">
                              {n.role} · {new Date(n.createdAt).toLocaleString("en-IN")}
                            </span>
                          </div>
                          {!n.read && (
                            <button
                              onClick={() => markRead.mutate(n.id)}
                              className="shrink-0 text-[10px] font-semibold text-primary hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function BreakdownDonut({
  title,
  unit,
  data,
}: {
  title: string;
  unit: string;
  data: { name: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="card-soft p-5">
      <CardHeader title={title} />
      {data.length === 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">No data yet</p>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-4">
          <div className="relative h-[130px] w-[130px] shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="font-display text-[15px] font-bold text-foreground">{total}</div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {unit}
                </div>
              </div>
            </div>
          </div>
          <ul className="w-full space-y-1.5 text-xs">
            {data.slice(0, 6).map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-muted-foreground">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="truncate">{s.name}</span>
                </span>
                <span className="shrink-0 font-semibold tabular text-foreground">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
