// Chat tab — talk to Zo using the existing ZO_CLIENT_IDENTITY_TOKEN.

import { useEffect, useRef, useState, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import { theme } from "../lib/theme";
import { askZo, type ChatMessage } from "../lib/zo-api";

export function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      content: "Chat with Zo. Type your message and press Enter to send. Press Ctrl-C to abort.",
      ts: Date.now(),
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    const userMsg: ChatMessage = { role: "user", content: text, ts: Date.now() };
    const placeholder: ChatMessage = { role: "assistant", content: "", ts: Date.now() };
    setMessages((m) => [...m, userMsg, placeholder]);
    setBusy(true);
    setError(null);
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      await askZo(
        [...messages, userMsg],
        (partial) => {
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") {
              copy[copy.length - 1] = { ...last, content: partial };
            }
            return copy;
          });
        },
        ac.signal,
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError(String(e));
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant" && !last.content) {
            copy[copy.length - 1] = { ...last, content: `(error) ${String(e)}` };
          }
          return copy;
        });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [draft, busy, messages]);

  useKeyboard((evt) => {
    if (evt.name === "return" && !evt.ctrl && !evt.meta) {
      send();
    } else if (evt.name === "c" && evt.ctrl) {
      abortRef.current?.abort();
    } else if (evt.name === "backspace") {
      setDraft((d) => d.slice(0, -1));
    } else if (evt.sequence && evt.sequence.length === 1 && !evt.ctrl && !evt.meta) {
      // Append printable characters
      setDraft((d) => d + evt.sequence);
    }
  });

  return (
    <box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1} border borderColor={theme.border}>
      <text fg={theme.fg}>
        <b>CHAT</b>{" "}
        <span fg={theme.fgMuted}>
          · model: {process.env.LLM_MODEL ?? "default"} · {busy ? <span fg={theme.warn}>streaming…</span> : "idle"}
        </span>
      </text>

      <box flexDirection="column" flexGrow={1} paddingY={1}>
        {messages.slice(-20).map((m, i) => (
          <box key={i} flexDirection="column" paddingY={0}>
            <text fg={m.role === "user" ? theme.accent : m.role === "assistant" ? theme.info : theme.fgMuted}>
              {m.role === "user" ? "you" : m.role === "assistant" ? "zo" : "—"}
            </text>
            <text fg={m.role === "system" ? theme.fgMuted : theme.fg}>
              {m.content || (busy && m.role === "assistant" ? "…" : "")}
            </text>
          </box>
        ))}
        {error && <text fg={theme.err}>{error}</text>}
      </box>

      <box flexDirection="row" border borderColor={theme.accent} paddingX={1}>
        <text fg={theme.fgMuted}>▸ {draft || <span fg={theme.fgDim}>type a message…</span>}</text>
      </box>
    </box>
  );
}
