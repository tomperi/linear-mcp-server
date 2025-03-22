#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { serverPrompt } from "./mcp/prompt.js";
import { LinearMCPClient } from "./client/linear-mcp-client.js";
import {
  addCommentTool,
  createIssueTool,
  getLabelsTool,
  getProjectTool,
  listProjectsTool,
  getUserIssuesTool,
  searchIssuesTool,
  updateIssueTool,
} from "./mcp/tools.js";
import { handleToolRequest } from "./mcp/tools-handler.js";

const resourceTemplates: ResourceTemplate[] = [
  {
    uriTemplate: "linear-issue:///{issueId}",
    name: "Linear Issue",
    description:
      "A Linear issue with its details, comments, and metadata. Use this to fetch detailed information about a specific issue.",
    parameters: {
      issueId: {
        type: "string",
        description:
          "The unique identifier of the Linear issue (e.g., the internal ID)",
      },
    },
    examples: ["linear-issue:///c2b318fb-95d2-4a81-9539-f3268f34af87"],
  },
  {
    uriTemplate: "linear-viewer:",
    name: "Current User",
    description:
      "Information about the authenticated user associated with the API key, including their role, teams, and settings.",
    parameters: {},
    examples: ["linear-viewer:"],
  },
  {
    uriTemplate: "linear-organization:",
    name: "Current Organization",
    description:
      "Details about the Linear organization associated with the API key, including settings, teams, and members.",
    parameters: {},
    examples: ["linear-organization:"],
  },
  {
    uriTemplate: "linear-team:///{teamId}/issues",
    name: "Team Issues",
    description:
      "All active issues belonging to a specific Linear team, including their status, priority, and assignees.",
    parameters: {
      teamId: {
        type: "string",
        description:
          "The unique identifier of the Linear team (found in team settings)",
      },
    },
    examples: ["linear-team:///TEAM-123/issues"],
  },
  {
    uriTemplate: "linear-user:///{userId}/assigned",
    name: "User Assigned Issues",
    description:
      "Active issues assigned to a specific Linear user. Returns issues sorted by update date.",
    parameters: {
      userId: {
        type: "string",
        description:
          "The unique identifier of the Linear user. Use 'me' for the authenticated user",
      },
    },
    examples: [
      "linear-user:///USER-123/assigned",
      "linear-user:///me/assigned",
    ],
  },
];

async function main() {
  try {
    dotenv.config();

    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      console.error("LINEAR_API_KEY environment variable is required");
      process.exit(1);
    }

    console.error("Starting Linear MCP Server...");
    const linearClient = new LinearMCPClient(apiKey);

    const server = new Server(
      {
        name: "linear-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          prompts: {
            default: serverPrompt,
          },
          resources: {
            templates: true,
            read: true,
          },
          tools: {},
        },
      }
    );

    server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const { issues, metadata } = await linearClient.listIssues();
      return {
        resources: issues,
        metadata,
      };
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = new URL(request.params.uri);
      const path = uri.pathname.replace(/^\//, "");

      if (uri.protocol === "linear-organization") {
        const organization = await linearClient.getOrganization();
        return {
          contents: [
            {
              uri: "linear-organization:",
              mimeType: "application/json",
              text: JSON.stringify(organization, null, 2),
            },
          ],
        };
      }

      if (uri.protocol === "linear-viewer") {
        const viewer = await linearClient.getViewer();
        return {
          contents: [
            {
              uri: "linear-viewer:",
              mimeType: "application/json",
              text: JSON.stringify(viewer, null, 2),
            },
          ],
        };
      }

      if (uri.protocol === "linear-issue:") {
        const issue = await linearClient.getIssue(path);
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: "application/json",
              text: JSON.stringify(issue, null, 2),
            },
          ],
        };
      }

      if (uri.protocol === "linear-team:") {
        const [teamId] = path.split("/");
        const issues = await linearClient.getTeamIssues(teamId);
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: "application/json",
              text: JSON.stringify(issues, null, 2),
            },
          ],
        };
      }

      if (uri.protocol === "linear-user:") {
        const [userId] = path.split("/");
        const issues = await linearClient.getUserIssues({
          userId: userId === "me" ? undefined : userId,
        });
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: "application/json",
              text: JSON.stringify(issues, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unsupported resource URI: ${request.params.uri}`);
    });

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        createIssueTool,
        updateIssueTool,
        searchIssuesTool,
        getUserIssuesTool,
        addCommentTool,
        getLabelsTool,
        listProjectsTool,
        getProjectTool,
      ],
    }));

    server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
      return {
        resourceTemplates: resourceTemplates,
      };
    });

    server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [serverPrompt],
      };
    });

    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name === serverPrompt.name) {
        return {
          prompt: serverPrompt,
        };
      }
      throw new Error(`Prompt not found: ${request.params.name}`);
    });

    server.setRequestHandler(CallToolRequestSchema, (request) =>
      handleToolRequest(request, linearClient)
    );

    const transport = new StdioServerTransport();
    console.error("Connecting server to transport...");
    await server.connect(transport);
    console.error("Linear MCP Server running on stdio");
  } catch (error) {
    console.error(
      `Fatal error in main(): ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(
    "Fatal error in main():",
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
});
