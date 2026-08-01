import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/sop-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/sop-development/new",
    });
  },
});
