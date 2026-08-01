import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/bom-engineering/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/bom-engineering/new",
    });
  },
});
