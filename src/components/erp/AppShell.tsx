import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import {
  LayoutDashboard,
  Landmark,
  Package,
  Building2,
  Settings,
  Menu,
  X,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Calendar,
  Grid3x3,
  Home,
  Star,
  Lightbulb,
  FlaskConical,
  Zap,
  Compass,
  Palette,
  ShieldCheck,
  Briefcase,
  Radar,
  Microscope,
  Terminal,
  Code,
  Smartphone,
  ClipboardCheck,
  Beaker,
  Cpu,
  TestTubes,
  Gauge,
  ScrollText,
  Stamp,
  Repeat,
  Target,
  Map,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { company, mockUsers } from "@/lib/mock-data";
import { Logo } from "./Logo";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type Icon = React.ComponentType<{ className?: string }>;

type SubItem = {
  to: string;
  label: string;
  badge?: number;
  badgeType?: "error" | "warning" | "success" | "info" | "primary";
};

type LeafItem = {
  kind: "leaf";
  to: string;
  matchPrefix?: string;
  label: string;
  icon: Icon;
  badge?: number;
  badgeType?: "error" | "warning" | "success" | "info" | "primary";
  subItems?: SubItem[];
};

type InertItem = {
  kind: "inert";
  label: string;
  icon: Icon;
  badge?: number;
  badgeType?: "error" | "warning" | "success" | "info" | "primary";
};

type GroupItem = {
  kind: "group";
  label: string;
  icon: Icon;
  children: (LeafItem | InertItem | GroupItem)[];
};

type SearchTarget = {
  label: string;
  to: string;
  breadcrumbs: string[];
  icon: Icon;
  badge?: number;
  badgeType?: string;
};

function groupContainsActive(group: GroupItem, pathname: string): boolean {
  return group.children.some((child) => {
    if (child.kind === "leaf") return pathname.startsWith(child.matchPrefix ?? child.to);
    if (child.kind === "group") return groupContainsActive(child, pathname);
    return false;
  });
}

const TOP_ITEMS: (LeafItem | InertItem)[] = [
  { kind: "inert", label: "Home", icon: Home },
  { kind: "leaf", to: "/", label: "Dashboard", icon: LayoutDashboard },
  { kind: "inert", label: "Favorites", icon: Star },
];

const NAV_GROUPS: GroupItem[] = [
  {
    kind: "group",
    label: "Administration",
    icon: Building2,
    children: [
      // Sibling groups are alphabetized (Development before Management).
      {
        kind: "group",
        label: "Development",
        icon: Package,
        children: [
          {
            kind: "leaf",
            to: "/development/research-innovation/product-strategy/overview",
            matchPrefix: "/development/research-innovation/product-strategy",
            label: "Product Strategy",
            icon: Target,
            subItems: [
              { to: "/development/research-innovation/product-strategy/overview", label: "Overview" },
              { to: "/development/research-innovation/product-strategy/new", label: "Strategy Form" },
              { to: "/development/research-innovation/product-strategy/portfolio", label: "Strategy Portfolio" },
              { to: "/development/research-innovation/product-strategy/roadmaps", label: "Product Roadmaps" },
              { to: "/development/research-innovation/product-strategy/reports", label: "Strategy Reports" },
            ],
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/product-roadmap/new",
            matchPrefix: "/development/research-innovation/product-roadmap",
            label: "Product Roadmap",
            icon: Map,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/prd/new",
            matchPrefix: "/development/research-innovation/prd",
            label: "Product Requirements (PRD)",
            icon: ClipboardCheck,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/product-architecture/new",
            matchPrefix: "/development/research-innovation/product-architecture",
            label: "Product Architecture",
            icon: Cpu,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/industrial-design/new",
            matchPrefix: "/development/research-innovation/industrial-design",
            label: "Industrial Design",
            icon: Palette,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/mechanical-design/new",
            matchPrefix: "/development/research-innovation/mechanical-design",
            label: "Mechanical Design",
            icon: Box,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/electrical-design/new",
            matchPrefix: "/development/research-innovation/electrical-design",
            label: "Electrical Design",
            icon: Zap,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/electronics-design/new",
            matchPrefix: "/development/research-innovation/electronics-design",
            label: "Electronics Design",
            icon: Cpu,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/embedded-systems-development/new",
            matchPrefix: "/development/research-innovation/embedded-systems-development",
            label: "Embedded Systems Development",
            icon: Microscope,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/firmware-development/new",
            matchPrefix: "/development/research-innovation/firmware-development",
            label: "Firmware Development",
            icon: Terminal,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/software-development/new",
            matchPrefix: "/development/research-innovation/software-development",
            label: "Software Development",
            icon: Code,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/mobile-app-development/new",
            matchPrefix: "/development/research-innovation/mobile-app-development",
            label: "Mobile App Development",
            icon: Smartphone,
          },
          {
            kind: "leaf",
            to: "/development/research-innovation/overview",
            matchPrefix: "/development/research-innovation",
            label: "Research & Innovation",
            icon: FlaskConical,
            subItems: [
              // Overview pinned first (default landing tab); the rest are A→Z.
              { to: "/development/research-innovation/overview", label: "Overview" },
              { to: "/development/research-innovation/commercialization-planning", label: "Commercialization" },
              { to: "/development/research-innovation/design-thinking", label: "Design" },
              { to: "/development/research-innovation/experiment-management", label: "Experiments" },
              { to: "/development/research-innovation/feasibility-study", label: "Feasibility" },
              { to: "/development/research-innovation/idea-management", label: "Ideas" },
              { to: "/development/research-innovation/continuous-innovation", label: "Innovation" },
              { to: "/development/research-innovation/industrial-design/new", label: "Industrial Design" },
              { to: "/development/research-innovation/opportunity-discovery", label: "Opportunities" },
              { to: "/development/ip-development/patent-management", label: "Patents" },
              { to: "/development/research-innovation/proof-of-concept", label: "PoC" },
              { to: "/development/research-innovation/innovation-portfolio", label: "Portfolio" },
              { to: "/development/research-innovation/product-architecture/new", label: "Product Architecture" },
              { to: "/development/research-innovation/product-strategy/overview", label: "Product Strategy" },
              { to: "/development/research-innovation/prototype-development", label: "Prototype" },
              { to: "/development/research-innovation/reports", label: "Reports" },
              { to: "/development/research-innovation/research-management", label: "Research" },
              { to: "/development/research-innovation/technology-scouting", label: "Scouting" },
              { to: "/development/research-innovation/trl-assessment", label: "TRL" },
              { to: "/development/research-innovation/problem-validation", label: "Validation" },
            ],
          },
        ],
      },
      {
        kind: "group",
        label: "Management",
        icon: Landmark,
        children: [
          {
            kind: "leaf",
            to: "/management/finance/overview",
            matchPrefix: "/management/finance",
            label: "Finance",
            icon: Landmark,
            subItems: [
              { to: "/management/finance/overview", label: "Overview" },
              { to: "/management/finance/payables", label: "Accounts Payable" },
              { to: "/management/finance/receivables", label: "Accounts Receivable" },
              { to: "/management/finance/audit", label: "Audit Trail" },
              { to: "/management/finance/budgeting", label: "Budgeting" },
              { to: "/management/finance/cash-bank", label: "Cash & Bank" },
              { to: "/management/finance/consolidation", label: "Consolidation" },
              { to: "/management/finance/cost-centers", label: "Cost Centers" },
              { to: "/management/finance/reports", label: "Financial Reports" },
              { to: "/management/finance/assets", label: "Fixed Assets" },
              { to: "/management/finance/ledger", label: "General Ledger" },
              { to: "/management/finance/profitability", label: "Profitability" },
              { to: "/management/finance/setup", label: "Setup & Integrations" },
              { to: "/management/finance/tax", label: "Tax Management" },
            ],
          },
        ],
      },
    ],
  },
];

function Brand({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center transition-all duration-250 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-lg",
        isCollapsed ? "justify-center px-0 gap-0" : "px-2 gap-3",
      )}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-primary bg-white shadow-[0_2px_8px_-2px_rgba(10,60,117,0.35)]">
        <Logo className="h-7 w-7" showShadow={false} />
      </div>
      <span
        className={cn(
          "font-display text-[20px] font-bold tracking-tight leading-none transition-all duration-250 ease-in-out origin-left truncate",
          isCollapsed ? "w-0 opacity-0 scale-95 ml-0" : "w-auto opacity-100 scale-100",
        )}
      >
        <span className="text-primary">Magnertia</span>{" "}
        <span className="font-semibold text-slate-400">Suite</span>
      </span>
    </Link>
  );
}

