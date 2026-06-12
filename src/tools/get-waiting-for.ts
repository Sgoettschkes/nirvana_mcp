import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState } from "../nirvana/types.js";
import { registerStateFilteredTool } from "./state-filter.js";

export function registerGetWaitingFor(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerStateFilteredTool(server, client, {
    name: "get_waiting_for",
    title: "Get Nirvana Waiting For",
    description:
      "Returns tasks the user is Waiting on someone else for in Nirvana (state=2). Often blocked on a contact's response or delivery.",
    state: TaskState.Waiting,
  });
}
