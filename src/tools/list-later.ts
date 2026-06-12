import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerListLater(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "list_later",
    title: "List Nirvana Later",
    description:
      "Returns tasks in Nirvana's Later list (state=5) — things the user will definitely do, but not in the immediate Next queue. Sits between Next and Someday.",
    state: TaskState.Later,
  });
}
