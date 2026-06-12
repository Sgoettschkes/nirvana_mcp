import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState, TaskType } from "../nirvana/types.js";
import { registerTaskListTool } from "./state-filter.js";

export function registerListReferences(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerTaskListTool(server, client, {
    name: "list_references",
    title: "List Nirvana References",
    description:
      "Returns the user's Reference items in Nirvana (type=3, state=10) — non-actionable notes / information / lookup material the user wants to keep around but isn't a task to be done.",
    filter: (t) =>
      Number(t.type) === TaskType.Reference &&
      Number(t.state) === TaskState.Reference,
  });
}
