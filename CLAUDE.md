# nirvana_mcp

MCP server exposing NirvanaHQ (GTD task manager) to Claude.

**Full roadmap and tool inventory:** see [PLAN.md](./PLAN.md). Consult it before starting work on a new phase or tool.

## Stack

- TypeScript, Node ≥ 20 (pinned to a specific version via `.tool-versions` for asdf), ES modules (`"type": "module"`)
- `@modelcontextprotocol/sdk` — high-level `McpServer` API
- `zod` — input schemas for tools that take arguments (e.g. `get_project`). The SDK accepts a `ZodRawShape` and validates on the way in.
- stdio transport
- Distributed via npx as `@sgoettschkes/nirvana-mcp`; published from GitHub Actions via npm Trusted Publishing (OIDC). No `NPM_TOKEN` secret.

## Project layout

```
src/
  index.ts          # CLI dispatcher: server | login | help
  login-command.ts  # interactive auth.new flow for end users
  nirvana/
    client.ts       # auth + HTTP wrapper around api.nirvanahq.com
    types.ts        # Task, Project, Tag, Area
  tools/            # one file per MCP tool
```

## CLI

The published `nirvana-mcp` binary has two modes:
- `nirvana-mcp` — start MCP server on stdio (used by Claude Code via `claude mcp add`).
- `nirvana-mcp login` — prompt for username + password (TTY required), POST `auth.new`, print the token to stdout.

## Env vars

- `NIRVANA_AUTH_TOKEN` — required by the server. That's it — no other config knobs.

## Nirvana API reference

Verified against community client implementations: [meeech/nirv](https://github.com/meeech/nirv) (Ruby) and [mikesimons/nibbana](https://github.com/mikesimons/nibbana) (CoffeeScript). The API has no official documentation.

### Base URL & common params

- **Base URL:** `https://api.nirvanahq.com/`
- **Common URL params on every call:**
  - `api`: `"rest"` for single calls, `"json"` for batch (array body)
  - `requestid`: UUID v4, fresh per request
  - `clienttime`: unix timestamp (seconds)
  - `authtoken`: token returned by login (omit for `auth.new`)
  - `appid`: arbitrary application identifier (we use `"nirvana-mcp"`)
  - `appversion`: numeric version

### Authentication

`POST https://api.nirvanahq.com/?api=rest&...` with form-encoded body:
```
method=auth.new&u={username}&p={md5(password)}&gmtoffset={hours_from_utc}
```
`p` is the **MD5 hex digest of the password**, not the plaintext. Server returns error 98 "Invalid Login Details" if plaintext is sent. Response:
```json
{ "results": [ { "auth": { "token": "..." } } ] }
```
Cache the token; reuse across sessions.

### Read — `everything`

`GET https://api.nirvanahq.com/?api=rest&appid=...&authtoken=...&method=everything&since={unix_ts}` (use `since=0` for full snapshot). Response:
```json
{ "results": [ {"task": {...}}, {"tag": {...}}, {"user": {...}} ] }
```
All filtering (Inbox vs Next, by tag/area, etc.) happens client-side.

### Write — `task.save` / `tag.save`

`POST https://api.nirvanahq.com/?api=json&appid=...&authtoken=...` with JSON array body:
```json
[{ "method": "task.save", "id": "uuid", "state": 0, "_state": 1718200000, ... }]
```
Every modifiable field has a matching `_field` modification timestamp used for conflict resolution. Always set both.

### Error handling

The API returns HTTP 200 even for app-level errors. Always check `response.results[0].error` → `{code, message}` and surface it.

### Task fields

`id` (UUID), `type` (0=task, 1=project), `state`, `parentid`, `name`, `note`, `tags` (string in form `,a,b,c,`), `waitingfor`, `completed` (unix ts or 0), `cancelled`, `seq` / `seqp` / `seqt` (ordering; `seqt > 0` = focused), `ps`, `etime` (estimated minutes), `energy`, `startdate` / `duedate` (`YYYYMMDD`), `recurring` (object or null).

### Task `state` values

| Value | Meaning  | Value | Meaning |
|-------|----------|-------|---------|
| 0     | Inbox    | 6     | Trashed |
| 1     | Next     | 7     | Logged  |
| 2     | Waiting  | 8     | Deleted |
| 3     | Scheduled| 9     | Recurring |
| 4     | Someday  | 11    | Active project |
| 5     | Later    |       |         |

### Tag `type` values

| Value | Meaning |
|-------|---------|
| 0     | Tag     |
| 1     | Area    |
| 2     | Contact |
| 3     | Context |

## Conventions

- Read-only tools ship before write tools (see PLAN.md priority tables).
- Destructive writes (`delete_task`, `purge_task`) require explicit confirmation in the tool description so the model gates them.
- Secrets only via env vars (see above). Never hard-code; never log the token.
- Validate every tool with `npx @modelcontextprotocol/inspector node dist/index.js` before declaring it done.
