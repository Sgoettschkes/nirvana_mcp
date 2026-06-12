#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { NirvanaClient } from "./nirvana/client.js";
import { registerGetInbox } from "./tools/get-inbox.js";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    process.stderr.write(`Missing required env var: ${name}\n`);
    process.exit(1);
  }
  return v;
}

const appId = requireEnv("NIRVANA_APP_ID");
const authToken = requireEnv("NIRVANA_AUTH_TOKEN");

const client = new NirvanaClient({ appId, authToken });

const server = new McpServer({
  name: "nirvana-mcp",
  version: "0.0.1",
});

registerGetInbox(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
