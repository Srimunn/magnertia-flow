import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const TAB_BASE =
  "shrink-0 whitespace-nowrap rounded-none border-b-2 border-transparent bg-transparent px-0.5 pb-3 text-[13px] font-semibold text-muted-foreground shadow-none transition-colors hover:text-foreground focus-visible:outline-none";
const TAB_ACTIVE = "border-primary text-primary hover:text-primary";

const TABS = [
  { to: "/administration/home/overview", label: "Overview" },
  { to: "/administration/home/companies", label: "Companies" },
  { to: "/administration/home/branches", label: "Branches" },
  { to: "/administration/home/departments", label: "Departments" },
  { to: "/administration/home/roles", label: "Roles" },
  { to: "/administration/home/users", label: "Users" },
];

export function AdminHomeTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex items-center gap-6 overflow-x-auto">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.to);
        return (
          <Link key={tab.to} to={tab.to} className={cn(TAB_BASE, active && TAB_ACTIVE)}>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
