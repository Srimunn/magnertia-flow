import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/certification-readiness/"
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/certification-readiness/new",
      replace: true,
    });
  },
});
