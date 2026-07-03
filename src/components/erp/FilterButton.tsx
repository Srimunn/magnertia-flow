import { ChevronDown } from "lucide-react";

// Decorative dropdown-look trigger (no built-in state) — used where a
// filter/period control is shown but not yet wired to real options
// (e.g. Dashboard's "Monthly" / "YTD" chart period toggles).
export function FilterButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[12px] font-medium text-foreground hover:bg-muted/50"
    >
      {label}
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}

// Functional counterpart backed by a real <select> — used for actual
// filter controls (e.g. Transactions' Date Range / Type / Status filters).
export function FilterSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center ${className ?? ""}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border border-border bg-card py-2 pl-3 pr-7 text-[13px] font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}
