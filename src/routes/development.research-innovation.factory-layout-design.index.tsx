import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/factory-layout-design/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/factory-layout-design/new",
    });
  },
});
