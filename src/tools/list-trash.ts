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
      "Returns items the user has thrown into Trash (state=6) — soft-deleted tasks and projects, still recoverable. Each item carries a `type` field (\"task\" or \"project\").",
    state: TaskState.Trashed,
  });
}
