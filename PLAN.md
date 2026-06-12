# Nirvana MCP Server — Implementation Plan

Stack, API reference, and conventions live in [CLAUDE.md](./CLAUDE.md). This file is the roadmap.

## Phase 0 — Infrastructure ✅

Done in commit `02d413f`. Minimal working MCP server bootstrap over stdio (`initialize` handshake verified). Stack/layout decisions live in [CLAUDE.md](./CLAUDE.md).

## Phase 1 — MVP: `get_inbox`

API shape verified against [meeech/nirv](https://github.com/meeech/nirv) and [mikesimons/nibbana](https://github.com/mikesimons/nibbana) — full reference in [CLAUDE.md](./CLAUDE.md#nirvana-api-reference). No need to sniff browser traffic.

1. `src/nirvana/types.ts` — `NirvanaTask`, `NirvanaTag`, `EverythingResponse`, state/type enums.
2. `src/nirvana/client.ts` — `NirvanaClient`:
   - `static login(appId, username, password)` → returns auth token (one-time helper).
   - `everything(since = 0)` → returns full snapshot, surfaces `results[0].error` as a thrown error.
3. `scripts/login.ts` — small CLI that prompts/accepts username+password, prints a token to paste into `.env`.
4. `src/tools/get-inbox.ts` — registers `get_inbox`:
   - No inputs.
   - Filters `everything()` results: `type === 0`, `state === 0`, `completed === 0`.
   - Output: `{ id, name, note, tags: string[], created_at? }[]`.
5. `src/index.ts` — read `NIRVANA_APP_ID` + `NIRVANA_AUTH_TOKEN` env vars, fail fast if missing, construct client, register tool.
6. Verify with `npm run inspect` and against live account.

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

Resolved in Phase 1 prep (see [CLAUDE.md](./CLAUDE.md#nirvana-api-reference)):

- ✅ Auth flow: `POST auth.new` with plaintext password over HTTPS, returns a long-lived token.
- ✅ Read endpoint: `GET ?method=everything&since=0` returns all tasks/tags/user in one shot.
- ✅ Write endpoint: `POST ?api=json` with JSON array of `{method: "task.save", ...}`.
- ✅ Required common params: `api`, `requestid`, `clienttime`, `authtoken`, `appid`, `appversion`.

Still open:

- Does the API still work for active accounts? (Verified live in Phase 1 step 6.)
- Rate limits / quota — not documented. Will surface from error responses if hit.
