import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/development/research-innovation/testing-validation/"
)({
  beforeLoad: () => {
    throw redirect({
      to: "/development/research-innovation/testing-validation/new",
      replace: true,
    });
  },
});
