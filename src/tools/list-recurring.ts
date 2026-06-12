import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerListRecurring(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "list_recurring",
    title: "List Nirvana Recurring",
    description:
      "Returns the user's recurring task templates in Nirvana (state=9). These are the rules that spawn task instances on a schedule, not individual occurrences.",
    state: TaskState.Recurring,
  });
}
