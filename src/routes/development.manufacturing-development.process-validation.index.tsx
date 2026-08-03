import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/manufacturing-development/process-validation/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/development/research-innovation/process-validation/new" }); }, [navigate]);
    return null;
  },
});
