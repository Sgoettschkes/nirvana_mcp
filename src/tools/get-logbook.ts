import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerGetLogbook(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "get_logbook",
    title: "Get Nirvana Logbook",
    description:
      "Returns completed tasks logged in Nirvana (state=7). Use this to review what the user finished.",
    state: TaskState.Logged,
  });
}
