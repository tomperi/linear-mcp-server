import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const createIssueTool: Tool = {
  name: "linear_create_issue",
  description:
    "Creates a new Linear issue with specified details. Use this to create tickets for tasks, bugs, or feature requests. Returns the created issue's identifier and URL. Required fields are title and teamId, with optional description, priority (0-4, where 0 is no priority and 1 is urgent), status, estimate (0-5, where 0 is no estimate, and 5 is the maximum estimate), and labels.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Issue title" },
      teamId: { type: "string", description: "Team ID" },
      description: { type: "string", description: "Issue description" },
      priority: { type: "number", description: "Priority (0-4)" },
      status: { type: "string", description: "Issue status" },
      estimate: { type: "number", description: "Issue estimate points" },
      labelIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of label IDs to attach to the issue",
      },
    },
    required: ["title", "teamId"],
  },
};

export const updateIssueTool: Tool = {
  name: "linear_update_issue",
  description:
    "Updates an existing Linear issue's properties. Use this to modify issue details like title, description, priority, or status. Requires the issue ID and accepts any combination of updatable fields. Returns the updated issue's identifier and URL.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Issue ID" },
      title: { type: "string", description: "New title" },
      description: { type: "string", description: "New description" },
      priority: { type: "number", description: "New priority (0-4)" },
      status: { type: "string", description: "New status" },
    },
    required: ["id"],
  },
};

export const searchIssuesTool: Tool = {
  name: "linear_search_issues",
  description:
    "Searches Linear issues using flexible criteria. Supports filtering by any combination of: title/description text, team, status, assignee, labels, priority (1=urgent, 2=high, 3=normal, 4=low), estimate, project ID, and milestone ID. Returns up to 10 issues by default (configurable via limit).",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Optional text to search in title and description",
      },
      teamId: { type: "string", description: "Filter by team ID" },
      status: {
        type: "string",
        description: "Filter by status name (e.g., 'In Progress', 'Done')",
      },
      assigneeId: {
        type: "string",
        description: "Filter by assignee's user ID",
      },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Filter by label names",
      },
      priority: {
        type: "number",
        description: "Filter by priority (1=urgent, 2=high, 3=normal, 4=low)",
      },
      estimate: {
        type: "number",
        description: "Filter by estimate points",
      },
      projectId: {
        type: "string",
        description: "Filter by project ID",
      },
      milestoneId: {
        type: "string",
        description: "Filter by project milestone ID",
      },
      includeArchived: {
        type: "boolean",
        description: "Include archived issues in results (default: false)",
      },
      limit: {
        type: "number",
        description: "Max results to return (default: 10)",
      },
    },
  },
};

export const getUserIssuesTool: Tool = {
  name: "linear_get_user_issues",
  description:
    "Retrieves issues assigned to a specific user or the authenticated user if no userId is provided. Returns issues sorted by last updated, including priority, status, and other metadata. Useful for finding a user's workload or tracking assigned tasks.",
  inputSchema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description:
          "Optional user ID. If not provided, returns authenticated user's issues",
      },
      includeArchived: {
        type: "boolean",
        description: "Include archived issues in results",
      },
      limit: {
        type: "number",
        description: "Maximum number of issues to return (default: 50)",
      },
    },
  },
};

export const addCommentTool: Tool = {
  name: "linear_add_comment",
  description:
    "Adds a comment to an existing Linear issue. Supports markdown formatting in the comment body. Can optionally specify a custom user name and avatar for the comment. Returns the created comment's details including its URL.",
  inputSchema: {
    type: "object",
    properties: {
      issueId: { type: "string", description: "ID of the issue to comment on" },
      body: { type: "string", description: "Comment text in markdown format" },
      createAsUser: {
        type: "string",
        description: "Optional custom username to show for the comment",
      },
      displayIconUrl: {
        type: "string",
        description: "Optional avatar URL for the comment",
      },
    },
    required: ["issueId", "body"],
  },
};

export const getLabelsTool: Tool = {
  name: "linear_get_labels",
  description:
    "Retrieves all available issue labels in the Linear workspace. Labels can be used to categorize and filter issues. Returns a list of labels with their IDs and names. Useful for discovering valid label options when creating or updating issues.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of labels to return (default: 100)",
      },
    },
  },
};

export const listProjectsTool: Tool = {
  name: "linear_list_projects",
  description: "Retrieves projects from Linear with basic information.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of projects to return (default: 5)",
      },
    },
  },
};

export const getProjectTool: Tool = {
  name: "linear_get_project",
  description:
    "Retrieves a single project from Linear with detailed information including milestones, updates, and documents. For the project, fetches milestones (limited to 10), recent updates (limited to 5), and related documents (limited to 10). To get issues associated with a project, use linear_search_issues with the projectId parameter. Useful for getting comprehensive details about a specific project and its progress.",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "ID of the project to fetch",
      },
    },
    required: ["projectId"],
  },
};

export const createMilestoneTool: Tool = {
  name: "linear_create_milestone",
  description:
    "Creates a new milestone for a specific project in Linear. Milestones help track progress toward major goals or releases. Required fields are projectId and name. Optional fields include description and targetDate.",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "ID of the project to create the milestone for",
      },
      name: {
        type: "string",
        description: "Name of the milestone",
      },
      description: {
        type: "string",
        description: "Optional description of the milestone",
      },
      targetDate: {
        type: "string",
        description:
          "Optional target date for milestone completion (ISO format date string, e.g., '2023-12-31')",
      },
    },
    required: ["projectId", "name"],
  },
};
