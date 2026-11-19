import type { PhotoScene } from "@/types/domain";

interface CanArtProps {
  readonly color: string;
  readonly accent: string;
  readonly className?: string;
  readonly locked?: boolean;
  readonly dim?: boolean;
}

function CanGradient({ id, locked }: { readonly id: string; readonly locked: boolean }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" x2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.45" />
        <stop offset="0.35" stopColor="#fff" stopOpacity={locked ? 0.02 : 0.28} />
        <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.5" />
      </linearGradient>
    </defs>
  );
}

export function CanArt({
  color,
  accent,
  className = "",
  locked = false,
  dim = false,
}: CanArtProps) {
  const body = locked ? "#1A1D24" : color;
  const mark = locked ? "#262B36" : accent;
  const gid = `g-${color.slice(1)}-${accent.slice(1)}-${locked ? "l" : "u"}`;
  return (
    <svg
      viewBox="0 0 64 120"
      className={`${className} ${dim ? "opacity-60 brightness-75" : ""}`}
      aria-hidden="true"
    >
      <CanGradient id={gid} locked={locked} />
      <rect x="10" y="4" width="44" height="8" rx="3" fill={locked ? "#22262F" : "#C9CED8"} />
      <path
        d="M8 14 Q8 10 12 10 H52 Q56 10 56 14 V106 Q56 112 50 114 H14 Q8 112 8 106 Z"
        fill={body}
      />
      <path
        d="M20 30 L23 52 L19 58 L24 86 M31 28 L34 50 L30 57 L35 88 M42 30 L45 52 L41 58 L46 86"
        stroke={mark}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 14 Q8 10 12 10 H52 Q56 10 56 14 V106 Q56 112 50 114 H14 Q8 112 8 106 Z"
        fill={`url(#${gid})`}
      />
      <rect x="8" y="96" width="48" height="2" fill="#000" opacity="0.25" />
    </svg>
  );
}

const SCENE_BG: Readonly<Record<PhotoScene, string>> = {
  studio: "radial-gradient(70% 60% at 50% 40%, #2A303C 0%, #13161C 70%)",
  dark: "radial-gradient(50% 40% at 50% 55%, #15181E 0%, #050608 80%)",
  desk: "linear-gradient(180deg, #1E2129 0%, #1E2129 58%, #4A3424 58%, #2E2018 100%)",
  shelf: "linear-gradient(180deg, #1B1F27 0%, #252A34 100%)",
  car: "linear-gradient(180deg, #0F2233 0%, #1B2533 45%, #101318 46%, #181B21 100%)",
  gym: "linear-gradient(160deg, #20242C 0%, #0E1013 100%)",
};

const SHELF_COLORS = ["#F97316", "#38BDF8", "#FACC15", "#EF4444", "#22C55E", "#E2E8F0", "#FB7185"];

function ShelfRows({ withCans }: { readonly withCans: boolean }) {
  return (
    <div className="absolute inset-x-3 inset-y-4 flex flex-col justify-between">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-end gap-1.5 border-b-4 border-[#3A404C] pb-0.5">
          {SHELF_COLORS.map((c, i) =>
            withCans ? (
              <CanArt
                key={i}
                color={SHELF_COLORS[(i + row) % SHELF_COLORS.length] ?? c}
                accent="#0A0B0E"
                className="h-12 w-6"
              />
            ) : (
              <div
                key={i}
                className="h-10 flex-1 rounded-sm opacity-70"
                style={{ background: SHELF_COLORS[(i + row * 2) % SHELF_COLORS.length] }}
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

interface CanPhotoProps {
  readonly scene: PhotoScene;
  readonly color: string | null;
  readonly accent: string;
  readonly className?: string;
  readonly voided?: boolean;
}

export function CanPhoto({ scene, color, accent, className = "", voided = false }: CanPhotoProps) {
  const showShelf = scene === "shelf";
  return (
    <div
      className={`relative overflow-hidden ${className} ${voided ? "grayscale" : ""}`}
      style={{ background: SCENE_BG[scene] }}
    >
      {showShelf && <ShelfRows withCans={color !== null} />}
      {!showShelf && color !== null && (
        <>
          <div
            className="absolute left-1/2 top-[62%] h-24 w-32 -translate-x-1/2 rounded-full blur-2xl"
            style={{ background: color, opacity: scene === "dark" ? 0.12 : 0.28 }}
          />
          <CanArt
            color={color}
            accent={accent}
            dim={scene === "dark"}
            className="absolute left-1/2 top-1/2 h-[72%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_18px_24px_rgba(0,0,0,0.6)]"
          />
        </>
      )}
      {scene === "desk" && (
        <div className="absolute bottom-[10%] left-[12%] h-3 w-16 rounded-full bg-black/40 blur-sm" />
      )}
    </div>
  );
}
