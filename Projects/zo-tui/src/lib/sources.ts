// Live data sources — proxied to Zo Computer via SSH.
// Set ZO_REMOTE_HOST (default: 100.112.121.91) to point at your Zo server.

import { join } from "node:path";

const REMOTE =
  process.env.ZO_REMOTE_HOST ?? "100.112.121.91";

const SSH_OPTS = [
  "-o", "ConnectTimeout=5",
  "-o", "StrictHostKeyChecking=no",
  "-o", "BatchMode=yes",
  "-o", "ServerAliveInterval=5",
  "-o", "ServerAliveCountMax=2",
  "-T", // disable pseudo-terminal allocation
];

function ssh(cmd: string, timeoutMs = 10_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = Bun.spawn(["ssh", ...SSH_OPTS, `root@${REMOTE}`, cmd], {
      stdout: "pipe",
      stderr: "pipe",
    });

    let stdout = "";
    let stderr = "";
    const readerOut = proc.stdout.getReader();
    const readerErr = proc.stderr.getReader();
    const pumpOut = async () => { while (true) { const { done, value } = await readerOut.read(); if (done) break; stdout += Buffer.from(value).toString(); } };
    const pumpErr = async () => { while (true) { const { done, value } = await readerErr.read(); if (done) break; stderr += Buffer.from(value).toString(); } };
    const pumpDone = Promise.all([pumpOut(), pumpErr()]);

    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error(`SSH: timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.exited.then(async (code) => {
      await pumpDone;
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(`SSH exit ${code}: ${(stderr || stdout).slice(0, 200)}`));
    }).catch((e) => {
      clearTimeout(timer);
      reject(new Error(`SSH: ${(e as Error).message?.slice(0, 200)}`));
    });
  });
}

// --- Services (supervisord) -----------------------------------------------

export type ServiceStatus = "RUNNING" | "STOPPED" | "FATAL" | "STARTING" | "UNKNOWN";

export interface Service {
  name: string;
  status: ServiceStatus;
  uptime: string;
  pid: string;
  raw: string;
}

interface ParsedLine {
  name: string;
  status: string;
  uptime: string;
  pid: string;
  raw: string;
}

function parseSupervisorLine(line: string): ParsedLine | null {
  const m = line.match(/^(\S+)\s+(\S+)\s+(.*)$/);
  if (!m) return null;
  const [, name, statusRaw, rest] = m;
  const status = statusRaw as ServiceStatus;
  let pid = "—";
  let uptime = "—";
  const pidMatch = rest.match(/pid (\d+), uptime ([^,]+(?:, [^,]+)*)/);
  if (pidMatch) {
    pid = pidMatch[1];
    uptime = pidMatch[2];
  } else if (rest.startsWith("Exited")) {
    pid = "—";
    uptime = rest;
  } else {
    uptime = rest;
  }
  return { name, status, uptime, pid, raw: line };
}

export async function fetchServices(): Promise<{ services: Service[]; error?: string }> {
  try {
    const out = await ssh(`supervisorctl -c /etc/zo/supervisord-user.conf status`);
    const valid: ServiceStatus[] = ["RUNNING", "STOPPED", "FATAL", "STARTING", "UNKNOWN"];
    const services: Service[] = out
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map(parseSupervisorLine)
      .filter((s): s is ParsedLine => s !== null)
      .map((p) => ({
        ...p,
        status: (valid.includes(p.status as ServiceStatus) ? p.status : "UNKNOWN") as ServiceStatus,
      }));
    return { services };
  } catch (e) {
    return { services: [], error: String(e) };
  }
}

// --- Automations / Agents -------------------------------------------------

export interface Automation {
  id: string;
  title: string;
  rrule: string;
  delivery: string;
  model: string;
  active: boolean;
  instruction: string;
  source: string;
}

interface AgentFile {
  agents?: Automation[];
  automations?: Automation[];
}

function normalizeAutomation(a: any, source: string): Automation | null {
  if (!a || typeof a !== "object") return null;
  const id = String(a.id ?? a._id ?? a.uuid ?? crypto.randomUUID());
  const title =
    typeof a.title === "string" && a.title
      ? a.title
      : typeof a.name === "string" && a.name
        ? a.name
        : id;
  const rrule = typeof a.rrule === "string" ? a.rrule : "—";
  const delivery = typeof a.delivery_method === "string" ? a.delivery_method : (a.delivery ?? "—");
  const model = typeof a.model === "string" ? a.model : (a.model_name ?? "—");
  const active = typeof a.active === "boolean" ? a.active : true;
  const instruction = typeof a.instruction === "string" ? a.instruction : "";
  return { id, title, rrule, delivery, model, active, instruction, source };
}

function pickAutomations(obj: AgentFile, source: string): Automation[] {
  const list = obj.agents ?? obj.automations ?? [];
  return list.map((a) => normalizeAutomation(a, source)).filter((a): a is Automation => a !== null);
}

async function readRemoteJson<T>(path: string): Promise<T | null> {
  try {
    const json = await ssh(`cat '${path}' 2>/dev/null`);
    if (!json.trim()) return null;
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export async function fetchAutomations(): Promise<{ automations: Automation[]; error?: string }> {
  const candidates = [
    "/home/workspace/zo-agents-backup/agents.json",
    "/home/workspace/Archive/zo-agents-backup/agents.json",
    "/home/workspace/Archive/zo-agents-backup/agents-full-export.json",
    "/home/workspace/Archive/zo-agents-backup/automations-full.json",
  ];
  const seen = new Set<string>();
  const merged: Automation[] = [];
  let lastError: string | undefined;

  for (const path of candidates) {
    const data = await readRemoteJson<AgentFile | Automation[]>(path);
    if (!data) continue;
    try {
      if (Array.isArray(data)) {
        for (const a of data) {
          const norm = normalizeAutomation(a, path);
          if (!norm) continue;
          const key = `${norm.id}::${norm.title}`;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(norm);
          }
        }
      } else {
        for (const a of pickAutomations(data, path)) {
          const key = `${a.id}::${a.title}`;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(a);
          }
        }
      }
    } catch (e) {
      lastError = String(e);
    }
  }
  return { automations: merged, error: lastError };
}

// --- Files -----------------------------------------------------------------

export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  mtime: Date;
}

const WORKSPACE = "/home/workspace";
const HIDDEN = new Set([".git", "node_modules", ".pytest_cache", "Trash", ".cache", ".bun", ".npm", ".next", ".venv", "__pycache__"]);

export async function fetchDir(rel: string = ""): Promise<{ entries: FileEntry[]; error?: string; path: string }> {
  const abs = join(WORKSPACE, rel);
  try {
    // Use `ls -la` over SSH — fast and gives us type/size/mtime in one shot
    const out = await ssh(`ls -la --time-style=+%s '${abs.replace(/'/g, "'\\''")}' 2>/dev/null`);
    const entries: FileEntry[] = [];
    for (const line of out.split("\n").slice(1)) {
      // Skip header and empty lines
      if (!line.trim()) continue;
      const parts = line.trim().split(/\s+/);
      // format: type, perms, links, owner, group, size, mtime_epoch, name
      if (parts.length < 7) continue;
      const isDir = parts[0].startsWith("d");
      const size = parseInt(parts[4], 10) || 0;
      const mtime = new Date(parseInt(parts[5], 10) * 1000);
      const name = parts.slice(6).join(" ");
      if (!name) continue;
      if (HIDDEN.has(name)) continue;
      if (name.startsWith(".") && name !== ".opencode" && name !== ".swamp" && name !== ".agents") continue;
      entries.push({
        name,
        path: rel ? `${rel}/${name}` : name,
        isDir,
        size,
        mtime,
      });
    }
    entries.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return { entries, path: rel };
  } catch (e) {
    return { entries: [], error: String(e), path: rel };
  }
}

