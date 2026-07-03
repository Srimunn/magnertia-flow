# Magnertia ERP Suite — magnertia-flow

Multi-module ERP for Magnertia (EV manufacturing). TanStack Start + React 19 + Tailwind
v4 + shadcn/ui (`new-york` style) + TanStack Query + Recharts, bootstrapped via Lovable.

Full detail lives in [`design-system.md`](design-system.md) and
[`architecture.md`](architecture.md) — read those before touching UI or adding a
service. This file is the short version every session should already know.

## Stack conventions

- **Routing**: TanStack Router, file-based, one file per route in `src/routes/`.
  Route components render `<AppShell title=... breadcrumb=... description=...>`.
- **Styling**: Tailwind v4, CSS-first config — tokens are CSS variables in
  `src/styles.css` under `:root`, re-exposed via `@theme inline`. There is no
  `tailwind.config.js`. Never hardcode a hex color in a component; use the token
  (`bg-primary`, `text-success`, `border-border`, ...). New tokens go in `styles.css`,
  not inline.
- **Components**: shadcn primitives in `src/components/ui/` (generated, don't hand-edit
  — regenerate via `npx shadcn add <component>` if one is missing). Domain/dashboard
  components in `src/components/erp/` (`StatCard`, `CardHeader`, `FilterButton`/
  `FilterSelect`, `PaginationFooter`, `StatusBadge`, `TypeBadge`, `TreeTable`,
  `DataTable`, `AppShell`, `Button`, `Logo`, and the legacy `KpiCard` — see
  design-system.md's Convention A/B note before picking a KPI card component). Two
  `Tabs` visual treatments coexist (underlined page-level vs. shadcn-default panel-level)
  — see design-system.md pattern 8 for which one to use.
- **Data access**: routes call `src/services/*` — never import `src/lib/mock-data.ts`
  directly from a route or component. See `architecture.md` for the full service
  boundary list and the mock/live seam (`services/apiClient.ts`).
- **Data fetching**: TanStack Query (`useQuery` for reads, `useMutation` +
  `queryClient.invalidateQueries` + `toast` from `sonner` for writes — see
  architecture.md's "Write operations" section); `QueryClient` is already provided in
  `src/routes/__root.tsx`, and `<Toaster />` is mounted there too.
- **Formatting helpers**: `formatCurrency` / `formatSignedCurrency` in
  `src/lib/mock-data.ts` (compact `$X.XXM`/`$X.XK` mode via a second `compact: true`
  arg) — reuse these, don't reformat currency ad hoc.
- **Package manager**: `bun.lock` is present but scripts are npm-invoked
  (`.claude/launch.json` runs `npm run dev` on port 3000) — match whichever the user is
  using in a given session rather than assuming.

## Design system — quick reference

Brand palette is **navy blue + beige**, not the violet seen in early mockups (see
`design-system.md` for why). Primary = `#0A3C75`. Status colors are semantic — five
tones now (success/warning/destructive/muted/info), reused via `StatusBadge`'s tone
lookup — don't invent new status colors or fork a page-local badge; add a tone to the
shared lookup if a status genuinely doesn't fit the existing five. Typography is Inter
throughout, no separate mono — numeric alignment comes from the `.tabular` utility
class, not a different font. One card container (`card-soft` utility) for every panel;
one radius scale (`--radius` = 12px base).

Repeated dashboard patterns to reuse rather than reinvent: KPI card (mind the Convention
A/B split, and the 3rd caption variant — colored-no-arrow `captionTone`, above), donut-
chart panel (with centered total + list legend — note aging-bucket colors are
page-scoped, not universal, see design-system.md pattern 4), bar+line combo chart
_or_ its dual-line variant when both series are running totals (Recharts
`ComposedChart`/`LineChart`), donut+table aging summary, the transaction list row
(`DataTable` desktop table/mobile card), the master-detail list + filter toolbar + side
panel pattern (Transactions page) _or_ its Dialog-based sibling when the sidebar column
is already committed to persistent cards (Accounts Payable/Receivable), the expandable
tree table (`TreeTable`, General Ledger's Chart of Accounts) for hierarchical data, and
the Quick Actions icon grid — sidebar card when few actions (AP, 4), full-width footer
bar when more (AR, 6). Full construction details in `design-system.md`.

## Architecture — quick reference

`src/services/` mirrors the backend service boundaries from the sequence diagrams (one
file per boundary — Revenue, Expense, Cash & Bank, General Ledger, Chart of Accounts,
Accounts Receivable, Accounts Payable, Vendor Management, Payment Service, Customer
Management, Receipt & Collection Service, Analytics Engine, Authentication, Transaction,
Approval Workflow, Reporting Engine, ...). Module-scoped domain types (`InvoiceStatus`,
`ReceivableInvoiceStatus`, `AccountStatus`, ...) stay separate per module even when they
overlap — don't widen one into a shared enum just because two modules both have
"invoices" (architecture.md, "Module-scoped status types").

**`financialManagementService.ts` is one shared orchestrator across the whole Financial
Management area**, not one per module — it exports one
function per page (`loadDashboardData()`, `loadTransactionsData()`, ...) and is the only
thing routes call directly. It fans out to domain services in parallel groups that
mirror each diagram's `par`/`alt` fragments, then assembles one response object per
page. When a new module's diagram reuses an existing service boundary (AR, AP, GL,
Authentication, ...), add a function to that existing file — don't create a duplicate.

Mock vs. live data is a single switch in `services/apiClient.ts`
(`VITE_API_MODE=live`), not a per-service flag. Every domain service function calls
`apiRequest(realEndpointPath, mockResolver)` — the mock resolver reads from
`mock-data.ts` today; swapping to live later touches zero call sites.

Different diagrams sometimes use different names for the same responsibility (e.g.
"Reporting Engine" vs. "Reporting Service") — match by responsibility, not label, and
reuse the existing service file; see architecture.md's "Service naming drift" note.
If two modules' mockups disagree on a number — or even an entity's identity, like the
same invoice number/company appearing as both an AR and an AP record — that should be
the same real-world fact, don't silently force them to match. Keep independent mock
constants/datasets and note the discrepancy (architecture.md, "When two mockups
disagree"). And not every mockup button has a backend flow: build what the diagram
defines (Accounts Payable's Create Invoice/Record Payment/Approve all had explicit
diagram steps, so they're fully functional), stub what it doesn't (architecture.md,
"Stub vs. build") — check each module's diagram independently rather than copying the
previous module's stub/build choices.

When adding a new module (Budgeting, Tax Management, Fixed Assets, ...): get its
sequence diagram, extract the service boundaries the same way, add the corresponding
`services/*Service.ts` files plus one orchestrator, and wire the route through
`useQuery` — don't import `mock-data.ts` directly.
