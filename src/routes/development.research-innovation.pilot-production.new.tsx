import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/pilot-production/new",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/manufacturing-development/pilot-production/new",
    });
  },
});
