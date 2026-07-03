import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TreeColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  cell: (row: T, depth: number) => ReactNode;
  className?: string;
};

// Expandable hierarchy table (Chart of Accounts, and future modules with
// tree-shaped data like Cost Centers or Consolidation entities). Built on
// plain local state rather than Radix Collapsible — Collapsible wraps its
// content in a div, which doesn't nest cleanly inside a <table>/<tbody>, and
// a Set of collapsed ids is all expand/collapse actually needs here.
export function TreeTable<T>({
  columns,
  data,
  getId,
  getChildren,
  selectedId,
  onSelectRow,
  expandColumnKey,
}: {
  columns: TreeColumn<T>[];
  data: T[];
  getId: (row: T) => string;
  getChildren: (row: T) => T[] | undefined;
  selectedId?: string | null;
  onSelectRow?: (row: T) => void;
  expandColumnKey: string;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderRows(nodes: T[], depth: number): ReactNode[] {
    return nodes.flatMap((node) => {
      const id = getId(node);
      const children = getChildren(node);
      const hasChildren = !!children && children.length > 0;
      const isCollapsed = collapsed.has(id);

      const row = (
        <tr
          key={id}
          onClick={() => onSelectRow?.(node)}
          className={cn(
            "cursor-pointer transition-colors hover:bg-secondary/30",
            selectedId === id && "bg-secondary/50",
          )}
        >
          {columns.map((col) => (
            <td
              key={col.key}
              className={cn(
                "px-3 py-2.5",
                col.align === "right"
                  ? "text-right"
                  : col.align === "center"
                    ? "text-center"
                    : "text-left",
                col.className,
              )}
            >
              {col.key === expandColumnKey ? (
                <div className="flex items-center gap-1.5" style={{ paddingLeft: depth * 20 }}>
                  {hasChildren ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(id);
                      }}
                      className="grid h-5 w-5 shrink-0 place-items-center rounded hover:bg-muted"
                      aria-label={isCollapsed ? "Expand" : "Collapse"}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  ) : (
                    <span className="h-5 w-5 shrink-0" />
                  )}
                  {col.cell(node, depth)}
                </div>
              ) : (
                col.cell(node, depth)
              )}
            </td>
          ))}
        </tr>
      );

      const childRows = hasChildren && !isCollapsed ? renderRows(children!, depth + 1) : [];
      return [row, ...childRows];
    });
  }

  return (
    <table className="w-full text-[12.5px]">
      <thead>
        <tr className="border-b border-border bg-secondary/40 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {columns.map((col) => (
            <th
              key={col.key}
              className={cn(
                "px-3 py-3",
                col.align === "right"
                  ? "text-right"
                  : col.align === "center"
                    ? "text-center"
                    : "text-left",
              )}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">{renderRows(data, 0)}</tbody>
    </table>
  );
}
