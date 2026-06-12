import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import {
  TaskState,
  TaskType,
  parseTagString,
  type NirvanaTask,
} from "../nirvana/types.js";

interface InboxItem {
  id: string;
  name: string;
  note: string;
  tags: string[];
}

function toInboxItem(task: NirvanaTask): InboxItem {
  return {
    id: task.id,
    name: task.name,
    note: task.note,
    tags: parseTagString(task.tags ?? ""),
  };
}

export function registerGetInbox(
  server: McpServer,
  client: NirvanaClient,
): void {
  server.registerTool(
    "get_inbox",
    {
      title: "Get Nirvana Inbox",
      description:
        "Returns all uncompleted, non-trashed tasks currently in the Nirvana inbox (state=0).",
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
            Number(t.state) === TaskState.Inbox &&
            Number(t.completed) === 0,
        )
        .map(toInboxItem);

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
