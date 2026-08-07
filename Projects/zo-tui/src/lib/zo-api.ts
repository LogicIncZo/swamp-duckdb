// Zo API client for the Chat tab.
// When running remotely, fetches ZO_CLIENT_IDENTITY_TOKEN from the Zo server via SSH.

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const REMOTE =
  process.env.ZO_REMOTE_HOST ?? "100.112.121.91";

let cachedToken: string | null | undefined;

async function getRemoteToken(): Promise<string> {
  if (cachedToken !== undefined) { if (!cachedToken) throw new Error("ZO_CLIENT_IDENTITY_TOKEN not found on remote"); return cachedToken; }
  try {
    const { stdout } = await execFileAsync("ssh", [
      "-o", "ConnectTimeout=5",
      "-o", "StrictHostKeyChecking=no",
      "-o", "BatchMode=yes",
      `root@${REMOTE}`,
      `printenv ZO_CLIENT_IDENTITY_TOKEN`,
    ]);
    cachedToken = stdout.trim() || null;
  } catch {
    cachedToken = null;
  }
  if (!cachedToken) throw new Error("Could not fetch ZO_CLIENT_IDENTITY_TOKEN from Zo server");
  return cachedToken;
}

const ENDPOINT = "https://api.zo.computer/zo/ask";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;
}

export async function askZo(
  messages: ChatMessage[],
  onDelta: (text: string) => void,
  signal: AbortSignal,
): Promise<string> {
  const token = process.env.ZO_CLIENT_IDENTITY_TOKEN || await getRemoteToken();
  if (!token) throw new Error("ZO_CLIENT_IDENTITY_TOKEN is not set");

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return "";
  const transcript = messages
    .slice(-10)
    .map((m) => `${m.role === "user" ? "User" : "Zo"}: ${m.content}`)
    .join("\n\n");
  const prompt = transcript.endsWith(lastUser.content)
    ? transcript
    : transcript + `\n\nUser: ${lastUser.content}`;

  const resp = await fetch(ENDPOINT, {
    method: "POST",
    signal,
    headers: {
      authorization: token,
      "content-type": "application/json",
      accept: "text/event-stream",
    },
    body: JSON.stringify({
      input: prompt,
      model_name: process.env.LLM_MODEL || "byok:048b600a-bf4b-4a7a-88f2-57621c471ed1",
      stream: true,
    }),
  });

  if (!resp.ok || !resp.body) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Zo API ${resp.status}: ${txt.slice(0, 200)}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const events = buf.split("\n\n");
    buf = events.pop() ?? "";
    for (const evt of events) {
      const line = evt.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed?.delta ?? parsed?.output ?? "";
        if (typeof delta === "string" && delta) {
          full += delta;
          onDelta(full);
        }
      } catch {
        if (data) {
          full += data;
          onDelta(full);
        }
      }
    }
  }
  return full;
}
