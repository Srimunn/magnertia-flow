import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, BarChart2, ArrowLeftRight, BookOpen, CreditCard, Users,
  Landmark, Package, PieChart, FileText, Receipt, Building2, TrendingUp,
  Layers, Shield, Settings, Bell, Menu, X, RefreshCw, ChevronDown, Calendar, Grid3x3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { company } from "@/lib/mock-data";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/overview", label: "Overview", icon: BarChart2 },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/ledger", label: "General Ledger", icon: BookOpen },
  { to: "/payables", label: "Accounts Payable", icon: CreditCard },
  { to: "/receivables", label: "Accounts Receivable", icon: Users },
  { to: "/cash-bank", label: "Cash & Bank", icon: Landmark },
  { to: "/assets", label: "Fixed Assets", icon: Package },
  { to: "/budgeting", label: "Budgeting", icon: PieChart },
  { to: "/reports", label: "Financial Reporting", icon: FileText },
  { to: "/tax", label: "Tax Management", icon: Receipt },
  { to: "/cost-centers", label: "Cost Centers", icon: Building2 },
  { to: "/profitability", label: "Profitability Analysis", icon: TrendingUp },
  { to: "/consolidation", label: "Consolidation", icon: Layers },
  { to: "/audit", label: "Audit Trail", icon: Shield },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 px-2">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#6B4EFF] to-[#8B6FFF] text-white shadow-[0_6px_18px_-4px_rgba(107,78,255,0.6)]">
        <span className="font-display text-xl font-extrabold leading-none">M</span>
      </div>
      <div className="font-display text-[20px] font-bold tracking-tight text-white leading-none">
        Magnertia
      </div>
    </Link>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex-1 overflow-y-auto px-3 pb-4">
      <div className="px-3 pb-3 pt-1">
        <div className="font-display text-[15px] font-bold leading-tight text-white">Financial</div>
        <div className="font-display text-[15px] font-bold leading-tight text-white">Management</div>
      </div>
      <ul className="space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[#6B4EFF] text-white shadow-[0_4px_12px_-2px_rgba(107,78,255,0.5)]"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-white/10 px-3 py-3">
      <Link
        to="/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <Settings className="h-[18px] w-[18px]" />
        <span>Settings</span>
      </Link>
    </div>
  );
}

function Topbar({ onMenuClick, title, breadcrumb, description }: {
  onMenuClick: () => void; title: string; breadcrumb?: string; description?: string;
}) {
  return (
    <header className="border-b border-border bg-background/80 px-4 pt-4 pb-5 backdrop-blur-md lg:px-8 lg:pt-6">
      <div className="flex items-start gap-3">
        <button
          onClick={onMenuClick}
          className="-ml-1 rounded-lg p-2 text-foreground hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          {breadcrumb && (
            <div className="mb-1 flex items-center gap-1.5 text-[13px]">
              <span className="font-medium text-[#6B4EFF]">{breadcrumb}</span>
              <span className="text-muted-foreground">›</span>
              <span className="text-muted-foreground">{title}</span>
            </div>
          )}
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-foreground sm:text-[28px]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground shadow-sm hover:bg-muted/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {company.fiscalYear.replace("FY ", "Fiscal Year ")}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground shadow-sm hover:bg-muted/50">
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            All Companies
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted/50" aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <button className="relative ml-auto shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </button>
      </div>

      <div className="mt-2 hidden justify-end text-[11px] text-muted-foreground md:flex">
        <span className="inline-flex items-center gap-1.5">
          Last updated: Today, 10:30 AM
          <RefreshCw className="h-3 w-3" />
        </span>
      </div>
    </header>
  );
}

export function AppShell({ children, title, breadcrumb, description }: {
  children: ReactNode;
  title?: string;
  breadcrumb?: string;
  description?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col bg-sidebar lg:flex">
        <div className="px-5 pt-5 pb-3">
          <Brand />
        </div>
        <SidebarNav />
        <SidebarFooter />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-sidebar shadow-2xl lg:hidden animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <Brand />
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-white/70 hover:bg-white/10" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter />
          </aside>
        </>
      )}

      <div className="lg:pl-[232px]">
        {title && (
          <Topbar
            onMenuClick={() => setMobileOpen(true)}
            title={title}
            breadcrumb={breadcrumb}
            description={description}
          />
        )}
        <main className="px-4 py-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl font-bold text-foreground sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
