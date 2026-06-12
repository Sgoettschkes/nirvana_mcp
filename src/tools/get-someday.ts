import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerGetSomeday(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "get_someday",
    title: "Get Nirvana Someday/Maybe",
    description:
      "Returns tasks parked in Nirvana's Someday list (state=4) — things to revisit later but not actionable now.",
    state: TaskState.Someday,
  });
}
