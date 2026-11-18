function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function newClubId(name: string, seq: number): string {
  return `${slugify(name) || "club"}-${seq}`;
}

export function newInviteCode(name: string, seq: number): string {
  return `${slugify(name).replace(/-/g, "").slice(0, 6).toUpperCase() || "CLUB"}-${100 + seq}`;
}
