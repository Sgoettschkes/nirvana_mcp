import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState, TaskType } from "../nirvana/types.js";
import { registerTaskListTool } from "./state-filter.js";

export function registerListReferenceLists(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerTaskListTool(server, client, {
    name: "list_reference_lists",
    title: "List Nirvana Reference Lists",
    description:
      "Returns the user's Reference Lists in Nirvana (type=3, state=10) — top-level containers for non-actionable notes / information / lookup material. Each list groups related reference items. Use `get_reference_list` to see the items inside one.",
    filter: (t) =>
      Number(t.type) === TaskType.ReferenceList &&
      Number(t.state) === TaskState.Reference,
  });
}
