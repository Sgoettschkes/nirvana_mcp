import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerListInbox(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "list_inbox",
    title: "List Nirvana Inbox",
    description:
      "Returns items in the Nirvana Inbox (state=0) — unprocessed tasks and projects the user hasn't categorized yet. Each item carries a `type` field (\"task\" or \"project\").",
    state: TaskState.Inbox,
  });
}
