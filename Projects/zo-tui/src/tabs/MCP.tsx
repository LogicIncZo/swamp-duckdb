import { useEffect, useState, useRef, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import { theme } from "../lib/theme";
import { listTools, callTool, type McpTool } from "../lib/mcp-api";

type View = "schema" | "call" | "result";

function toolName(t: McpTool): string {
  return t.name;
}

function requiredArgs(t: McpTool): string[] {
  return t.inputSchema?.required ?? [];
}

function allProps(t: McpTool): Record<string, any> {
  return t.inputSchema?.properties ?? {};
}

export function MCP() {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [view, setView] = useState<View>("schema");
  const [argInput, setArgInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const inputRef = useRef("");

  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const t = await listTools();
      setTools(t);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load tools");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTools(); }, [fetchTools]);

  const filtered = tools.filter((t) =>
    !filter || t.name.toLowerCase().includes(filter.toLowerCase())
  );
  const safeCursor = Math.min(cursor, Math.max(0, filtered.length - 1));
  const selected = filtered[safeCursor];

  const handleRun = useCallback(async () => {
    if (!selected) return;
    setResultLoading(true);
    setResultError(null);
    setResult(null);
    try {
      let args: Record<string, any> = {};
      if (argInput.trim()) {
        args = JSON.parse(argInput);
      }
      const out = await callTool(selected.name, args);
      setResult(typeof out === "string" ? out : JSON.stringify(out, null, 2));
      setView("result");
    } catch (e: any) {
      setResultError(e?.message ?? "Call failed");
      setView("result");
    } finally {
      setResultLoading(false);
    }
  }, [selected, argInput]);

  useKeyboard((evt) => {
    if (evt.name === "up" || evt.name === "k") {
      setCursor((p) => Math.max(0, Math.min(p - 1, filtered.length - 1)));
    } else if (evt.name === "down" || evt.name === "j") {
      setCursor((p) => Math.min(filtered.length - 1, p + 1));
    } else if (evt.name === "pageup") {
      setCursor((p) => Math.max(0, p - 10));
    } else if (evt.name === "pagedown") {
      setCursor((p) => Math.min(filtered.length - 1, p + 10));
    } else if (evt.name === "home") {
      setCursor(0);
    } else if (evt.name === "end") {
      setCursor(filtered.length - 1);
    } else if (evt.name === "return") {
      if (view === "call" && !resultLoading) {
        handleRun();
      }
    } else if (evt.name === "escape") {
      if (filter) { setFilter(""); }
      else if (view !== "schema") { setView("schema"); setArgInput(""); setResult(null); setResultError(null); }
    } else if (evt.name === "c" && !evt.ctrl) {
      if (selected && view !== "call") {
        setArgInput(JSON.stringify(getDefaultArgs(selected), null, 2));
        setView("call");
      }
    } else if (evt.name === "s" && !evt.ctrl) {
      setView("schema");
    } else if (evt.name === "r") {
      fetchTools();
    } else if (evt.name === "slash" || evt.name === "/") {
      if (!filter) { setFilter(" "); setCursor(0); }
    } else if (evt.name === "space") {
      // ignore space for result scrolling
    } else if (evt.name === "q") {
      // handled by app level
    }
  });

  return (
    <box flexDirection="row" flexGrow={1} height="100%">
      {/* left sidebar: tool list */}
      <box
        flexDirection="column"
        width={34}
        borderStyle="rounded"
        borderColor={theme.border}
        paddingX={0}
        paddingY={0}
      >
        <text fg={theme.accent}>
          Tools ({filtered.length})
          {filter ? <span fg={theme.fgDim}> filter: [{filter}]</span> : null}
        </text>

        <box flexDirection="column" flexGrow={1} overflow="scroll">
          {loading ? (
            <text fg={theme.fgDim} paddingX={1}>Loading...</text>
          ) : error ? (
            <text fg={theme.err} paddingX={1}>{error}</text>
          ) : filtered.length === 0 ? (
            <text fg={theme.fgDim} paddingX={1}>No tools match</text>
          ) : (
            filtered.map((t, i) => {
              const isSelected = i === safeCursor;
              const req = requiredArgs(t);
              return (
                <box
                  key={t.name}
                  paddingX={1}
                  paddingY={0}
                  backgroundColor={isSelected ? theme.accent + "33" : undefined}
                >
                  <text
                    fg={isSelected ? theme.accent : theme.fg}
                  >
                    {isSelected ? "› " : "  "}{t.name}
                  </text>
                  {req.length > 0 && isSelected && (
                    <text fg={theme.fgDim}>
                      {" "}({req.join(", ")})
                    </text>
                  )}
                </box>
              );
            })
          )}
        </box>
      </box>

      {/* right panel: schema / call / result */}
      <box
        flexDirection="column"
        flexGrow={1}
        borderStyle="rounded"
        borderColor={theme.border}
        paddingX={1}
        paddingY={0}
      >
        {!selected ? (
          <text fg={theme.fgDim}>
            {loading ? "Loading tools…" : "No tool selected"}
          </text>
        ) : view === "schema" ? (
          <SchemaView tool={selected} />
        ) : view === "call" ? (
          <CallView
            tool={selected}
            argInput={argInput}
            onChange={setArgInput}
            onRun={handleRun}
            loading={resultLoading}
          />
        ) : (
          <ResultView
            result={result}
            error={resultError}
            loading={resultLoading}
            toolName={selected.name}
            onBack={() => setView("call")}
          />
        )}

        {/* footer keybinds */}
        <box marginTop={1} paddingY={0}>
          <text fg={theme.fgMuted}>
            ↑↓/jk move{"  "}
            <span fg={theme.accent}>c</span> call{"  "}
            <span fg={theme.accent}>s</span> schema{"  "}
            <span fg={theme.accent}>r</span> refresh{"  "}
            <span fg={theme.accent}>/</span> filter{"  "}
            <span fg={theme.accent}>esc</span> back
          </text>
        </box>
      </box>
    </box>
  );
}

function getDefaultArgs(t: McpTool): Record<string, any> {
  const props = allProps(t);
  const req = requiredArgs(t);
  const defaults: Record<string, any> = {};
  for (const k of req) {
    const p = props[k];
    if (p) {
      if (p.type === "string") defaults[k] = "";
      else if (p.type === "number" || p.type === "integer") defaults[k] = 0;
      else if (p.type === "boolean") defaults[k] = false;
      else if (p.type === "array") defaults[k] = [];
      else if (p.type === "object") defaults[k] = {};
      else defaults[k] = null;
    }
  }
  return defaults;
}

function SchemaView({ tool }: { tool: McpTool }) {
  const props = allProps(tool);
  const req = requiredArgs(tool);
  return (
    <box flexDirection="column" flexGrow={1} overflow="scroll">
      <text fg={theme.accent}>{tool.name}</text>
      {tool.description && (
        <text fg={theme.fg} marginTop={1}>
          {tool.description}
        </text>
      )}
      <text fg={theme.fgDim} marginTop={1}>Required args:</text>
      <text fg={theme.fg}>
        {req.length === 0 ? " (none)" : req.join(", ")}
      </text>
      <text fg={theme.fgDim} marginTop={1}>All properties:</text>
      <box flexDirection="column" flexGrow={1} overflow="scroll">
        {Object.entries(props).length === 0 ? (
          <text fg={theme.fgDim}> (none)</text>
        ) : (
          Object.entries(props).map(([k, v]) => (
            <text key={k} fg={theme.fg}>
              {" "}• <span fg={req.includes(k) ? theme.accent : theme.fgMuted}>{k}</span>: {v.type || "any"}
              {v.description ? ` — ${v.description}` : ""}
            </text>
          ))
        )}
      </box>
    </box>
  );
}

function CallView({
  tool,
  argInput,
  onChange,
  onRun,
  loading,
}: {
  tool: McpTool;
  argInput: string;
  onChange: (v: string) => void;
  onRun: () => void;
  loading: boolean;
}) {
  const props = allProps(tool);
  const req = requiredArgs(tool);
  return (
    <box flexDirection="column" flexGrow={1}>
      <text fg={theme.accent}>call <span fg={theme.fg}>{tool.name}</span></text>
      {Object.keys(props).length > 0 && (
        <text fg={theme.fgDim} marginTop={1}>
          Arguments (JSON):
        </text>
      )}
      <box
        flexDirection="column"
        borderStyle="rounded"
        borderColor={theme.border}
        paddingX={1}
        paddingY={0}
        marginTop={0}
        flexGrow={1}
      >
        <text fg={theme.fg}>{argInput || "{}"}</text>
      </box>
      <text fg={theme.fgMuted}>
        Edit args in Chat tab and copy here.{loading ? " Running…" : ""}
      </text>
      <box marginTop={1}>
        <text fg={theme.accent}>Enter</text>
        <text fg={theme.fgMuted}> to run  ·  </text>
        <text fg={theme.accent}>s</text>
        <text fg={theme.fgMuted}> for schema  ·  </text>
        <text fg={theme.accent}>esc</text>
        <text fg={theme.fgMuted}> back</text>
      </box>
    </box>
  );
}

function ResultView({
  result,
  error,
  loading,
  toolName,
  onBack,
}: {
  result: string | null;
  error: string | null;
  loading: boolean;
  toolName: string;
  onBack: () => void;
}) {
  return (
    <box flexDirection="column" flexGrow={1}>
      <text fg={theme.accent}>result: <span fg={theme.fg}>{toolName}</span></text>
      <box
        flexDirection="column"
        borderStyle="rounded"
        borderColor={theme.border}
        paddingX={1}
        paddingY={0}
        marginTop={0}
        flexGrow={1}
        overflow="scroll"
      >
        {loading ? (
          <text fg={theme.fgDim}>Running…</text>
        ) : error ? (
          <text fg={theme.err}>{error}</text>
        ) : result ? (
          <text fg={theme.fg}>{result}</text>
        ) : (
          <text fg={theme.fgDim}>No result</text>
        )}
      </box>
      <box marginTop={1}>
        <text fg={theme.accent}>esc</text>
        <text fg={theme.fgMuted}> back  ·  </text>
        <text fg={theme.accent}>s</text>
        <text fg={theme.fgMuted}> schema</text>
      </box>
    </box>
  );
}
