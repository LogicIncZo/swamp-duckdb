// Typed access to the Zo public API via the `zocomputer` SDK
// (https://github.com/EthanThatOneKid/zocomputer-ts — generated nightly from
// the public OpenAPI spec at https://docs.zocomputer.com/openapi.json).
//
// Auth resolution (first match wins):
//   1. ZO_API_KEY               — a zo_sk_... API key from Settings → Advanced.
//      Lets the TUI run from ANY machine (no SSH to the Zo box needed).
//   2. ZO_CLIENT_IDENTITY_TOKEN — the identity token, present when running on
//      the Zo box itself.
//   3. SSH fallback             — fetch the identity token from the box
//      (ZO_REMOTE_HOST, default the standard Zo Tailscale IP), matching the
//      existing `sources.ts` pattern.
//
// The SDK is typed ESM built on fetch; it ships on npm as `zocomputer` and is
// regenerated nightly (v0.1.4). We call its generated functions with an explicit
// client + Authorization header so the same token works for both identity-token
// and API-key auth, and responses stay type-checked by the SDK types.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  createClient,
  getAvailableModels,
  getAvailablePersonas,
  getModelCatalog,
  type ZoModelInfo,
  type ZoPersonaInfo,
  type ModelCatalogResponse,
} from "zocomputer";

const execFileAsync = promisify(execFile);
const REMOTE = process.env.ZO_REMOTE_HOST ?? "100.112.121.91";

let cachedToken: string | null = null;

/** Resolve a usable API token, caching it across calls. */
export async function resolveToken(): Promise<string> {
  if (cachedToken !== null) return cachedToken;

  if (process.env.ZO_API_KEY) {
    cachedToken = process.env.ZO_API_KEY;
    return cachedToken;
  }
  if (process.env.ZO_CLIENT_IDENTITY_TOKEN) {
    cachedToken = process.env.ZO_CLIENT_IDENTITY_TOKEN;
    return cachedToken;
  }
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
  if (!cachedToken) {
    throw new Error(
      "No Zo auth found. Set ZO_API_KEY (Settings → Advanced → Access Tokens) to run " +
        "remotely, or ZO_CLIENT_IDENTITY_TOKEN when running on the Zo box.",
    );
  }
  return cachedToken;
}

/** Reset cached auth (call after the user changes ZO_API_KEY). */
export function resetAuth(): void {
  cachedToken = null;
}

async function authHeaders(): Promise<{ authorization: string }> {
  return { authorization: await resolveToken() };
}

/** Available models + personas for the current auth context (parallel fetch). */
export async function loadAvailable(): Promise<{
  models: ZoModelInfo[];
  personas: ZoPersonaInfo[];
}> {
  const client = createClient();
  const [m, p] = await Promise.all([
    getAvailableModels({ client, headers: await authHeaders() }),
    getAvailablePersonas({ client, headers: await authHeaders() }),
  ]);
  return {
    models: m.data?.models ?? [],
    personas: p.data?.personas ?? [],
  };
}

/** Full public model catalog (featured flags, deprecation map, promo). */
export async function loadCatalog(): Promise<{
  catalog: ModelCatalogResponse;
  error?: string;
}> {
  try {
    const res = await getModelCatalog({ client: createClient() }); // public — no auth
    if (!res.data) throw new Error("Empty catalog response");
    return { catalog: res.data };
  } catch (e) {
    return {
      catalog: {
        models: [],
        default_chat_model_id: "",
        featured_model_ids: [],
        featured_models_are_free: false,
        featured_model_labels: [],
        deprecation_map: {},
      },
      error: String(e),
    };
  }
}