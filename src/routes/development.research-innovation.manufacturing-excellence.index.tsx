import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/manufacturing-excellence/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/manufacturing-excellence/new",
    });
  },
});
