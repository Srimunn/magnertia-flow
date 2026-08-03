import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/development/manufacturing-development/robotics-integration/")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => { navigate({ to: "/manufacturing-development/robotics-integration" }); }, [navigate]);
    return null;
  },
});
