import { UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetRole } from "../types";

/* ===========================================================================
   Role switcher
   ---------------------------------------------------------------------------
   There is no auth system yet, so the active role is simulated and stored on
   the preferences document. Every consumer reads `prefs.role`; when real auth
   lands, only the source of that value changes — the access-control logic in
   the registry and the library stays as-is.
   =========================================================================== */

const ROLES: WidgetRole[] = ["CEO", "Finance", "Accountant", "Auditor", "Operations"];

export type RoleSwitcherProps = {
  role: WidgetRole;
  onChange: (role: WidgetRole) => void;
  className?: string;
};

export function RoleSwitcher({ role, onChange, className }: RoleSwitcherProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5 text-[12px] font-medium text-muted-foreground",
        className,
      )}
      title="Widgets are filtered to what this role may see"
    >
      <UserCog className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">Viewing as</span>
      <select
        value={role}
        onChange={(e) => onChange(e.target.value as WidgetRole)}
        className="cursor-pointer bg-transparent font-semibold text-foreground focus:outline-none"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}
