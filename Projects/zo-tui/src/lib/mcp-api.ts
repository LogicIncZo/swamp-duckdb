// Zo MCP JSON-RPC client.
// Calls https://api.zo.computer/mcp with ZO_CLIENT_IDENTITY_TOKEN.

const MCP_URL = "https://api.zo.computer/mcp";

interface McpRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema?: {
    type: "object";
    properties?: Record<string, { type?: string; description?: string; enum?: string[] }>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

interface McpResponse {
  jsonrpc: "2.0";
  id: number;
  result?: {
    content?: { type: string; text?: string }[];
    tools?: McpTool[];
    [key: string]: unknown;
  };
  error?: { code: number; message: string };
}

function getToken(): string {
  const cfgfile = process.env.HOME + "/.zo-cli.json";
  try { const cfg = JSON.parse(require("fs").readFileSync(cfgfile, "utf-8")); if (cfg.token) return cfg.token; } catch {}
  const t = process.env.ZO_CLIENT_IDENTITY_TOKEN;
  if (!t) throw new Error("ZO_CLIENT_IDENTITY_TOKEN not set");
  return t;
}

async function mcpCall(method: string, params?: Record<string, unknown>): Promise<McpResponse> {
  const body: McpRequest = { jsonrpc: "2.0", id: 1, method };
  if (params) body.params = params;

  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MCP HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as McpResponse;
  if (data.error) throw new Error(`MCP error ${data.error.code}: ${data.error.message}`);
  return data;
}

export async function listTools(): Promise<McpTool[]> {
  const data = await mcpCall("tools/list");
  return data.result?.tools ?? [];
}

export async function callTool(name: string, args: Record<string, unknown> = {}): Promise<string> {
  const data = await mcpCall("tools/call", { name, arguments: args });
  const content = data.result?.content ?? [];
  return content.map((c) => c.text ?? "").join("\n").trim();
}
