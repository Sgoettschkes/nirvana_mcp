# nirvana-mcp

MCP server that exposes [NirvanaHQ](https://www.nirvanahq.com/) — the GTD task manager — to Claude Code and other MCP-compatible clients.

> Status: early. `get_inbox` is the only tool today. More read-only tools first, then writes. See [PLAN.md](./PLAN.md) for the roadmap.

## Install into Claude Code

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
| `get_inbox` | Returns all uncompleted, non-trashed tasks in the Nirvana inbox. |

## How it works

NirvanaHQ has an undocumented HTTP API at `https://api.nirvanahq.com`. This server:

1. Calls `auth.new` with your username and the MD5 of your password to obtain a long-lived auth token.
2. Calls the bulk `everything` endpoint and filters server-side state on the client to answer each tool.

Your password is hashed locally and never stored. Only the auth token is persisted (in your MCP client's config). Revoke it any time by changing your Nirvana password.

## Troubleshooting

- **`Nirvana API error 98: Invalid Login Details`** — wrong username/password.
- **`Missing required env var: NIRVANA_AUTH_TOKEN`** — run `nirvana-mcp login` first and put the token in your `claude mcp add` command.
- **Tool returns empty list when inbox isn't empty** — try `claude mcp remove nirvana && claude mcp add ...` to re-add with a fresh token; the old one may have been revoked.

## Development

```bash
git clone https://github.com/Sgoettschkes/nirvana_mcp
cd nirvana_mcp
asdf install                # installs the pinned Node version
npm install
cp .env.example .env        # then fill in NIRVANA_AUTH_TOKEN
npm run dev                 # runs the server against your account
npm run inspect             # opens MCP Inspector
```

## License

MIT
