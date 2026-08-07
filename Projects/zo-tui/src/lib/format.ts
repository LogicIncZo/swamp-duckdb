// Format helpers used across tabs.

export function relativeTime(iso: string | number | Date | null | undefined): string {
  if (!iso) return "—";
  const t = typeof iso === "string" || typeof iso === "number" ? new Date(iso) : iso;
  const diff = Date.now() - t.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function pad(s: string, n: number, align: "left" | "right" = "left"): string {
  const trimmed = s.length > n ? s.slice(0, Math.max(0, n - 1)) + "…" : s;
  const space = Math.max(0, n - trimmed.length);
  return align === "left" ? trimmed + " ".repeat(space) : " ".repeat(space) + trimmed;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
