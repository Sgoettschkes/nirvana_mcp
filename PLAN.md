# Nirvana MCP Server — Implementation Plan

Stack, API reference, and conventions live in [CLAUDE.md](./CLAUDE.md). This file is the roadmap.

## Phase 0 — Infrastructure

1. `npm init` — set `"type": "module"`, `bin` entry pointing to `dist/index.js`.
2. Install deps: `@modelcontextprotocol/sdk`, `zod`. Dev: `typescript`, `tsx`, `@types/node`.
3. `tsconfig.json` — `target: ES2022`, `module: NodeNext`, `outDir: dist`, `strict: true`.
4. Project layout:
   ```
   src/
     index.ts          # MCP server bootstrap
     nirvana/
       client.ts       # auth + HTTP wrapper
       types.ts        # Task, Project, Tag, etc.
     tools/
       get-inbox.ts    # first tool
   ```
5. `.env.example` with `NIRVANA_APP_ID`, `NIRVANA_USERNAME`, `NIRVANA_PASSWORD` (or pre-computed `NIRVANA_AUTH_TOKEN`).
6. Scripts: `build` (`tsc`), `dev` (`tsx src/index.ts`), `inspect` (run via MCP Inspector).

## Phase 1 — MVP: `get_inbox`

1. Build `NirvanaClient`:
   - `authenticate(username, password)` → returns auth token (MD5-based; confirm exact flow by sniffing).
   - `getEverything(since?)` → returns all tasks; cache locally per process.
2. Register MCP tool `get_inbox`:
   - No inputs.
   - Returns array of tasks where `state === 0` and `completed == false` and `trashed == false`.
   - Output shape: `{ id, name, note, tags, created_at }[]`.
3. Verify with `npx @modelcontextprotocol/inspector node dist/index.js`.

## Phase 2 — Distribution

1. Publish to npm as `@sgoettschkes/nirvana-mcp` with `bin` field.
2. README usage block for Claude Desktop `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "nirvana": {
         "command": "npx",
         "args": ["-y", "@sgoettschkes/nirvana-mcp"],
         "env": {
           "NIRVANA_APP_ID": "...",
           "NIRVANA_AUTH_TOKEN": "..."
         }
       }
     }
   }
   ```
3. GitHub Actions: on tag push → `npm publish`.

## Phase 3 — Local Test (Definition of Done for MVP)

- Add the server to Claude Code's MCP config on this machine.
- Ask Claude: *"What's in my Nirvana inbox?"* — confirm correct items return.
- Edge cases verified: empty inbox, items with notes, items with tags, expired token error path.

---

## Phase 4+ — Full Tool Inventory

### Read Tools (priority — ship these first)

| # | Tool | Purpose | Notes |
|---|---|---|---|
| 1 | `get_inbox` | Items in Inbox (state=0) | **MVP** |
| 2 | `get_next_actions` | state=1, optionally filtered by tag/area | high value for GTD |
| 3 | `get_waiting_for` | state=2 | |
| 4 | `get_scheduled` | state=3, optionally date-range | |
| 5 | `get_someday` | state=4 | |
| 6 | `get_focus` | items flagged "focus" today | |
| 7 | `list_projects` | state=11 (active projects) | |
| 8 | `get_project` | project + child tasks by id or name | |
| 9 | `list_areas` | all areas | |
| 10 | `list_tags` | all tags/contexts/contacts | |
| 11 | `search_tasks` | client-side filter by text/tag/area/state | leverages cached bulk fetch |
| 12 | `get_logbook` | recently completed (state=7) | |

### Write Tools (after read tools are stable)

| # | Tool | Purpose | Risk |
|---|---|---|---|
| 13 | `create_task` | Quick-capture to Inbox | low |
| 14 | `create_task_in_project` | Add task under a project | low |
| 15 | `update_task` | Rename / edit notes / set tags | medium |
| 16 | `set_task_state` | Move between Inbox→Next→Waiting→… | medium |
| 17 | `complete_task` | Mark done (→ Logbook) | medium |
| 18 | `set_due_date` | Schedule a task | medium |
| 19 | `set_focus` | Toggle focus flag | low |
| 20 | `set_tags` | Add/remove tags on a task | low |
| 21 | `create_project` | New project | medium |
| 22 | `update_project` | Rename / change area / state | medium |
| 23 | `complete_project` | Mark done | medium |
| 24 | `delete_task` | Trash (state=6) | high — gate behind explicit confirm |
| 25 | `purge_task` | Permanent delete (state=8) | high — gate behind explicit confirm |
| 26 | `create_tag` / `create_area` / `create_context` | Taxonomy mgmt | low |

### Out of scope (for now)

- Recurring task creation (state=9, requires modeling recurrence rules).
- User/account settings.
- Real-time sync — MCP is request/response; we re-fetch on demand.

---

## Open Questions

1. Does the API still work? It was announced in 2009 and never officially relaunched. We may need to reverse-engineer the current web app's traffic.
2. Auth flow — does the documented MD5(password) login still work, or do they use a session cookie now?
3. Rate limits / quota?
4. Bulk endpoint name — `everything.json` is the community-documented name; confirm.

These get resolved in Phase 1 step 1 (inspect browser traffic) before writing any code.
