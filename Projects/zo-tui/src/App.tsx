// App shell: tabbed layout with header tabs, body, and footer keybinds.

import { useEffect, useState, useCallback } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { theme } from "./lib/theme";
import { OpsTab } from "./tabs/Ops";
import { FilesTab } from "./tabs/Files";
import { AutomationsTab } from "./tabs/Automations";
import { ChatTab } from "./tabs/Chat";
import { MCP } from "./tabs/MCP";
import { ModelsTab } from "./tabs/Models";
import { fetchStats } from "./lib/sources";

type TabId = "ops" | "files" | "automations" | "chat" | "mcp" | "models";

const TABS: { id: TabId; label: string; key: string }[] = [
  { id: "ops", label: "Ops", key: "1" },
  { id: "files", label: "Files", key: "2" },
  { id: "automations", label: "Automations", key: "3" },
  { id: "chat", label: "Chat", key: "4" },
  { id: "mcp", label: "MCP", key: "5" },
  { id: "models", label: "Models", key: "6" },
];

function formatBytes(b: number): string {
  if (b === 0) return "0B";
  const units = ["B", "K", "M", "G", "T"];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(1)}${units[i]}`;
}

export function App() {
  const [tab, setTab] = useState<TabId>("ops");
  const [refreshTick, setRefreshTick] = useState(0);
  const [clock, setClock] = useState("");
  const [loadStr, setLoadStr] = useState("—");
  const { width, height } = useTerminalDimensions();

  // Global refresh
  const refreshAll = useCallback(() => setRefreshTick((n) => n + 1), []);

  // Clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Lightweight loadavg in the status bar
  useEffect(() => {
    let alive = true;
    const update = async () => {
      const s = await fetchStats();
      if (alive) setLoadStr(s.loadavg.map((n) => n.toFixed(2)).join(" "));
    };
    update();
    const id = setInterval(update, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [refreshTick]);

  useKeyboard((evt) => {
    if (evt.name === "tab") {
      const idx = TABS.findIndex((t) => t.id === tab);
      setTab(TABS[(idx + 1) % TABS.length].id);
    } else if (["1", "2", "3", "4", "5", "6"].includes(evt.name)) {
      const t = TABS.find((t) => t.key === evt.name);
      if (t) setTab(t.id);
    } else if (evt.name === "q" && evt.ctrl) {
      process.exit(0);
    } else if (evt.name === "r" && !evt.ctrl && !evt.meta) {
      refreshAll();
    }
  });

  return (
    <box flexDirection="column" width={width} height={height} backgroundColor={theme.bg}>
      {/* Header / brand */}
      <box flexDirection="row" justifyContent="space-between" paddingX={1} paddingY={0} backgroundColor={theme.surface}>
        <text fg={theme.accent}>
          <b>Z</b>
          <span fg={theme.fg}>O</span>
          <span fg={theme.fgMuted}> · TUI v0.1</span>
        </text>
        <text fg={theme.fgMuted}>
          load <span fg={theme.info}>{loadStr}</span> · {clock} · {width}×{height}
        </text>
      </box>

      {/* Tab bar */}
      <box flexDirection="row" paddingX={1} paddingY={0} gap={1} backgroundColor={theme.surface}>
        {TABS.map((t, i) => {
          const active = tab === t.id;
          return (
            <box
              key={t.id}
              paddingX={1}
              backgroundColor={active ? theme.tabActive : theme.tabInactive}
            >
              <text>
                <span fg={active ? theme.bg : theme.fgMuted}>
                  <b>[{t.key}]</b> {t.label}
                </span>
              </text>
            </box>
          );
        })}
      </box>

      {/* Body */}
      <box flexDirection="column" flexGrow={1}>
        {tab === "ops" && <OpsTab refreshTick={refreshTick} />}
        {tab === "files" && <FilesTab refreshTick={refreshTick} />}
        {tab === "automations" && <AutomationsTab refreshTick={refreshTick} />}
        {tab === "chat" && <ChatTab />}
        {tab === "mcp" && <MCP />}
        {tab === "models" && <ModelsTab refreshTick={refreshTick} />}
      </box>

      {/* Footer */}
      <box flexDirection="row" justifyContent="space-between" paddingX={1} backgroundColor={theme.surface}>
        <text fg={theme.fgMuted}>
          | <span fg={theme.accent}>tab/1-6</span> switch · <span fg={theme.accent}>r</span> refresh · <span fg={theme.accent}>ctrl-c</span> quit
        </text>
        <text fg={theme.fgMuted}>cashlessconsumer.zo.computer</text>
      </box>
    </box>
  );
}
