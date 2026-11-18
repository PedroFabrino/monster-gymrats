import type { Member } from "@/types/domain";

interface AvatarProps {
  readonly member: Pick<Member, "displayName" | "avatarColor">;
  readonly size?: "xs" | "sm" | "md" | "lg" | "xl";
  readonly ring?: boolean;
}

const SIZE: Readonly<Record<NonNullable<AvatarProps["size"]>, string>> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

export function Avatar({ member, size = "md", ring = false }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold uppercase text-void ${SIZE[size]} ${ring ? "ring-2 ring-carbon" : ""}`}
      style={{
        background: `linear-gradient(140deg, ${member.avatarColor}, ${member.avatarColor}99)`,
      }}
      aria-label={member.displayName}
    >
      {member.displayName.slice(0, 2)}
    </span>
  );
}

export function AvatarStack({
  members,
  max = 5,
}: {
  readonly members: readonly Member[];
  readonly max?: number;
}) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((m) => (
        <Avatar key={m.id} member={m} size="xs" ring />
      ))}
      {extra > 0 && (
        <span className="metric inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-graphite px-1.5 text-[10px] text-ink-muted ring-2 ring-carbon">
          +{extra}
        </span>
      )}
    </div>
  );
}
