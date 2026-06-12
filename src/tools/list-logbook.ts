import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerListLogbook(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "list_logbook",
    title: "List Nirvana Logbook",
    description:
      "Returns completed tasks logged in Nirvana (state=7). Use this to review what the user finished.",
    state: TaskState.Logged,
  });
}
