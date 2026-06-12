import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskState, TaskType } from "../nirvana/types.js";
import { registerTaskListTool } from "./state-filter.js";

export function registerListProjects(
  server: McpServer,
  client: NirvanaClient,
): void {
  registerTaskListTool(server, client, {
    name: "list_projects",
    title: "List Nirvana Projects",
    description:
      "Returns the user's active projects in Nirvana (state=11). Projects are containers that group related tasks under a shared outcome.",
    filter: (t) =>
      Number(t.type) === TaskType.Project &&
      Number(t.state) === TaskState.ActiveProject,
  });
}
