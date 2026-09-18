import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { RailsClient } from "./client/rails_client.js";
import { createToolRegistry } from "./registry.js";
import { createTenantContextFromToken } from "./security/auth_context.js";
import { normalizeError } from "./client/errors.js";

export function createDroneHubMcpServer(railsClient: RailsClient = new RailsClient()) {
  const registry = createToolRegistry(railsClient);

  const server = new Server(
    {
      name: "dronehub-mcp-adapter",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Discovery handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const toolList = Array.from(registry.values()).map((tool) => ({
      name: tool.name,
      description: `[Risk Level: ${tool.riskLevel}] ${tool.description}`,
      inputSchema: {
        type: "object",
        properties: (tool.parameters as any).shape
          ? Object.fromEntries(
              Object.entries((tool.parameters as any).shape).map(([key, schema]: [string, any]) => [
                key,
                {
                  type: schema._def.typeName === "ZodNumber" ? "number" : schema._def.typeName === "ZodBoolean" ? "boolean" : "string",
                  description: schema.description || "",
                },
              ])
            )
          : {},
      },
    }));

    return { tools: toolList };
  });

  // Call Tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = registry.get(name);

    if (!tool) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: {
                code: "TOOL_NOT_FOUND",
                message: `Tool '${name}' is not registered in DroneHub MCP Adapter V1.`,
              },
            }),
          },
        ],
      };
    }

    try {
      // Validate schema
      const parsed = tool.parameters.safeParse(args || {});
      if (!parsed.success) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: {
                  code: "INVALID_ARGUMENTS",
                  message: "Provided arguments failed strict schema validation.",
                  details: parsed.error.issues,
                },
              }),
            },
          ],
        };
      }

      // Establish authenticated TenantContext from environment / authorization metadata
      const token = process.env.DRONEHUB_API_TOKEN || process.env.OEST_API_TOKEN || "";
      const orgId = process.env.DRONEHUB_ORGANIZATION_ID || process.env.OEST_ORGANIZATION_ID;

      const tenantContext = createTenantContextFromToken(token, orgId);

      const result = await tool.execute(parsed.data, tenantContext);

      if ("error" in result) {
        return {
          isError: true,
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      const normalized = normalizeError(err);
      return {
        isError: true,
        content: [{ type: "text", text: JSON.stringify(normalized, null, 2) }],
      };
    }
  });

  return {
    server,
    registry,
    startStdio: async () => {
      const transport = new StdioServerTransport();
      await server.connect(transport);
    },
  };
}
