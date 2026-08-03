import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/manufacturing-development/automation-development/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/manufacturing-development/automation-development" }); }, [navigate]);
    return null;
  },
});
