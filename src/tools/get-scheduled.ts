import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerGetScheduled(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "get_scheduled",
    title: "Get Nirvana Scheduled",
    description:
      "Returns Scheduled tasks in Nirvana (state=3) — tasks deferred to a specific future start date.",
    state: TaskState.Scheduled,
  });
}