// --- Computer stats --------------------------------------------------------

export interface ComputerStats {
  loadavg: [number, number, number];
  memTotal: number;
  memFree: number;
  memAvail: number;
  uptime: number;
  hostname: string;
  diskUsage: { used: number; total: number } | null;
}

export async function fetchStats(): Promise<ComputerStats> {
  try {
    const out = await ssh(
      `awk '/MemTotal/{t=$2} /MemFree/{f=$2} /MemAvailable/{a=$2} END{print t,f,a}' /proc/meminfo; ` +
      `awk '{print $1,$2,$3}' /proc/loadavg; ` +
      `awk '{print $1}' /proc/uptime; ` +
      `hostname; ` +
      `df -B1 /home/workspace | tail -1 | awk '{print $3,$2}'`
    );
    const lines = out.trim().split("\n");
    const memParts = (lines[0] ?? "").split(/\s+/).map(Number);
    const loadParts = (lines[1] ?? "").split(/\s+/).map(Number);
    const uptime = parseFloat(lines[2] ?? "0");
    const hostname = lines[3] ?? "—";
    const diskParts = (lines[4] ?? "").split(/\s+/);
    const disk = diskParts.length >= 2
      ? { used: parseInt(diskParts[0], 10), total: parseInt(diskParts[1], 10) }
      : null;

    return {
      loadavg: [loadParts[0] ?? 0, loadParts[1] ?? 0, loadParts[2] ?? 0],
      memTotal: (memParts[0] ?? 0) * 1024,
      memFree: (memParts[1] ?? 0) * 1024,
      memAvail: (memParts[2] ?? 0) * 1024,
      uptime,
      hostname,
      diskUsage: disk,
    };
  } catch {
    return {
      loadavg: [0, 0, 0], memTotal: 0, memFree: 0, memAvail: 0,
      uptime: 0, hostname: "—", diskUsage: null,
    };
  }
}

// --- Log tail (single service) --------------------------------------------

export async function tailLog(name: string, lines: number = 40): Promise<string[]> {
  try {
    const out = await ssh(`tail -n ${lines} '/dev/shm/${name}.log' 2>/dev/null`);
    return out.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}
