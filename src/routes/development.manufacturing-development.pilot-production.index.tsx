import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/manufacturing-development/pilot-production/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/manufacturing-development/pilot-production" }); }, [navigate]);
    return null;
  },
});
