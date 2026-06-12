# nirvana_mcp

MCP server exposing NirvanaHQ (GTD task manager) to Claude.

**Full roadmap and tool inventory:** see [PLAN.md](./PLAN.md). Consult it before starting work on a new phase or tool.

## Stack

- TypeScript, Node ≥ 20, ES modules (`"type": "module"`)
- `@modelcontextprotocol/sdk` — high-level `McpServer` API
- `zod` for tool input schemas
- stdio transport
- Distributed via npx as `@sgoettschkes/nirvana-mcp`

## Project layout

```
src/
  index.ts          # MCP server bootstrap
  nirvana/
    client.ts       # auth + HTTP wrapper around api.nirvanahq.com
    types.ts        # Task, Project, Tag, Area
  tools/            # one file per MCP tool
```

## Nirvana API reference

- **Base URL:** `https://api.nirvanahq.com`
- **Required params on every call:** `api`, `requestid` (UUID), `clienttime` (unix seconds), `authtoken` (MD5), `appid`, `appversion`
- **Read:** single bulk `everything` endpoint — fetch once, filter client-side
- **Write:** `task.save` (POST) for tasks/projects, `tag.save` (POST) for tags/areas/contexts/contacts

### Task `state` values

| Value | Meaning  | Value | Meaning |
|-------|----------|-------|---------|
| 0     | Inbox    | 6     | Trashed |
| 1     | Next     | 7     | Logged  |
| 2     | Waiting  | 8     | Deleted |
| 3     | Scheduled| 9     | Recurring |
| 4     | Someday  | 11    | Active project |
| 5     | Later    |       |         |

### Caveat

The API was announced in 2009 and never officially relaunched. Endpoint names and auth flow above come from community docs and may need verification by inspecting the live web app before being trusted in code.

## Conventions

- Read-only tools ship before write tools (see PLAN.md priority tables).
- Destructive writes (`delete_task`, `purge_task`) require explicit confirmation in the tool description so the model gates them.
- Secrets only via env vars: `NIRVANA_APP_ID`, `NIRVANA_AUTH_TOKEN`. Never hard-code; never log.
- Validate every tool with `npx @modelcontextprotocol/inspector node dist/index.js` before declaring it done.
