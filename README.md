# nirvana-mcp

MCP server that exposes [NirvanaHQ](https://www.nirvanahq.com/) — the GTD task manager — to Claude Code and other MCP-compatible clients.

> Status: 17 read-only tools shipped (see [docs/tools.html](./docs/tools.html) for the full reference). Writes are next. See [PLAN.md](./PLAN.md) for the roadmap.

## Install into Claude Code

**Prerequisites:** Node.js 20 or newer (ships with `npx`) and the [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code). Nothing needs to be cloned or globally installed — `npx -y` downloads the package on demand.

```bash
# 1. Get a Nirvana auth token. Prompts for username + password.
npx -y @sgoettschkes/nirvana-mcp login

# 2. Install the server. Paste the token from step 1.
claude mcp add nirvana \
  --env NIRVANA_AUTH_TOKEN=<paste-token-here> \
  -- npx -y @sgoettschkes/nirvana-mcp

# 3. Restart Claude Code, then ask: "What's in my Nirvana inbox?"
```

To remove: `claude mcp remove nirvana`.

## Tools

| Tool | Description |
|---|---|
| `list_inbox` | Tasks in the Inbox (state=0) — unprocessed items not yet categorized. |
| `list_next_actions` | Tasks marked Next (state=1) — concrete, actionable next steps. |
| `list_waiting_for` | Tasks Waiting on someone else (state=2). |
| `list_scheduled` | Tasks deferred to a future start date (state=3). |
| `list_someday` | Tasks parked in Someday/Maybe (state=4). |
| `list_later` | Tasks in the Later list (state=5) — between Next and Someday. |
| `list_trash` | Soft-deleted tasks (state=6), still recoverable. |
| `list_logbook` | Completed tasks (state=7) — currently returns all-time history. |
| `list_recurring` | Recurring task templates (state=9) — the rules, not individual occurrences. |
| `list_focus` | Tasks flagged for Focus (`seqt > 0`), excluding completed/trashed items. |
| `list_projects` | Active projects (`type=1`, `state=11`). |
| `get_project` | One project plus its direct children (tasks and sub-projects). Identify by `id` or `name`. |
| `list_areas` | High-level life domains (e.g. "work", "personal"). |
| `list_tags` | Plain tags + contacts (with a `kind` field). In current Nirvana, GTD contexts are stored as plain tags. |
| `list_reference_lists` | Reference Lists (`type=3`, `state=10`) — top-level containers for non-actionable notes / lookup material. |
| `get_reference_list` | One Reference List plus all its items. Identify by `id` or `name`. |
| `search_tasks` | Filter tasks by `text` (name+note substring), `tag`, `area`, and/or `state`. At least one filter required. |

## How it works

NirvanaHQ has an undocumented HTTP API at `https://api.nirvanahq.com`. This server:

1. Calls `auth.new` with your username and the MD5 of your password to obtain a long-lived auth token.
2. Calls the bulk `everything` endpoint and filters the result client-side to answer each tool.

Your password is hashed locally and never stored. Only the auth token is persisted (in your MCP client's config). Revoke it any time by changing your Nirvana password.

## Troubleshooting

- **`Nirvana API error 98: Invalid Login Details`** — wrong username/password.
- **`Missing required env var: NIRVANA_AUTH_TOKEN`** — run `nirvana-mcp login` first and put the token in your `claude mcp add` command.
- **`Nirvana API error` from a tool call** — your token was probably revoked (changing your Nirvana password does this). Re-run `nirvana-mcp login`, then `claude mcp remove nirvana && claude mcp add ...` with the new token.

## Development

```bash
git clone https://github.com/Sgoettschkes/nirvana_mcp
cd nirvana_mcp
asdf install                # installs the pinned Node version
npm install
cp .env.example .env        # creates .env with an empty NIRVANA_AUTH_TOKEN

npm run login               # prompts for username + password,
                            # prints an auth token. Paste it as
                            # NIRVANA_AUTH_TOKEN in .env.

npm run dev                 # runs the server against your account
npm run inspect             # builds, then opens MCP Inspector
```

When verifying the published install from *inside* this repo, the `package.json` name collides with the npm package, and `npx -y @sgoettschkes/nirvana-mcp …` will fail with `command not found`. Run from a different directory (`cd ~ && npx …`) or use the explicit form: `npx -y --package=@sgoettschkes/nirvana-mcp nirvana-mcp …`.

## License

MIT
