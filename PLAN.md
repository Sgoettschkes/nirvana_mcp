# Nirvana MCP Server — Implementation Plan

Stack, API reference, and conventions live in [CLAUDE.md](./CLAUDE.md). This file is the roadmap.

## Phase 0 — Infrastructure ✅

Done in commit `02d413f`. Minimal working MCP server bootstrap over stdio (`initialize` handshake verified). Stack/layout decisions live in [CLAUDE.md](./CLAUDE.md).

## Phase 1 — MVP: `get_inbox` ✅

Done in commits `f2823b9` (impl) and `60a2434` (MD5 fix). Live `get_inbox` returns real inbox items from author's account.

Built:
- `src/nirvana/{types,client}.ts` — typed `NirvanaClient` with `login` (MD5-hashed password) and `everything`. Surfaces `results[0].error` as `NirvanaApiError`.
- `src/tools/get-inbox.ts` — filters `type=0`/`state=0`/`completed=0`.
- `src/index.ts` — wires env vars → client → tool registration.

(A `scripts/login.ts` dev helper existed briefly; folded into `src/login-command.ts` in `6c09a6e`.)

## Phase 2 — Distribution

Goal: a stranger can install and use this server in Claude Code with three commands.

### 2a — Login subcommand in the published binary ✅

`src/index.ts` is now a dispatcher: bare invocation starts the server, `login` runs the interactive auth flow, `--help` prints usage. Hidden-password prompt uses raw mode; falls back to `NIRVANA_USERNAME` / `NIRVANA_PASSWORD` env vars when stdin isn't a TTY. `NIRVANA_APP_ID` defaults to `"nirvana-mcp"` so the only required env var for end users is `NIRVANA_AUTH_TOKEN`.

### 2b — npm publish ✅

- `npm pack --dry-run` shows 7.1KB tarball with only `dist/`, `README.md`, `package.json`. ✅
- First release published manually with 2FA OTP (`0.0.1`). ✅
- `.github/workflows/publish.yml` runs `npm publish --provenance --access public` on `v*` tag push. Auth is via **npm Trusted Publishing** (OIDC) — no `NPM_TOKEN` secret needed. The package on npmjs is configured to trust `Sgoettschkes/nirvana_mcp` via workflow `publish.yml`. ✅
- Future releases: `npm version patch && git push --follow-tags`.

### 2c — README with Claude Code install ✅

`README.md` covers: three-command install (`login` → `claude mcp add` → restart), current tool list, how it works, troubleshooting (error 98 etc.), and dev setup. Targets Claude Code only per Phase-2 decisions.

## Phase 3 — Local verification (DoD for shipping) ✅

Verified live on author's machine using the public `npx -y @sgoettschkes/nirvana-mcp` flow: `claude mcp add` registers the server, `get_inbox` returns real inbox items, and the three README install steps work end-to-end from a clean shell. MVP shipped at `v0.0.3`.

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

Resolved (see [CLAUDE.md](./CLAUDE.md#nirvana-api-reference) for full details):

- ✅ Auth flow: `POST auth.new` with MD5 hex digest of the password, returns a long-lived token.
- ✅ Read endpoint: `GET ?method=everything&since=0` returns all tasks/tags/user in one shot.
- ✅ Write endpoint: `POST ?api=json` with JSON array of `{method: "task.save", ...}`.
- ✅ Required common params: `api`, `requestid`, `clienttime`, `authtoken`, `appid`, `appversion`.
- ✅ Does the API still work for active accounts? Verified live against author's account.

Still open:

- Rate limits / quota — not documented. Will surface from error responses if hit.
