import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/work-instruction-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/work-instruction-development/new",
    });
  },
});
