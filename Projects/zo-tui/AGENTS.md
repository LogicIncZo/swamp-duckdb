# zo-tui

OpenTUI-based terminal control panel for the Zo Computer sandbox. Tabbed interface
(Ops, Files, Automations, Chat, MCP, Models) built on `@opentui/react` with live
data sources.

## Layout
```
src/
├── index.tsx        # Entry: createCliRenderer + createRoot + <App />
├── App.tsx          # Tab shell, header, footer, keybindings
├── lib/
│   ├── theme.ts     # Color palette (Tokyo Night + Phosphor inspired)
│   ├── format.ts    # Bytes, durations, relative time
│   ├── sources.ts   # fetchServices, fetchStats, fetchAutomations, fetchDir
│   ├── zo-api.ts    # POST /zo/ask streaming for the Chat tab
│   └── zo-client.ts # Typed client via `zocomputer` SDK (models/personas/catalog)
└── tabs/
    ├── Ops.tsx          # Service table + system stats + log tail
    ├── Files.tsx        # File tree navigator with arrow keys
    ├── Automations.tsx  # Scheduled agents list with rrules
    ├── Chat.tsx         # Streaming chat with Zo via /zo/ask
    ├── MCP.tsx          # MCP server status
    └── Models.tsx       # Available models + personas + catalog (SDK)
```

## Run
```bash
bun run dev                # from project dir
# or
zo-tui                     # global launcher in /home/workspace/.local/bin
```

## Keybindings
- `tab` / `1-6`: switch tabs
- `r`: refresh current tab
- `esc` / `ctrl-c`: quit
- `j/k` or arrows: navigate lists (tab-specific)
- `enter`: activate selection (Files/Chat)
- `i`: enter input mode (Chat)

## Data sources
- Services: `supervisorctl -c /etc/zo/supervisord-user.conf status`
- Stats: `/proc/loadavg`, `/proc/meminfo`, `uptime` + `hostname`
- Automations: dedup of multiple backup JSON files in `zo-agents-backup/`, `Archive/zo-agents-backup/`
- Files: `fs.readdir` with hidden folders filtered
- Chat: streaming POST to `https://api.zo.computer/zo/ask` using `ZO_CLIENT_IDENTITY_TOKEN`
- Models/personas: `zocomputer` SDK (EthanThatOneKid/zocomputer-ts, nightly generated
  from the public OpenAPI spec) — `getAvailableModels`, `getAvailablePersonas`,
  `getModelCatalog`. Catalog is public (no auth); models/personas need a bearer
  token (`ZO_CLIENT_IDENTITY_TOKEN` or `ZO_API_KEY` from Settings → Advanced).

## Notable design decisions
- **Bun-native**: uses `Bun.spawn` for `supervisorctl` and `crypto.randomUUID` — no extra deps
- **Typed API client**: `zo-client.ts` wraps the SDK; `resolveToken()` falls back
  from `ZO_API_KEY` to `ZO_CLIENT_IDENTITY_TOKEN` so the TUI works both inside the
  sandbox and externally. `loadCatalog()` degrades to an empty catalog on error.
- **Defensive parsing**: `normalizeAutomation` provides defaults for missing fields
- **Degrading gracefully**: each fetcher returns `{ ..., error? }` so a single broken source
  doesn't break the tab
- **Live data only** — no caching; each tab refetches on mount and on `r`

## Roadmap
- [ ] Add filtering/search to Ops and Automations tabs
- [ ] Add `Services` and `Agents` (mounted ones, not just backups) when API is available
- [ ] Add a `Logs` global search across `/dev/shm/*.log`
- [ ] Persist last-active tab in workspace config
- [ ] Add a quick command palette (`:` in any tab)
- [ ] Model/persona picker wired into Chat (send `model_name`/`persona_id` via SDK)