const INDENT_CLASS: Record<number, string> = { 0: "", 1: "pl-4", 2: "pl-7", 3: "pl-10" };

function BadgeOverlay({ value, type = "error" }: { value: number | string; type?: string }) {
  if (!value) return null;
  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ring-2 ring-[#06101e] leading-none animate-in scale-in duration-200",
        type === "error"
          ? "bg-destructive"
          : type === "warning"
            ? "bg-amber-500"
            : type === "success"
              ? "bg-emerald-500"
              : "bg-primary",
      )}
    >
      {value}
    </span>
  );
}

function renderFlyoutChildren(
  children: (LeafItem | InertItem | GroupItem)[],
  pathname: string,
  onNavigate?: () => void,
): React.ReactNode {
  return children.map((child) => {
    if (child.kind === "group") {
      return (
        <div key={child.label} className="py-1">
          <div className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold text-white/40 uppercase tracking-wider">
            <child.icon className="h-3.5 w-3.5" />
            <span className="ml-1">{child.label}</span>
          </div>
          <ul className="pl-2.5 mt-0.5 space-y-1">
            {renderFlyoutChildren(child.children, pathname, onNavigate)}
          </ul>
        </div>
      );
    }
    if (child.kind === "leaf") {
      const isActive = pathname.startsWith(child.matchPrefix ?? child.to);
      return (
        <li key={child.to}>
          <Link
            to={child.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "text-white/70 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            <div className="flex items-center gap-2.5 truncate">
              <child.icon className="h-[15px] w-[15px] shrink-0" />
              <span className="truncate">{child.label}</span>
            </div>
            {child.badge && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none shrink-0",
                  child.badgeType === "error"
                    ? "bg-destructive text-white"
                    : child.badgeType === "warning"
                      ? "bg-amber-500 text-white"
                      : "bg-primary text-white",
                )}
              >
                {child.badge}
              </span>
            )}
          </Link>
          {child.subItems && child.subItems.length > 0 && (
            <ul className="pl-5 mt-0.5 space-y-1">
              {child.subItems.map((sub) => {
                const isSubActive = pathname.startsWith(sub.to);
                return (
                  <li key={sub.to}>
                    <Link
                      to={sub.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2 py-1.5 text-[12px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isSubActive ? "text-white font-bold" : "text-white/50 hover:text-white",
                      )}
                    >
                      <span className="truncate">{sub.label}</span>
                      {sub.badge && (
                        <span
                          className={cn(
                            "text-[9px] px-1 py-0.5 rounded-full font-bold leading-none shrink-0",
                            sub.badgeType === "error"
                              ? "bg-destructive text-white"
                              : sub.badgeType === "warning"
                                ? "bg-amber-500 text-white"
                                : "bg-primary text-white",
                          )}
                        >
                          {sub.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }
    // Inert item
    return (
      <li key={child.label}>
        <div
          className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-white/30"
          title="Coming soon"
        >
          <child.icon className="h-[15px] w-[15px] shrink-0" />
          <span className="truncate">{child.label}</span>
        </div>
      </li>
    );
  });
}

function NavLeaf({
  item,
  active,
  isCollapsed,
  onNavigate,
  depth = 0,
}: {
  item: LeafItem;
  active: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
  depth?: number;
}) {
  const Icon = item.icon;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [popoverOpen, setPopoverOpen] = useState(false);

  if (isCollapsed) {
    const hasSubItems = item.subItems && item.subItems.length > 0;

    if (hasSubItems) {
      return (
        <li className="list-none flex justify-center py-0.5">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <Tooltip open={popoverOpen ? false : undefined}>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "group relative flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/[0.06] hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer",
                      active
                        ? "bg-primary text-white shadow-[0_4px_12px_-2px_rgba(10,60,117,0.4)] animate-scale-in"
                        : "",
                    )}
                    aria-label={item.label}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {item.badge && <BadgeOverlay value={item.badge} type={item.badgeType} />}
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
            <PopoverContent
              side="right"
              align="start"
              className="w-64 bg-[#06101e] border border-white/10 text-white p-3 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-150"
            >
              <div className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 px-2.5 pb-1.5 border-b border-white/5">
                {item.label}
              </div>
              <ul className="space-y-1">
                {item.subItems!.map((sub) => {
                  const isSubActive = pathname.startsWith(sub.to);
                  return (
                    <li key={sub.to}>
                      <Link
                        to={sub.to}
                        onClick={() => {
                          setPopoverOpen(false);
                          onNavigate?.();
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          isSubActive
                            ? "bg-primary text-white shadow-sm"
                            : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                        )}
                      >
                        <span className="truncate">{sub.label}</span>
                        {sub.badge && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none shrink-0",
                              sub.badgeType === "error"
                                ? "bg-destructive text-white"
                                : sub.badgeType === "warning"
                                  ? "bg-amber-500 text-white"
                                  : "bg-primary text-white",
                            )}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </PopoverContent>
          </Popover>
        </li>
      );
    }

    return (
      <li className="list-none flex justify-center py-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/[0.06] hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active ? "bg-primary text-white shadow-[0_4px_12px_-2px_rgba(10,60,117,0.4)]" : "",
              )}
              aria-label={item.label}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.badge && <BadgeOverlay value={item.badge} type={item.badgeType} />}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return (
    <li>
      <Link
        to={item.to}
        onClick={onNavigate}
        className={cn(
          "group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          INDENT_CLASS[depth],
          active
            ? "bg-primary text-white shadow-[0_4px_12px_-2px_rgba(10,60,117,0.4)]"
            : "text-white/70 hover:bg-white/[0.06] hover:text-white",
        )}
      >
        <div className="flex items-center gap-3 truncate">
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge && (
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none shrink-0",
              item.badgeType === "error"
                ? "bg-destructive text-white"
                : item.badgeType === "warning"
                  ? "bg-amber-500 text-white"
                  : "bg-primary text-white",
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

function NavInert({
  item,
  isCollapsed,
  depth = 0,
}: {
  item: InertItem;
  isCollapsed: boolean;
  depth?: number;
}) {
  const Icon = item.icon;

  if (isCollapsed) {
    return (
      <li className="list-none flex justify-center py-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-lg text-white/30 transition-all"
              aria-disabled="true"
              title="Coming soon"
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label} (Coming soon)</TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return (
    <li>
      <div
        className={cn(
          "flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/30",
          INDENT_CLASS[depth],
        )}
        aria-disabled="true"
        title="Coming soon"
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="truncate">{item.label}</span>
      </div>
    </li>
  );
}

function NavGroup({
  group,
  pathname,
  isCollapsed,
  onNavigate,
  depth = 0,
}: {
  group: GroupItem;
  pathname: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
  depth?: number;
}) {
  const containsActive = groupContainsActive(group, pathname);
  const Icon = group.icon;

  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("magnertia_sidebar_open_groups");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const handleOpenChange = (open: boolean) => {
    setOpenGroups((prev) => {
      const next = open
        ? prev.includes(group.label)
          ? prev
          : [...prev, group.label]
        : prev.filter((g) => g !== group.label);
      localStorage.setItem("magnertia_sidebar_open_groups", JSON.stringify(next));
      return next;
    });
  };

  const [popoverOpen, setPopoverOpen] = useState(false);

  // Total badge sum to display on parent
  const badgeSum = useMemo(() => {
    const sumBadges = (children: (LeafItem | InertItem | GroupItem)[]): number => {
      return children.reduce(
        (sum, c) =>
          sum + ("badge" in c ? c.badge || 0 : 0) + ("children" in c ? sumBadges(c.children) : 0),
        0,
      );
    };
    return sumBadges(group.children);
  }, [group.children]);

  if (isCollapsed) {
    return (
      <li className="list-none flex justify-center py-0.5">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Tooltip open={popoverOpen ? false : undefined}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "group relative flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/[0.06] hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer",
                    containsActive ? "bg-white/10 text-white font-semibold" : "",
                  )}
                  aria-label={group.label}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {badgeSum > 0 && <BadgeOverlay value={badgeSum} type="error" />}
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">{group.label}</TooltipContent>
          </Tooltip>
          <PopoverContent
            side="right"
            align="start"
            className="w-64 bg-[#06101e] border border-white/10 text-white p-3 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-150"
          >
            <div className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2 px-2.5 pb-1.5 border-b border-white/5">
              {group.label}
            </div>
            <ul className="space-y-1">
              {renderFlyoutChildren(group.children, pathname, () => {
                setPopoverOpen(false);
                onNavigate?.();
              })}
            </ul>
          </PopoverContent>
        </Popover>
      </li>
    );
  }

  const isOpen = openGroups.includes(group.label) || (openGroups.length === 0 && containsActive);

  return (
    <li>
      <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none text-left",
            INDENT_CLASS[depth],
            containsActive ? "text-white font-semibold" : "text-white/70",
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1 truncate">{group.label}</span>
          {badgeSum > 0 && (
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full font-bold text-white shrink-0 mr-1">
              {badgeSum}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200 text-white/45 group-hover:text-white/85",
              isOpen ? "rotate-180" : "",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="transition-all duration-200 overflow-hidden">
          <ul className="mt-1 space-y-1">
            {group.children.map((child) => {
              if (child.kind === "group") {
                return (
                  <NavGroup
                    key={child.label}
                    group={child}
                    pathname={pathname}
                    isCollapsed={isCollapsed}
                    onNavigate={onNavigate}
                    depth={depth + 1}
                  />
                );
              }
              if (child.kind === "leaf") {
                return (
                  <NavLeaf
                    key={child.to}
                    item={child}
                    active={pathname.startsWith(child.matchPrefix ?? child.to)}
                    isCollapsed={isCollapsed}
                    onNavigate={onNavigate}
                    depth={depth + 1}
                  />
                );
              }
              return (
                <NavInert
                  key={child.label}
                  item={child}
                  isCollapsed={isCollapsed}
                  depth={depth + 1}
                />
              );
            })}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

function SidebarNav({
  isCollapsed,
  searchQuery,
  setSearchQuery,
  onNavigate,
}: {
  isCollapsed: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navRef = useRef<HTMLDivElement>(null);

  // Handle scroll persistence
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    localStorage.setItem("magnertia_sidebar_scroll_top", String(scrollTop));
  };

  useEffect(() => {
    const savedScroll = localStorage.getItem("magnertia_sidebar_scroll_top");
    if (savedScroll && navRef.current) {
      const parsed = parseFloat(savedScroll);
      if (!isNaN(parsed)) {
        const timer = setTimeout(() => {
          if (navRef.current) {
            navRef.current.scrollTop = parsed;
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isCollapsed]);

  // Arrow keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const focusable = navRef.current?.querySelectorAll(
      'a[href], button:not([disabled]), input, [tabindex="0"]',
    );
    if (!focusable) return;
    const active = document.activeElement;
    const idx = Array.from(focusable).indexOf(active as Element);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % focusable.length;
      (focusable[next] as HTMLElement).focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (idx - 1 + focusable.length) % focusable.length;
      (focusable[prev] as HTMLElement).focus();
    }
  };

  // Build flat array of searchable targets
  const searchTargets = useMemo(() => {
    const list: SearchTarget[] = [];
    TOP_ITEMS.forEach((item) => {
      if (item.kind === "leaf") {
        list.push({
          label: item.label,
          to: item.to,
          breadcrumbs: [],
          icon: item.icon,
          badge: item.badge,
          badgeType: item.badgeType,
        });
        if (item.subItems) {
          item.subItems.forEach((sub) => {
            list.push({
              label: sub.label,
              to: sub.to,
              breadcrumbs: [item.label],
              icon: item.icon,
              badge: sub.badge,
              badgeType: sub.badgeType,
            });
          });
        }
      }
    });

    const traverseGroup = (group: GroupItem, parentBreadcrumbs: string[]) => {
      const currentBreadcrumbs = [...parentBreadcrumbs, group.label];
      group.children.forEach((child) => {
        if (child.kind === "leaf") {
          list.push({
            label: child.label,
            to: child.to,
            breadcrumbs: currentBreadcrumbs,
            icon: child.icon,
            badge: child.badge,
            badgeType: child.badgeType,
          });
          if (child.subItems) {
            child.subItems.forEach((sub) => {
              list.push({
                label: sub.label,
                to: sub.to,
                breadcrumbs: [...currentBreadcrumbs, child.label],
                icon: child.icon,
                badge: sub.badge,
                badgeType: sub.badgeType,
              });
            });
          }
        } else if (child.kind === "group") {
          traverseGroup(child, currentBreadcrumbs);
        } else if (child.kind === "inert") {
          list.push({
            label: child.label,
            to: "#",
            breadcrumbs: currentBreadcrumbs,
            icon: child.icon,
            badge: child.badge,
            badgeType: child.badgeType,
          });
        }
      });
    };

    NAV_GROUPS.forEach((group) => {
      traverseGroup(group, []);
    });

    // Add Settings footer
    list.push({
      label: "Settings",
      to: "/settings",
      breadcrumbs: [],
      icon: Settings,
    });

    return list;
  }, []);

  const filteredSearchTargets = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase().trim();
    return searchTargets.filter(
      (t) =>
        t.label.toLowerCase().includes(query) ||
        t.breadcrumbs.some((b) => b.toLowerCase().includes(query)),
    );
  }, [searchQuery, searchTargets]);

  if (searchQuery) {
    return (
      <nav
        ref={navRef}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="flex-1 overflow-y-auto px-3 pb-4 sidebar-scrollbar"
      >
        {filteredSearchTargets.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-xs">No navigation items found</div>
        ) : (
          <ul className="space-y-1 pt-2">
            {filteredSearchTargets.map((target) => {
              const Icon = target.icon;
              const isCurrent = pathname.startsWith(target.to);
              return (
                <li key={target.to + "-" + target.label}>
                  {target.to === "#" ? (
                    <div
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/30"
                      title="Coming soon"
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <div className="min-w-0 flex-1 text-left">
                        <div className="truncate text-white/40">{target.label}</div>
                        {target.breadcrumbs.length > 0 && (
                          <div className="truncate text-[10px] text-white/20">
                            {target.breadcrumbs.join(" › ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={target.to}
                      onClick={() => {
                        setSearchQuery("");
                        onNavigate?.();
                      }}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isCurrent
                          ? "bg-primary text-white shadow-[0_4px_12px_-2px_rgba(10,60,117,0.4)]"
                          : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <div className="min-w-0 flex-1 text-left">
                        <div className="truncate">{target.label}</div>
                        {target.breadcrumbs.length > 0 && (
                          <div className="truncate text-[10px] text-white/40 group-hover:text-white/60 transition-colors">
                            {target.breadcrumbs.join(" › ")}
                          </div>
                        )}
                      </div>
                      {target.badge && (
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none shrink-0",
                            target.badgeType === "error"
                              ? "bg-destructive text-white animate-pulse"
                              : target.badgeType === "warning"
                                ? "bg-amber-500 text-white animate-pulse"
                                : "bg-primary text-white",
                          )}
                        >
                          {target.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    );
  }

  return (
    <nav
      ref={navRef}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex-1 overflow-y-auto pb-4 sidebar-scrollbar mt-2",
        isCollapsed ? "px-2" : "px-3",
      )}
    >
      <ul className="space-y-1">
        {TOP_ITEMS.map((item) =>
          item.kind === "leaf" ? (
            <NavLeaf
              key={item.to}
              item={item}
              active={pathname === item.to}
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          ) : (
            <NavInert key={item.label} item={item} isCollapsed={isCollapsed} />
          ),
        )}
      </ul>
      <Separator className="my-3 bg-white/10" />
      <ul className="space-y-1">
        {NAV_GROUPS.map((group) => (
          <NavGroup
            key={group.label}
            group={group}
            pathname={pathname}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  );
}

function SidebarFooter({ isCollapsed }: { isCollapsed: boolean }) {
  const currentUser = mockUsers[0] ?? {
    name: "Amit Mehra",
    role: "Finance Manager",
    email: "amit.mehra@magnertia.com",
  };

  if (isCollapsed) {
    return (
      <div className="border-t border-white/10 px-2 py-3 flex flex-col gap-3 items-center">
        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition-all hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Settings className="h-[18px] w-[18px]" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>

        {/* User Profile Avatar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="h-9 w-9 border border-white/20 bg-white/10 text-white cursor-pointer hover:bg-white/20 transition-all">
              <AvatarFallback className="font-bold text-[13px] bg-primary text-white">
                AM
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-[#06101e] border border-white/10 text-white p-3 rounded-xl shadow-xl z-[60]"
          >
            <div className="font-semibold text-xs text-white">{currentUser.name}</div>
            <div className="text-[10px] text-white/60 mt-0.5">{currentUser.role}</div>
            <div className="text-[10px] text-white/40 mt-1">{currentUser.email}</div>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 px-3 py-3 flex flex-col gap-2">
      <Link
        to="/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/70 transition-all hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Settings className="h-[18px] w-[18px]" />
        <span>Settings</span>
      </Link>

      <div className="flex items-center gap-3 rounded-lg px-2.5 py-2 bg-white/[0.03] border border-white/5 text-white/90 mt-1">
        <Avatar className="h-9 w-9 shrink-0 border border-white/10 bg-white/10 text-white">
          <AvatarFallback className="font-bold text-[13px] bg-primary text-white">
            AM
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-normal">
          <div className="truncate text-xs font-semibold text-white">{currentUser.name}</div>
          <div className="truncate text-[10px] text-white/50">{currentUser.role}</div>
        </div>
      </div>
    </div>
  );
}

function Topbar({
  onMenuClick,
  title,
  breadcrumb,
  description,
  actions,
  tabs,
}: {
  onMenuClick: () => void;
  title: string;
  breadcrumb?: string;
  description?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 pt-4 pb-5 backdrop-blur-md lg:px-8 lg:pt-6">
      <div className="flex items-start gap-3">
        <button
          onClick={onMenuClick}
          className="-ml-1 rounded-lg p-2 text-foreground hover:bg-muted lg:hidden cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          {breadcrumb && (
            <div className="mb-1 flex items-center gap-1.5 text-[13px]">
              <span className="font-medium text-primary">{breadcrumb}</span>
              <span className="text-muted-foreground">›</span>
              <span className="text-muted-foreground">{title}</span>
            </div>
          )}
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-foreground sm:text-[28px]">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground shadow-sm hover:bg-muted/50 cursor-pointer">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {company.fiscalYear.replace("FY ", "Fiscal Year ")}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground shadow-sm hover:bg-muted/50 cursor-pointer">
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            All Companies
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {actions}
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted/50 cursor-pointer"
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

      </div>

      <div className="mt-2 hidden justify-end text-[11px] text-muted-foreground md:flex">
        <span className="inline-flex items-center gap-1.5">
          Last updated: Today, 10:30 AM
          <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: "6s" }} />
        </span>
      </div>

      {tabs && <div className="mt-4 -mb-5">{tabs}</div>}
    </header>
  );
}

export function AppShell({
  children,
  title,
  breadcrumb,
  description,
  topbarActions,
  tabs,
}: {
  children: ReactNode;
  title?: string;
  breadcrumb?: string;
  description?: string;
  topbarActions?: ReactNode;
  tabs?: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("magnertia_sidebar_expanded");
      return saved === "false";
    }
    return false;
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("magnertia_sidebar_expanded", String(!next));
      return next;
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen w-full bg-background">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 hidden flex-col bg-sidebar border-r border-white/5 lg:flex transition-[width] duration-250 ease-in-out",
            isCollapsed ? "w-[72px]" : "w-[280px]",
          )}
        >
          <div
            className={cn(
              "bg-white border-b border-black/10 px-4 py-4 flex items-center transition-all duration-250 ease-in-out",
              isCollapsed ? "flex-col gap-3 justify-center" : "flex-row justify-between",
            )}
          >
            <Brand isCollapsed={isCollapsed} />
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex text-slate-400 hover:text-primary rounded-lg p-1.5 hover:bg-black/5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Search bar inside expanded sidebar or search icon button in collapsed */}
          {!isCollapsed ? (
            <div className="px-3 pt-3 mb-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg bg-white/5 pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 border border-white/10 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-white/40 hover:text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="px-3 pt-3 mb-1 flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setIsCollapsed(false);
                      localStorage.setItem("magnertia_sidebar_expanded", "true");
                      setTimeout(() => {
                        const input = document.querySelector(
                          'input[placeholder="Search..."]',
                        );
                        if (input) (input as HTMLInputElement).focus();
                      }, 100);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/[0.06] hover:text-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Search className="h-[18px] w-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Search navigation</TooltipContent>
              </Tooltip>
            </div>
          )}

          <SidebarNav
            isCollapsed={isCollapsed}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <SidebarFooter isCollapsed={isCollapsed} />
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-sidebar shadow-2xl lg:hidden animate-in slide-in-from-left duration-200 border-r border-white/5">
              <div className="flex items-center justify-between bg-white border-b border-black/10 px-5 pt-5 pb-3">
                <Brand isCollapsed={false} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:text-primary hover:bg-black/5 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarNav
                isCollapsed={false}
                searchQuery=""
                setSearchQuery={() => {}}
                onNavigate={() => setMobileOpen(false)}
              />
              <SidebarFooter isCollapsed={false} />
            </aside>
          </>
        )}

        {/* Main Content Area */}
        <div
          className={cn(
            "transition-[padding-left] duration-250 ease-in-out min-h-screen flex flex-col",
            isCollapsed ? "lg:pl-[72px]" : "lg:pl-[280px]",
          )}
        >
          {title && (
            <Topbar
              onMenuClick={() => setMobileOpen(true)}
              title={title}
              breadcrumb={breadcrumb}
              description={description}
              actions={topbarActions}
              tabs={tabs}
            />
          )}
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-7">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl font-bold text-foreground sm:text-[28px]">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
