import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TaskType, parseTagString, type NirvanaTask } from "../nirvana/types.js";

interface TaskListItem {
  id: string;
  name: string;
  note: string;
  tags: string[];
}

function toItem(task: NirvanaTask): TaskListItem {
  return {
    id: task.id,
    name: task.name,
    note: task.note,
    tags: parseTagString(task.tags ?? ""),
  };
}

export interface StateFilteredToolConfig {
  name: string;
  title: string;
  description: string;
  state: number;
}

export function registerStateFilteredTool(
  server: McpServer,
  client: NirvanaClient,
  config: StateFilteredToolConfig,
): void {
  server.registerTool(
    config.name,
    {
      title: config.title,
      description: config.description,
      inputSchema: {},
    },
    async () => {
      const data = await client.everything();
      const items = data.results
        .map((r) => r.task)
        .filter((t): t is NirvanaTask => t != null)
        .filter(
          (t) =>
            Number(t.type) === TaskType.Task &&
            Number(t.state) === config.state,
        )
        .map(toItem);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(items, null, 2),
          },
        ],
      };
    },
  );
}
