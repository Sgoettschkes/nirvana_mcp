import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerListTrash(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "list_trash",
    title: "List Nirvana Trash",
    description:
      "Returns tasks the user has thrown into Trash (state=6). These are soft-deleted but recoverable — useful for finding something the user trashed but might want back.",
    state: TaskState.Trashed,
  });
}
