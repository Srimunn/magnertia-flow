import { type ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  mobileCard,
  empty,
}: {
  columns: Column<T>[];
  data: T[];
  mobileCard: (row: T) => ReactNode;
  empty?: ReactNode;
}) {
  if (data.length === 0) return <>{empty}</>;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                      c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"
                    } ${c.className ?? ""}`}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={(row.id as string) ?? i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3.5 align-middle text-foreground ${
                        c.align === "right" ? "text-right tabular-nums" : c.align === "center" ? "text-center" : "text-left"
                      } ${c.className ?? ""}`}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {data.map((row, i) => (
          <div key={(row.id as string) ?? i} className="card-soft p-4">
            {mobileCard(row)}
          </div>
        ))}
      </div>
    </>
  );
}

export function EmptyState({
  title, description, action,
}: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="card-soft flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-7 w-7">
          <path d="M3 7h18M3 12h18M3 17h12" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
