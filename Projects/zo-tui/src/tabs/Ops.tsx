// Ops tab — services + computer stats + log tail.

import { useEffect, useState, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import { theme } from "../lib/theme";
import { pad, relativeTime } from "../lib/format";
import {
  fetchServices,
  fetchStats,
  tailLog,
  type Service,
  type ServiceStatus,
  type ComputerStats,
} from "../lib/sources";

function statusColor(s: ServiceStatus): string {
  if (s === "RUNNING") return theme.ok;
  if (s === "FATAL" || s === "STOPPED") return theme.err;
  if (s === "STARTING") return theme.warn;
  return theme.fgMuted;
}

function statusGlyph(s: ServiceStatus): string {
  if (s === "RUNNING") return "●";
  if (s === "FATAL" || s === "STOPPED") return "■";
  if (s === "STARTING") return "◐";
  return "?";
}

function formatBytes(b: number): string {
  if (b === 0) return "0 B";
  const units = ["B", "K", "M", "G", "T"];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(1)}${units[i]}`;
}

function formatUptime(s: number): string {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function OpsTab({ refreshTick }: { refreshTick: number }) {
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<ComputerStats | null>(null);
  const [selected, setSelected] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [{ services: svcs, error: svcErr }, st] = await Promise.all([fetchServices(), fetchStats()]);
    setServices(svcs);
    setStats(st);
    if (svcErr) setError(svcErr);
    else setError(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshTick]);

  useEffect(() => {
    if (services.length === 0) return;
    const sel = services[Math.min(selected, services.length - 1)];
    if (!sel) return;
    let active = true;
    tailLog(sel.name, 30).then((lines) => {
      if (active) setLogs(lines);
    });
    return () => {
      active = false;
    };
  }, [services, selected]);

  useKeyboard((evt) => {
    if (evt.name === "down" || evt.name === "j") {
      setSelected((s) => Math.min(services.length - 1, s + 1));
    } else if (evt.name === "up" || evt.name === "k") {
      setSelected((s) => Math.max(0, s - 1));
    } else if (evt.name === "r") {
      refresh();
    }
  });

  const running = services.filter((s) => s.status === "RUNNING").length;
  const fatals = services.filter((s) => s.status === "FATAL").length;
  const sel = services[Math.min(selected, services.length - 1)];

  return (
    <box flexDirection="row" flexGrow={1} paddingX={1} paddingY={1} gap={1}>
      {/* Left: stats + services table */}
      <box flexDirection="column" width={60} border borderColor={theme.border} paddingX={1} paddingY={1}>
        <box flexDirection="row" justifyContent="space-between">
          <text fg={theme.fg}>
            <b>SYSTEM</b>
          </text>
          <text fg={theme.fgMuted}>{stats?.hostname ?? "—"}</text>
        </box>
        {stats && (
          <box flexDirection="row" gap={2} paddingY={1}>
            <text fg={theme.fgMuted}>
              load <span fg={theme.info}>{stats.loadavg.map((n) => n.toFixed(2)).join(" ")}</span>
            </text>
            <text fg={theme.fgMuted}>
              mem{" "}
              <span fg={theme.info}>
                {formatBytes(stats.memTotal - stats.memAvail)}/{formatBytes(stats.memTotal)}
              </span>
            </text>
            <text fg={theme.fgMuted}>
              up <span fg={theme.info}>{formatUptime(stats.uptime)}</span>
            </text>
          </box>
        )}

        <box flexDirection="row" justifyContent="space-between" paddingTop={1}>
          <text fg={theme.fg}>
            <b>SERVICES</b> <span fg={theme.fgMuted}>({services.length})</span>
          </text>
          <text fg={theme.fgMuted}>
            <span fg={theme.ok}>● {running}</span>{"  "}
            <span fg={theme.err}>■ {fatals}</span>
          </text>
        </box>

        <box flexDirection="column" paddingTop={1}>
          {error && (
            <text fg={theme.err}>error: {error}</text>
          )}
          {services.length === 0 && !error && (
            <text fg={theme.fgMuted}>no services</text>
          )}
          {/* Header */}
          <box flexDirection="row">
            <text fg={theme.fgDim}>
              {pad("", 2)}{pad("NAME", 28)}{pad("STATUS", 10)}{pad("PID", 8)}{pad("UPTIME", 20)}
            </text>
          </box>
          {services.map((svc, i) => {
            const isSel = i === selected;
            return (
              <box key={svc.name} flexDirection="row" backgroundColor={isSel ? theme.surfaceAlt : undefined}>
                <text>
                  <span fg={isSel ? theme.accent : theme.fgDim}>{pad(isSel ? "▸ " : "  ", 2)}</span>
                  <span fg={isSel ? theme.fg : theme.fg}>{pad(svc.name, 28)}</span>
                  <span fg={statusColor(svc.status)}>{pad(`${statusGlyph(svc.status)} ${svc.status}`, 10)}</span>
                  <span fg={theme.fgMuted}>{pad(svc.pid, 8)}</span>
                  <span fg={theme.fgMuted}>{pad(svc.uptime, 20)}</span>
                </text>
              </box>
            );
          })}
        </box>
      </box>

      {/* Right: log tail */}
      <box flexDirection="column" flexGrow={1} flexShrink={1} border borderColor={theme.border} paddingX={1} paddingY={1}>
        <text fg={theme.fg}>
          <b>LOG</b>{" "}
          <span fg={theme.fgMuted}>
            {sel ? sel.name : "—"} {sel && <span>({relativeTime(Date.now() - 0)})</span>}
          </span>
        </text>
        <box flexDirection="column" paddingTop={1}>
          {logs.length === 0 ? (
            <text fg={theme.fgMuted}>no log</text>
          ) : (
            logs.map((line, i) => (
              <text key={i} fg={theme.fgMuted}>
                {line.length > 200 ? line.slice(0, 200) + "…" : line}
              </text>
            ))
          )}
        </box>
      </box>
    </box>
  );
}
