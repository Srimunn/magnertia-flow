import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/development/research-innovation/iot-development/"
)({
  component: IotIndexPage,
});

function IotIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/development/research-innovation/iot-development/new" as any });
  }, [navigate]);

  return (
    <div className="p-8 text-center text-muted-foreground">
      Redirecting to IoT Development Form...
    </div>
  );
}
