import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/pilot-production/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/pilot-production/new",
    });
  },
});
