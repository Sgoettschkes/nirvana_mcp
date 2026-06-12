#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { NirvanaClient } from "./nirvana/client.js";
import { registerGetInbox } from "./tools/get-inbox.js";
import { runLogin } from "./login-command.js";

const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "..", "package.json");
const VERSION = (JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string }).version;

function printUsage(): void {
  process.stderr.write(
    [
      `nirvana-mcp ${VERSION}`,
      "",
      "Usage:",
      "  nirvana-mcp            Start the MCP server (stdio).",
      "  nirvana-mcp login      Exchange Nirvana credentials for an auth token.",
      "  nirvana-mcp --help     Show this message.",
      "",
    ].join("\n"),
  );
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    process.stderr.write(
      `Missing required env var: ${name}\n` +
        `Run "npx -y @sgoettschkes/nirvana-mcp login" to obtain a token.\n`,
    );
    process.exit(1);
  }
  return v;
}

async function runServer(): Promise<void> {
  const authToken = requireEnv("NIRVANA_AUTH_TOKEN");

  const client = new NirvanaClient(authToken);

  const server = new McpServer({
    name: "nirvana-mcp",
    version: VERSION,
  });

  registerGetInbox(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const subcommand = process.argv[2];

switch (subcommand) {
  case undefined:
    await runServer();
    break;
  case "login":
    await runLogin();
    break;
  case "--help":
  case "-h":
  case "help":
    printUsage();
    break;
  default:
    process.stderr.write(`Unknown subcommand: ${subcommand}\n\n`);
    printUsage();
    process.exit(1);
}
