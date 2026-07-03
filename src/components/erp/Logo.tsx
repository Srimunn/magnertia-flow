import { cn } from "@/lib/utils";

export function Logo({
  className,
  showShadow = true,
}: {
  className?: string;
  showShadow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-10 shrink-0 select-none", className)}
    >
      <defs>
        {/* Soft 3D-like linear gradient of shades of blue matching the logo */}
        <linearGradient
          id="logo-blue-gradient"
          x1="20"
          y1="20"
          x2="100"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0B4075" />
          <stop offset="50%" stopColor="#082F57" />
          <stop offset="100%" stopColor="#051C36" />
        </linearGradient>

        {/* Shadow for modern premium look */}
        {showShadow && (
          <filter
            id="logo-shadow-filter"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            filterUnits="userSpaceOnUse"
          >
            <feDropShadow
              dx="1"
              dy="3"
              stdDeviation="2.5"
              floodColor="#051C36"
              floodOpacity="0.25"
            />
          </filter>
        )}
      </defs>

      {/* Group translated to center the cursive icon and prevent clipping */}
      <g
        transform="translate(2.4, -7.2)"
        filter={showShadow ? "url(#logo-shadow-filter)" : undefined}
      >
        {/* Continuous cursive logo mark */}
        <path
          d="M 46 38 
             C 41 33, 36 38, 36 45 
             C 36 58, 48 76, 42 85 
             C 39 89, 36 86, 38 78 
             C 42 62, 53 45, 59 34 
             C 61 29, 66 29, 65 36 
             C 64 50, 52 70, 52 82 
             C 52 89, 55 93, 61 95"
          stroke="url(#logo-blue-gradient)"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cursive dots */}
        <circle cx="70" cy="98" r="4.5" fill="#082F57" />
        <circle cx="79" cy="100" r="4.5" fill="#082F57" />
      </g>
    </svg>
  );
}
