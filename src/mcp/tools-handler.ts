import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { RateLimiterMetrics } from "../rate-limiter/rate-limiter.js";
import { LinearIssueResponse } from "../client/types.js";
import { LinearMCPClient } from "../client/linear-mcp-client.js";
import {
  AddCommentArgsSchema,
  CreateIssueArgsSchema,
  GetLabelsArgsSchema,
  ListProjectsArgsSchema,
  GetUserIssuesArgsSchema,
  SearchIssuesArgsSchema,
  UpdateIssueArgsSchema,
} from "../client/zod-schemas.js";
import { z } from "zod";
import { MCPMetricsResponse } from "./types.js";

export const handleToolRequest = async (
  request: CallToolRequest,
  linearClient: LinearMCPClient
) => {
  let metrics: RateLimiterMetrics = {
    totalRequests: 0,
    requestsInLastHour: 0,
    averageRequestTime: 0,
    queueLength: 0,
    lastRequestTime: Date.now(),
  };

  try {
    const { name, arguments: args } = request.params;
    if (!args) throw new Error("Missing arguments");

    metrics = linearClient.rateLimiter.getMetrics();

    const baseResponse: MCPMetricsResponse = {
      apiMetrics: {
        requestsInLastHour: metrics.requestsInLastHour,
        remainingRequests:
          linearClient.rateLimiter.requestsPerHour - metrics.requestsInLastHour,
        averageRequestTime: `${Math.round(metrics.averageRequestTime)}ms`,
        queueLength: metrics.queueLength,
      },
    };

    switch (name) {
      case "linear_create_issue": {
        const validatedArgs = CreateIssueArgsSchema.parse(args);
        const issue = await linearClient.createIssue(validatedArgs);
        return {
          content: [
            {
              type: "text",
              text: `Created issue ${issue.identifier}: ${issue.title}\nURL: ${issue.url}`,
              metadata: baseResponse,
            },
          ],
        };
      }

      case "linear_update_issue": {
        const validatedArgs = UpdateIssueArgsSchema.parse(args);
        const issue = await linearClient.updateIssue(validatedArgs);
        return {
          content: [
            {
              type: "text",
              text: `Updated issue ${issue.identifier}\nURL: ${issue.url}`,
              metadata: baseResponse,
            },
          ],
        };
      }

      case "linear_search_issues": {
        const validatedArgs = SearchIssuesArgsSchema.parse(args);
        const { issues, metadata } =
          await linearClient.searchIssues(validatedArgs);
        return {
          content: [
            {
              type: "text",
              text: `Found ${issues.length} issues:\n${issues
                .map(
                  (issue: LinearIssueResponse) =>
                    `- ${issue.identifier}: ${issue.title}\n  Priority: ${issue.priority || "None"}\n  Status: ${issue.status || "None"}\n  ${issue.url}`
                )
                .join("\n")}`,
              metadata,
            },
          ],
        };
      }

      case "linear_get_user_issues": {
        const validatedArgs = GetUserIssuesArgsSchema.parse(args);
        const issues = await linearClient.getUserIssues(validatedArgs);

        return {
          content: [
            {
              type: "text",
              text: `Found ${issues.length} issues:\n${issues
                .map(
                  (issue: LinearIssueResponse) =>
                    `- ${issue.identifier}: ${issue.title}\n  Priority: ${issue.priority || "None"}\n  Status: ${issue.stateName}\n  ${issue.url}`
                )
                .join("\n")}`,
              metadata: baseResponse,
            },
          ],
        };
      }

      case "linear_add_comment": {
        const validatedArgs = AddCommentArgsSchema.parse(args);
        const { comment, issue } = await linearClient.addComment(validatedArgs);

        return {
          content: [
            {
              type: "text",
              text: `Added comment to issue ${issue?.identifier}\nURL: ${comment.url}`,
              metadata: baseResponse,
            },
          ],
        };
      }

      case "linear_get_labels": {
        const validatedArgs = GetLabelsArgsSchema.parse(args);
        const labels = await linearClient.getLabels(validatedArgs);

        return {
          content: [
            {
              type: "text",
              text: `Found ${labels.length} labels:\n${labels
                .map((label) => `- ${label.name} (ID: ${label.id})`)
                .join("\n")}`,
              metadata: baseResponse,
            },
          ],
        };
      }

      case "linear_list_projects": {
        const validatedArgs = ListProjectsArgsSchema.parse(args);
        const { projects, metadata } =
          await linearClient.listProjects(validatedArgs);

        return {
          content: [
            {
              type: "text",
              text: `Found ${projects.length} projects:\n${projects
                .map((project: any) => {
                  return `- ${project.name}\n  ID: ${project.id}\n  Description: ${project.description || "None"}\n  URL: ${project.url}`;
                })
                .join("\n\n")}`,
              metadata: metadata || baseResponse,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error("Error executing tool:", error);

    const errorResponse: MCPMetricsResponse = {
      apiMetrics: {
        requestsInLastHour: metrics.requestsInLastHour,
        remainingRequests:
          linearClient.rateLimiter.requestsPerHour - metrics.requestsInLastHour,
        averageRequestTime: `${Math.round(metrics.averageRequestTime)}ms`,
        queueLength: metrics.queueLength,
      },
    };

    // If it's a Zod error, format it nicely
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path,
        message: err.message,
        code: "VALIDATION_ERROR",
      }));

      return {
        content: [
          {
            type: "text",
            text: {
              error: {
                type: "VALIDATION_ERROR",
                message: "Invalid request parameters",
                details: formattedErrors,
              },
            },
            metadata: {
              error: true,
              ...errorResponse,
            },
          },
        ],
      };
    }

    // For Linear API errors, try to extract useful information
    if (error instanceof Error && "response" in error) {
      return {
        content: [
          {
            type: "text",
            text: {
              error: {
                type: "API_ERROR",
                message: error.message,
                details: {
                  // @ts-ignore - response property exists but isn't in type
                  status: error.response?.status,
                  // @ts-ignore - response property exists but isn't in type
                  data: error.response?.data,
                },
              },
            },
            metadata: {
              error: true,
              ...errorResponse,
            },
          },
        ],
      };
    }

    // For all other errors
    return {
      content: [
        {
          type: "text",
          text: {
            error: {
              type: "UNKNOWN_ERROR",
              message: error instanceof Error ? error.message : String(error),
            },
          },
          metadata: {
            error: true,
            ...errorResponse,
          },
        },
      ],
    };
  }
};
