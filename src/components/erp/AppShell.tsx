import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Wallet, TrendingUp, Receipt, ArrowDownToLine,
  ArrowUpFromLine, BookOpen, Boxes, Building2, Zap, Users, BarChart3,
  Settings, Bell, Search, Menu, X, ChevronDown, LogOut, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { company } from "@/lib/mock-data";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };
type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Financial Management",
    items: [
      { to: "/revenue", label: "Revenue", icon: TrendingUp },
      { to: "/expenses", label: "Expenses", icon: Wallet },
      { to: "/receivables", label: "Accounts Receivable", icon: ArrowDownToLine },
      { to: "/payables", label: "Accounts Payable", icon: ArrowUpFromLine },
      { to: "/ledger", label: "General Ledger", icon: BookOpen },
      { to: "/reports", label: "Reports & Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/stations", label: "Stations", icon: Zap },
      { to: "/assets", label: "Assets", icon: Boxes },
      { to: "/vendors", label: "Vendors", icon: Building2 },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/users", label: "Users & Roles", icon: Users },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2 py-1">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
        <Zap className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <div className="font-display text-[15px] font-bold tracking-tight text-foreground leading-tight">
          MAGNERTIA
        </div>
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          ERP Suite
        </div>
      </div>
    </Link>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {NAV.map((group) => (
        <div key={group.label} className="mb-5">
          <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {group.label}
          </div>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-secondary text-primary"
                        : "text-foreground/70 hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="truncate">{item.label}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-2.5 rounded-lg p-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          AM
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">Aarav Mehta</div>
          <div className="truncate text-xs text-muted-foreground">Super Admin</div>
        </div>
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-foreground hover:bg-secondary lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search invoices, stations, vendors…"
          className="h-10 w-full rounded-lg border border-input bg-secondary/40 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {company.fiscalYear}
        </div>
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Help">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </button>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <button className="hidden items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary sm:flex">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">AM</div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Brand />
        </div>
        <SidebarNav />
        <SidebarFooter />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar shadow-2xl lg:hidden animate-in slide-in-from-left duration-200">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Brand />
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-secondary" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter />
          </aside>
        </>
      )}

      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
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
