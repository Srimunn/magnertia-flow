import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/pfmea-development/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/pfmea-development/new",
    });
  },
});
