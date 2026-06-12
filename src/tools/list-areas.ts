import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TagType, type NirvanaTag } from "../nirvana/types.js";

interface AreaItem {
  name: string;
  color?: string;
}

function toItem(tag: NirvanaTag): AreaItem {
  const color = typeof tag.color === "string" ? tag.color : "";
  return color ? { name: tag.key, color } : { name: tag.key };
}

export function registerListAreas(
  server: McpServer,
  client: NirvanaClient,
): void {
  server.registerTool(
    "list_areas",
    {
      title: "List Nirvana Areas",
      description:
        "Returns the user's Areas in Nirvana — high-level life domains (e.g. 'work', 'personal') that group projects and tasks. Areas are the top-level organizing dimension.",
      inputSchema: {},
    },
    async () => {
      const data = await client.everything();
      const items = data.results
        .map((r) => r.tag)
        .filter((t): t is NirvanaTag => t != null)
        .filter(
          (t) =>
            Number(t.type) === TagType.Area && Number(t.deleted ?? 0) === 0,
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
