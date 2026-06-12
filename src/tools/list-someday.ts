import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerListSomeday(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "list_someday",
    title: "List Nirvana Someday/Maybe",
    description:
      "Returns items parked in Nirvana's Someday list (state=4) — tasks and projects to revisit later but not actionable now. Each item carries a `type` field (\"task\" or \"project\").",
    state: TaskState.Someday,
  });
}
