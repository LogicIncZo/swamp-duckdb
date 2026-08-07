// Models tab — available models + personas from the Zo public API via the
// `zocomputer` SDK (generated nightly from the OpenAPI spec).
//
// Sections:
//   1. Available models (with free/subscribers tier + BYOK + context window)
//   2. Personas (name → model → prompt)

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useKeyboard } from "@opentui/react";
import { theme } from "../lib/theme";
import { pad } from "../lib/format";
import { loadAvailable, loadCatalog } from "../lib/zo-client";
import type { ZoModelInfo, ZoPersonaInfo } from "zocomputer";

function tierColor(t: ZoModelInfo["type"]): string {
  if (t === "free") return theme.ok;
  if (t === "subscribers") return theme.warn;
  return theme.fgMuted;
}

function tierGlyph(t: ZoModelInfo["type"]): string {
  if (t === "free") return "●";
  if (t === "subscribers") return "◐";
  return "·";
}

function fmtCtx(n: number | null | undefined): string {
  if (!n) return "—";
  const k = n / 1000;
  return k >= 1000 ? `${(k / 1000).toFixed(1)}M` : `${Math.round(k)}K`;
}

export function ModelsTab({ refreshTick }: { refreshTick: number }) {
  const [models, setModels] = useState<ZoModelInfo[]>([]);
  const [personas, setPersonas] = useState<ZoPersonaInfo[]>([]);
  const [deprecated, setDeprecated] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setLoaded(false);
    const [avail, cat] = await Promise.all([
      loadAvailable(),
      loadCatalog().catch(() => ({ catalog: null, error: undefined })),
    ]);
    setModels(avail.models);
    setPersonas(avail.personas);
    const depr = new Set<string>();
    for (const [id, v] of Object.entries(cat.catalog?.deprecation_map ?? {})) {
      if (v) depr.add(id);
    }
    setDeprecated(depr);
    setError(avail.models.length === 0 && avail.personas.length === 0 ? "No models or personas returned" : null);
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshTick]);

  // Keep selection within bounds
  useEffect(() => {
    const total = models.length + personas.length;
    if (selected > total - 1 && total > 0) setSelected(total - 1);
  }, [models.length, personas.length, selected]);

  useKeyboard((evt) => {
    if (evt.name === "down" || evt.name === "j") {
      setSelected((s) => Math.min(models.length + personas.length - 1, s + 1));
    } else if (evt.name === "up" || evt.name === "k") {
      setSelected((s) => Math.max(0, s - 1));
    }
  });

  if (!loaded) {
    return (
      <box flexDirection="column" paddingX={1} paddingY={1}>
        <text fg={theme.fgMuted}>loading models + personas…</text>
      </box>
    );
  }

  let idx = -1;
  const rows: ReactNode[] = [];

  rows.push(
    <text key="mt" fg={theme.accent}>
      <b>Available models</b> ({models.length})
    </text>,
  );
  rows.push(
    <text key="mh" fg={theme.fgDim}>
      {pad("MODEL", 34)} {pad("TIER", 11)} {pad("CTX", 6)} vendor
    </text>,
  );

  for (const m of models) {
    idx += 1;
    const active = idx === selected;
    const badge = deprecated.has(m.model_name) ? " dep" : "";
    const fg = active ? theme.bg : theme.fg;
    const mutedFg = active ? theme.bg : theme.fgDim;
    rows.push(
      <box key={m.model_name} flexDirection="row" backgroundColor={active ? theme.borderActive : undefined}>
        <text fg={tierColor(m.type)}>{tierGlyph(m.type)} </text>
        <text fg={fg}>{pad(m.label || m.model_name, 32)} </text>
        <text fg={mutedFg}>{pad(m.type ?? "—", 11)} </text>
        <text fg={mutedFg}>{pad(fmtCtx(m.context_window), 6)} </text>
        <text fg={fg}>{m.vendor}</text>
        {m.is_byok && <text fg={theme.warn}> [BYOK]</text>}
        {badge && <text fg={theme.err}>{badge}</text>}
      </box>,
    );
  }

  rows.push(<box key="gap1" height={1} />);
  rows.push(
    <text key="pt" fg={theme.accent}>
      <b>Personas</b> ({personas.length})
    </text>,
  );

  for (const p of personas) {
    idx += 1;
    const active = idx === selected;
    const fg = active ? theme.bg : theme.fg;
    rows.push(
      <box key={p.id} flexDirection="row" backgroundColor={active ? theme.borderActive : undefined}>
        <text fg={theme.accent2}>◆ </text>
        <text fg={fg}>{pad(p.name, 24)} </text>
        <text fg={active ? theme.bg : theme.fgMuted}>{p.model ?? "system default"}</text>
      </box>,
    );
  }

  if (idx === -1) {
    rows.push(
      <text key="empty" fg={theme.fgMuted}>
        nothing here yet — check your auth token
      </text>,
    );
  }

  return (
    <box flexDirection="column" flexGrow={1} paddingX={1}>
      {rows}
      {error && (
        <text fg={theme.err} paddingY={1}>
          ⚠ {error} — set ZO_API_KEY or run on the Zo box
        </text>
      )}
      <text fg={theme.fgDim} paddingY={1}>
        j/k navigate · r refresh
      </text>
    </box>
  );
}