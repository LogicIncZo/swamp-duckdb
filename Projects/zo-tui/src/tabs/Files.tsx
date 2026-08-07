// Files tab — interactive file/project navigator.

import { useEffect, useState, useCallback, useMemo } from "react";
import { useKeyboard } from "@opentui/react";
import { theme } from "../lib/theme";
import { fetchDir, type FileEntry } from "../lib/sources";

function formatSize(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}K`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)}M`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)}G`;
}

export function FilesTab({ refreshTick }: { refreshTick: number }) {
  const [cwd, setCwd] = useState("");
  const [stack, setStack] = useState<string[]>([""]); // breadcrumb stack
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);

  const refresh = useCallback(async () => {
    const { entries: e, error: err } = await fetchDir(cwd);
    setEntries(e);
    setError(err ?? null);
    setSelected((s) => Math.min(s, Math.max(0, e.length - 1)));
  }, [cwd]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshTick]);

  useKeyboard((evt) => {
    if (evt.name === "down" || evt.name === "j") {
      setSelected((s) => Math.min(entries.length - 1, s + 1));
    } else if (evt.name === "up" || evt.name === "k") {
      setSelected((s) => Math.max(0, s - 1));
    } else if (evt.name === "right" || evt.name === "l" || evt.name === "return") {
      const e = entries[selected];
      if (e?.isDir) {
        const next = e.path;
        setCwd(next);
        setStack((st) => [...st, next]);
        setSelected(0);
      }
    } else if (evt.name === "left" || evt.name === "h" || evt.name === "backspace") {
      if (stack.length > 1) {
        const next = stack[stack.length - 2];
        setStack((st) => st.slice(0, -1));
        setCwd(next);
        setSelected(0);
      }
    }
  });

  const breadcrumb = useMemo(() => {
    if (stack.length === 0) return "/home/workspace";
    return "/home/workspace/" + stack[stack.length - 1];
  }, [stack]);

  return (
    <box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1} border borderColor={theme.border}>
      <box flexDirection="row" justifyContent="space-between">
        <text fg={theme.fg}>
          <b>FILES</b>{" "}
          <span fg={theme.fgMuted}>{breadcrumb}</span>
        </text>
        <text fg={theme.fgMuted}>{entries.length} entries</text>
      </box>

      <box flexDirection="column" paddingY={1}>
        {error && <text fg={theme.err}>error: {error}</text>}
        {entries.length === 0 && !error && <text fg={theme.fgMuted}>empty</text>}
        {entries.map((e, i) => {
          const isSel = i === selected;
          return (
            <box key={e.path} flexDirection="row" backgroundColor={isSel ? theme.surfaceAlt : undefined}>
              <text>
                <span fg={isSel ? theme.accent : theme.fgDim}>{isSel ? "▸ " : "  "}</span>
                <span fg={e.isDir ? theme.info : theme.fg}>{e.isDir ? "▸ " : "  "}{e.name}{e.isDir ? "/" : ""}</span>
                <span fg={theme.fgDim}>{"    "}{formatSize(e.size)}</span>
              </text>
            </box>
          );
        })}
      </box>

      <box flexDirection="row" gap={2} paddingTop={1}>
        <text fg={theme.fgMuted}>
          <span fg={theme.accent}>←/h</span> back{"  "}
          <span fg={theme.accent}>→/l</span> open{"  "}
          <span fg={theme.accent}>↑↓/jk</span> move{"  "}
          <span fg={theme.accent}>r</span> refresh
        </text>
      </box>
    </box>
  );
}
