import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, LogIn } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { AppShell } from "@/components/erp/AppShell";
import { AdminHomeTabBar } from "@/components/erp/AdminHomeTabBar";
import { CardHeader } from "@/components/erp/CardHeader";
import { StatCard } from "@/components/erp/StatCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { DataTable } from "@/components/erp/DataTable";
import {
  mockCompanies,
  mockLoginHistory,
  mockUserActivityTrend,
  mockUsersByDepartment,
  mockUserStatusSummary,
} from "@/lib/mock-data";
import type { AdminHomeDashboardData, CompanyRecord, LoginHistoryEntry } from "@/services/types";

export const Route = createFileRoute("/administration/home/overview")({
  head: () => ({ meta: [{ title: "Administration · Magnertia ERP" }] }),
  component: AdministrationOverviewPage,
});

const INITIAL_ADMIN_DATA: AdminHomeDashboardData = {
  kpis: { activeUsersCount: 142, branchCount: 12, loginsToday: 89 },
  companies: mockCompanies,
  recentLogins: mockLoginHistory.slice(0, 5),
  activityTrend: mockUserActivityTrend,
  usersByDepartment: mockUsersByDepartment,
  userStatusSummary: mockUserStatusSummary,
};

function AdministrationOverviewPage() {
  const dashboardQuery = useQuery({
    queryKey: ["administration", "home", "dashboard"],
    queryFn: () => loadAdministrationHomeData(),
    placeholderData: INITIAL_ADMIN_DATA,
  });
  const data = dashboardQuery.data ?? INITIAL_ADMIN_DATA;
  const isLoading = dashboardQuery.isLoading && !dashboardQuery.data;

  return (
    <AppShell
      title="Home"
      breadcrumb="Administration"
      description="Company, branch, department, role, and user administration for the organization."
      tabs={<AdminHomeTabBar />}
    >
      {isLoading || !data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="h-[500px] animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* KPI row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Active Users"
              value={data.kpis.activeUsersCount.toLocaleString()}
              neutralText="Across all companies"
              icon={<Users className="h-5 w-5" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              label="Branch Count"
              value={data.kpis.branchCount.toString()}
              neutralText="Active & inactive branches"
              icon={<Building2 className="h-5 w-5" />}
              iconBg="bg-[#3B82F6]/10"
              iconColor="text-[#3B82F6]"
            />
            <StatCard
              label="Logins Today"
              value={data.kpis.loginsToday.toString()}
              neutralText="Successful logins"
              icon={<LogIn className="h-5 w-5" />}
              iconBg="bg-[#10B981]/10"
              iconColor="text-[#10B981]"
            />
          </div>

          {/* Main Layout Grid */}
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
            {/* Left Content Column */}
            <div className="min-w-0 space-y-5">
              {/* Companies preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">Companies</h3>
                  <Link
                    to="/administration/home/companies"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View All Companies →
                  </Link>
                </div>
                <div className="card-soft overflow-hidden">
                  <DataTable<CompanyRecord>
                    data={data.companies.slice(0, 5)}
                    columns={[
                      {
                        key: "name",
                        header: "Company",
                        cell: (r) => (
                          <div>
                            <span className="font-semibold text-foreground block">{r.name}</span>
                            <span className="text-xs text-muted-foreground">{r.code}</span>
                          </div>
                        ),
                      },
                      {
                        key: "branchCount",
                        header: "Branches",
                        align: "right",
                        cell: (r) => (
                          <span className="tabular text-foreground">{r.branchCount}</span>
                        ),
                      },
                      {
                        key: "status",
                        header: "Status",
                        cell: (r) => <StatusBadge status={r.status} />,
                      },
                    ]}
                    mobileCard={(r) => (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.code}</div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Recent Login History preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">Recent Login History</h3>
                  <Link
                    to="/administration/home/users"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View All Users →
                  </Link>
                </div>
                <div className="card-soft overflow-hidden">
                  <DataTable<LoginHistoryEntry>
                    data={data.recentLogins}
                    columns={[
                      {
                        key: "user",
                        header: "User",
                        cell: (r) => (
                          <span className="font-semibold text-foreground">{r.user}</span>
                        ),
                      },
                      {
                        key: "timestamp",
                        header: "Timestamp",
                        cell: (r) => (
                          <span className="text-xs text-muted-foreground">{r.timestamp}</span>
                        ),
                      },
                      {
                        key: "ipAddress",
                        header: "IP Address",
                        cell: (r) => (
                          <span className="font-mono text-xs text-muted-foreground">
                            {r.ipAddress}
                          </span>
                        ),
                      },
                      {
                        key: "status",
                        header: "Status",
                        cell: (r) => <StatusBadge status={r.status} />,
                      },
                    ]}
                    mobileCard={(r) => (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{r.user}</div>
                          <div className="text-xs text-muted-foreground">{r.timestamp}</div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* User Activity Trend */}
              <div className="card-soft p-5">
                <CardHeader title="User Activity Trend" />
                <p className="mt-1 mb-2 text-[11px] text-muted-foreground">
                  Logins over the last 30 days
                </p>
                <div className="h-[150px] w-full">
                  <ResponsiveContainer>
                    <LineChart
                      data={data.activityTrend}
                      margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="logins"
                        stroke="#22C55E"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Users by Department */}
              <div className="card-soft p-5">
                <CardHeader title="Users by Department" />
                <div className="flex flex-col items-center gap-4 mt-3">
                  <div className="relative h-[140px] w-[140px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data.usersByDepartment}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={3}
                          cornerRadius={4}
                          stroke="none"
                        >
                          {data.usersByDepartment.map((d) => (
                            <Cell key={d.name} fill={d.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[15px] font-bold text-foreground">
                          {data.usersByDepartment.reduce((sum, d) => sum + d.value, 0)}
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                          Total Users
                        </div>
                      </div>
                    </div>
                  </div>
                  <ul className="w-full space-y-1.5 text-xs">
                    {data.usersByDepartment.map((d) => (
                      <li key={d.name} className="flex items-center justify-between gap-2">
                        <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-muted-foreground">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: d.color }}
                          />
                          <span className="truncate">{d.name}</span>
                        </span>
                        <span className="shrink-0 font-semibold text-foreground tabular">
                          {d.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Active vs Inactive Users */}
              <div className="card-soft p-5">
                <CardHeader title="Active vs Inactive Users" />
                <div className="flex flex-col items-center gap-4 mt-3">
                  <div className="relative h-[130px] w-[130px] shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Active", value: data.userStatusSummary.activeCount },
                            { name: "Inactive", value: data.userStatusSummary.inactiveCount },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={36}
                          outerRadius={56}
                          paddingAngle={2}
                          stroke="none"
                        >
                          <Cell fill="#22C55E" />
                          <Cell fill="#9CA3AF" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <div className="font-display text-[15px] font-bold text-foreground">
                          {data.userStatusSummary.activeCount +
                            data.userStatusSummary.inactiveCount}
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                          Total Users
                        </div>
                      </div>
                    </div>
                  </div>
                  <ul className="w-full space-y-1.5 text-xs">
                    <li className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-[#22C55E]" /> Active
                      </span>
                      <span className="font-semibold text-foreground tabular">
                        {data.userStatusSummary.activeCount}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-[#9CA3AF]" /> Inactive
                      </span>
                      <span className="font-semibold text-foreground tabular">
                        {data.userStatusSummary.inactiveCount}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
