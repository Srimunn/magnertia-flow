import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/ui-ux-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/ui-ux-development/new",
    });
  },
});
