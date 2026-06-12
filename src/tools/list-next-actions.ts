import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerListNextActions(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "list_next_actions",
    title: "List Nirvana Next Actions",
    description:
      "Returns tasks marked as Next Actions in Nirvana (state=1) — concrete, actionable next steps the user has committed to.",
    state: TaskState.Next,
  });
}
