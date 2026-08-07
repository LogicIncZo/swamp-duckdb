// Automations tab — list of scheduled agents with their rrules and status.

import { useEffect, useState, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import { theme } from "../lib/theme";
import { pad } from "../lib/format";
import { fetchAutomations, type Automation } from "../lib/sources";

function activeLabel(a: Automation): string {
  if (!a.active) return "○ paused";
  return "● active";
}

function activeColor(a: Automation): string {
  return a.active ? theme.ok : theme.fgDim;
}

export function AutomationsTab({ refreshTick }: { refreshTick: number }) {
  const [items, setItems] = useState<Automation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const refresh = useCallback(async () => {
    const { automations, error: err } = await fetchAutomations();
    setItems(automations);
    setError(err ?? null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshTick]);

  useKeyboard((evt) => {
    if (evt.name === "down" || evt.name === "j") {
      setSelected((s) => Math.min(items.length - 1, s + 1));
    } else if (evt.name === "up" || evt.name === "k") {
      setSelected((s) => Math.max(0, s - 1));
    } else if (evt.name === "f") {
      setShowAll((v) => !v);
    }
  });

  const visible = showAll ? items : items.filter((a) => a.active);
  const sel = visible[Math.min(selected, Math.max(0, visible.length - 1))];

  return (
    <box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1} border borderColor={theme.border}>
      <box flexDirection="row" justifyContent="space-between">
        <text fg={theme.fg}>
          <b>AUTOMATIONS</b>{" "}
          <span fg={theme.fgMuted}>
            ({visible.length}{showAll ? "" : " active"} of {items.length})
          </span>
        </text>
        <text fg={theme.fgMuted}>
          press <span fg={theme.accent}>f</span> to {showAll ? "hide" : "show"} paused
        </text>
      </box>

      <box flexDirection="row" paddingY={1}>
        <text fg={theme.fgDim}>
          {pad("", 2)}{pad("TITLE", 36)}{pad("STATUS", 12)}{pad("DELIVERY", 12)}{"SCHEDULE"}
        </text>
      </box>
      {error && <text fg={theme.err}>error: {error}</text>}
      {visible.length === 0 && !error && <text fg={theme.fgMuted}>none</text>}
      {visible.map((a, i) => {
        const isSel = i === selected;
        return (
          <box key={`${a.id}-${a.source}`} flexDirection="row" backgroundColor={isSel ? theme.surfaceAlt : undefined}>
            <text>
              <span fg={isSel ? theme.accent : theme.fgDim}>{isSel ? "▸ " : "  "}</span>
              <span fg={isSel ? theme.fg : theme.fg}>{pad(a.title || "(untitled)", 36)}</span>
              <span fg={activeColor(a)}>{pad(activeLabel(a), 12)}</span>
              <span fg={theme.fgMuted}>{pad(a.delivery || "—", 12)}</span>
              <span fg={theme.fgMuted}>{a.rrule}</span>
            </text>
          </box>
        );
      })}

      {sel && (
        <box flexDirection="column" paddingTop={1} borderColor={theme.border} border>
          <text fg={theme.fg}>
            <b>INSTRUCTION</b>
          </text>
          <text fg={theme.fgMuted}>
            {sel.instruction.length > 400 ? sel.instruction.slice(0, 400) + "…" : sel.instruction}
          </text>
          <text fg={theme.fgDim}>
            id: {sel.id} · model: {sel.model || "default"} · src: {sel.source.replace("/home/workspace/", "")}
          </text>
        </box>
      )}
    </box>
  );
}
