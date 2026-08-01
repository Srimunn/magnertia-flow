import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/production-engineering/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/production-engineering/new",
    });
  },
});
