import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { RateLimiterMetrics } from "../rate-limiter/rate-limiter.js";
import { LinearIssueResponse } from "../client/types.js";
import { LinearMCPClient } from "../client/linear-mcp-client.js";
import {
  AddCommentArgsSchema,
  CreateIssueArgsSchema,
  CreateMilestoneArgsSchema,
  CreateDocumentArgsSchema,
  GetLabelsArgsSchema,
  GetProjectArgsSchema,
  ListProjectsArgsSchema,
  GetUserIssuesArgsSchema,
  SearchIssuesArgsSchema,
  UpdateIssueArgsSchema,
  GetViewerArgsSchema,
  ListTeamsArgsSchema,
} from "../client/zod-schemas.js";
import { z } from "zod";
import { MCPMetricsResponse } from "./types.js";
import { Document, ProjectMilestone, ProjectUpdate, Team } from "@linear/sdk";

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

      case "linear_get_project": {
        const validatedArgs = GetProjectArgsSchema.parse(args);
        const project = await linearClient.getProject(validatedArgs);

        // Format the milestones section
        const milestonesText =
          project.mileestones?.length > 0
            ? `\n  Milestones (${project.mileestones.length}):\n${project.mileestones
                .map(
                  (milestone: any) =>
                    `    - [${milestone.id}] ${milestone.title} (${milestone.progress}%)`
                )
                .join("\n")}`
            : "\n  Milestones: None";

        // Format the updates section
        const updatesText =
          project.updates && project.updates.length > 0
            ? `\n  Recent Updates (${project.updates.length}):\n${project.updates
                .map(
                  (update: ProjectUpdate) =>
                    `    - ${new Date(update.createdAt).toLocaleDateString()} (${update.url})`
                )
                .join("\n")}`
            : "\n  Updates: None";

        // Format the documents section
        const documentsText =
          project.documents && project.documents.length > 0
            ? `\n  Documents (${project.documents.length}):\n${project.documents
                .map((doc: Document) => `    - ${doc.title} (${doc.url})`)
                .join("\n")}`
            : "\n  Documents: None";

        return {
          content: [
            {
              type: "text",
              text: `Project: ${project.name}\nDescription: ${project.description || "None"}\nURL: ${project.url}\nOverview URL: ${project.overview}${milestonesText}${updatesText}${documentsText}`,
              metadata: project.metadata || baseResponse,
            },
          ],
        };
      }

      case "linear_create_milestone": {
        const validatedArgs = CreateMilestoneArgsSchema.parse(args);
        const milestone = await linearClient.createMilestone(validatedArgs);

        const targetDateText = milestone.targetDate
          ? `\nTarget Date: ${new Date(milestone.targetDate).toLocaleDateString()}`
          : "";

        return {
          content: [
            {
              type: "text",
              text: `Created milestone: ${milestone.name}\nID: ${milestone.id}${targetDateText}\nDescription: ${milestone.description || "None"}`,
              metadata: milestone.metadata || baseResponse,
            },
          ],
        };
      }

      case "linear_create_document": {
        const validatedArgs = CreateDocumentArgsSchema.parse(args);
        const document = await linearClient.createDocument(validatedArgs);

        return {
          content: [
            {
              type: "text",
              text: `Created document: ${document.title}\nProject: ${document.projectName}\nURL: ${document.url}\n\nYou can view and edit this document in Linear using the link above.`,
              metadata: document.metadata || baseResponse,
            },
          ],
        };
      }

      case "linear_get_viewer": {
        const validatedArgs = GetViewerArgsSchema.parse(args);
        const viewer = await linearClient.getViewer();

        // Format the teams in a readable way
        const teamsText =
          viewer.teams.length > 0
            ? `\nTeams:\n${viewer.teams.map((team: Team) => `- ${team.name} (${team.key}) (id: ${team.id})`).join("\n")}`
            : "\nTeams: None";

        return {
          content: [
            {
              type: "text",
              text: `User: ${viewer.name}\nEmail: ${viewer.email}\nAdmin: ${viewer.admin ? "Yes" : "No"}\nOrganization: ${viewer.organization.name}${teamsText}`,
              metadata: baseResponse,
            },
          ],
        };
      }

      case "linear_list_teams": {
        const validatedArgs = ListTeamsArgsSchema.parse(args);
        const { teams, metadata } = await linearClient.listTeams(validatedArgs);

        return {
          content: [
            {
              type: "text",
              text: `Found ${teams.length} teams:\n${teams
                .map((team) => {
                  return `- ${team.name} (${team.key})\n  ID: ${team.id}\n  Description: ${team.description || "None"}\n  Members: ${team.membersCount}`;
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
