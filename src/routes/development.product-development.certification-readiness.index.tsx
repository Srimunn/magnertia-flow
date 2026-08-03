import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/product-development/certification-readiness/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/development/research-innovation/certification-readiness/new" }); }, [navigate]);
    return null;
  },
});
