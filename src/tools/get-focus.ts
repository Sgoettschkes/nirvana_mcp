import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState, TaskType } from "../nirvana/types.js";
import { registerTaskListTool } from "./state-filter.js";

const INACTIVE_STATES = new Set<number>([
  TaskState.Trashed,
  TaskState.Logged,
  TaskState.Deleted,
]);

export function registerGetFocus(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerTaskListTool(server, client, {
    name: "get_focus",
    title: "Get Nirvana Focus",
    description:
      "Returns tasks the user has flagged for Focus in Nirvana (seqt > 0), excluding completed or trashed items. These are what the user is actively prioritizing right now.",
    filter: (t) =>
      Number(t.type) === TaskType.Task &&
      Number(t.seqt) > 0 &&
      !INACTIVE_STATES.has(Number(t.state)),
  });
}
