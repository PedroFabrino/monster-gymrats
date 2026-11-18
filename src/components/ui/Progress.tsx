import type { ReactNode } from "react";

export function ProgressRing({
  pct,
  size = 132,
  stroke = 10,
  color = "#95D600",
  children,
}: {
  readonly pct: number;
  readonly size?: number;
  readonly stroke?: number;
  readonly color?: string;
  readonly children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#262B36"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)",
            filter: `drop-shadow(0 0 6px ${color}88)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({
  pct,
  color = "#95D600",
  className = "h-1.5",
}: {
  readonly pct: number;
  readonly color?: string;
  readonly className?: string;
}) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-hairline ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }}
      />
    </div>
  );
}
