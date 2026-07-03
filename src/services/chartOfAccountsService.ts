import { apiRequest } from "./apiClient";
import { chartOfAccounts } from "@/lib/mock-data";
import type { AccountFilters, AccountNode, DashboardQuery } from "./types";

function matchesFilters(node: AccountNode, filters: AccountFilters): boolean {
  if (filters.type !== "All Types" && node.type !== filters.type) return false;
  if (filters.status !== "All Statuses" && node.status !== filters.status) return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    if (!node.code.toLowerCase().includes(needle) && !node.name.toLowerCase().includes(needle)) {
      return false;
    }
  }
  return true;
}

export function queryAccounts(
  query: DashboardQuery,
  filters: AccountFilters,
): Promise<AccountNode[]> {
  return apiRequest(
    `/api/financial/chart-of-accounts?fy=${query.fiscalYear}&company=${query.companyId}` +
      `&type=${filters.type}&status=${filters.status}&level=${filters.level}&q=${encodeURIComponent(filters.search)}`,
    () => {
      // Level filter flattens to accounts at that exact depth (no children).
      if (filters.level !== "All Levels") {
        const flat: AccountNode[] = [];
        const walk = (nodes: AccountNode[], depth: number) => {
          for (const node of nodes) {
            if (String(depth) === filters.level && matchesFilters(node, filters)) {
              flat.push({ ...node, children: undefined });
            }
            if (node.children) walk(node.children, depth + 1);
          }
        };
        walk(chartOfAccounts, 1);
        return flat;
      }

      const hasActiveFilter =
        filters.search.trim() !== "" ||
        filters.type !== "All Types" ||
        filters.status !== "All Statuses";
      if (!hasActiveFilter) return chartOfAccounts;

      // Keep a node's whole subtree if it matches; otherwise keep it only as
      // scaffolding for a matching descendant.
      const prune = (nodes: AccountNode[]): AccountNode[] =>
        nodes.flatMap((node) => {
          const prunedChildren = node.children ? prune(node.children) : undefined;
          if (matchesFilters(node, filters)) return [node];
          if (prunedChildren && prunedChildren.length > 0)
            return [{ ...node, children: prunedChildren }];
          return [];
        });

      return prune(chartOfAccounts);
    },
  );
}
