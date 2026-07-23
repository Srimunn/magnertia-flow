import { getAccountsTreeFn, createAccountFn, updateAccountFn } from "@/lib/generalLedgerFns.server";
import type { AccountFilters, AccountNode, DashboardQuery, NewAccountInput } from "./types";

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

// Shared by the mock (`queryAccounts`) and live (`queryAccountsLive`) paths so
// both filter identically.
export function filterAccountTree(nodes: AccountNode[], filters: AccountFilters): AccountNode[] {
  if (filters.level !== "All Levels") {
    const flat: AccountNode[] = [];
    const walk = (list: AccountNode[], depth: number) => {
      for (const node of list) {
        if (String(depth) === filters.level && matchesFilters(node, filters)) {
          flat.push({ ...node, children: undefined });
        }
        if (node.children) walk(node.children, depth + 1);
      }
    };
    walk(nodes, 1);
    return flat;
  }

  const hasActiveFilter =
    filters.search.trim() !== "" ||
    filters.type !== "All Types" ||
    filters.status !== "All Statuses";
  if (!hasActiveFilter) return nodes;

  // Keep a node's whole subtree if it matches; otherwise keep it only as
  // scaffolding for a matching descendant.
  const prune = (list: AccountNode[]): AccountNode[] =>
    list.flatMap((node) => {
      const prunedChildren = node.children ? prune(node.children) : undefined;
      if (matchesFilters(node, filters)) return [node];
      if (prunedChildren && prunedChildren.length > 0)
        return [{ ...node, children: prunedChildren }];
      return [];
    });

  return prune(nodes);
}

export async function queryAccounts(
  query: DashboardQuery,
  filters: AccountFilters,
): Promise<AccountNode[]> {
  return queryAccountsLive(filters);
}

// Live, Postgres-backed Chart of Accounts (General Ledger module).
export async function fetchAccountsTree(): Promise<AccountNode[]> {
  const res = await getAccountsTreeFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data || res;
}

export async function queryAccountsLive(filters: AccountFilters): Promise<AccountNode[]> {
  const tree = await fetchAccountsTree();
  return filterAccountTree(tree, filters);
}

export async function createAccount(input: NewAccountInput): Promise<AccountNode> {
  const res = await createAccountFn({ data: input });
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data || res;
}

export async function updateAccount(
  code: string,
  patch: Partial<NewAccountInput>,
): Promise<AccountNode> {
  const res = await updateAccountFn({ data: { code, patch } });
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return res.data || res;
}
