import { z } from "zod";

export const CreateIssueArgsSchema = z.object({
  title: z.string().describe("Issue title"),
  teamId: z.string().describe("Team ID"),
  description: z.string().optional().describe("Issue description"),
  priority: z.number().min(0).max(4).optional().describe("Priority (0-4)"),
  status: z.string().optional().describe("Issue status"),
  estimate: z.number().optional().describe("Issue estimate points"),
  labelIds: z
    .array(z.string())
    .optional()
    .describe("Array of label IDs to attach to the issue"),
});

export const UpdateIssueArgsSchema = z.object({
  id: z.string().describe("Issue ID"),
  title: z.string().optional().describe("New title"),
  description: z.string().optional().describe("New description"),
  priority: z.number().optional().describe("New priority (0-4)"),
  status: z.string().optional().describe("New status"),
});

export const SearchIssuesArgsSchema = z.object({
  query: z
    .string()
    .optional()
    .describe("Optional text to search in title and description"),
  teamId: z.string().optional().describe("Filter by team ID"),
  status: z
    .string()
    .optional()
    .describe("Filter by status name (e.g., 'In Progress', 'Done')"),
  assigneeId: z.string().optional().describe("Filter by assignee's user ID"),
  labels: z.array(z.string()).optional().describe("Filter by label names"),
  priority: z
    .number()
    .optional()
    .describe("Filter by priority (1=urgent, 2=high, 3=normal, 4=low)"),
  estimate: z.number().optional().describe("Filter by estimate points"),
  includeArchived: z
    .boolean()
    .optional()
    .describe("Include archived issues in results (default: false)"),
  limit: z.number().optional().describe("Max results to return (default: 10)"),
  projectId: z.string().optional().describe("Filter by project ID"),
  milestoneId: z.string().optional().describe("Filter by project milestone ID"),
});

export const GetUserIssuesArgsSchema = z.object({
  userId: z
    .string()
    .optional()
    .describe(
      "Optional user ID. If not provided, returns authenticated user's issues"
    ),
  includeArchived: z
    .boolean()
    .optional()
    .describe("Include archived issues in results"),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of issues to return (default: 50)"),
});

export const AddCommentArgsSchema = z.object({
  issueId: z.string().describe("ID of the issue to comment on"),
  body: z.string().describe("Comment text in markdown format"),
  createAsUser: z
    .string()
    .optional()
    .describe("Optional custom username to show for the comment"),
  displayIconUrl: z
    .string()
    .optional()
    .describe("Optional avatar URL for the comment"),
});

export const GetLabelsArgsSchema = z.object({
  limit: z
    .number()
    .optional()
    .describe("Maximum number of labels to return (default: 100)"),
});

export const ListProjectsArgsSchema = z.object({
  limit: z
    .number()
    .optional()
    .describe("Maximum number of projects to return (default: 5)"),
});

export const GetProjectArgsSchema = z.object({
  projectId: z.string().describe("ID of the project to fetch"),
});

export const CreateMilestoneArgsSchema = z.object({
  projectId: z
    .string()
    .describe("ID of the project to create the milestone for"),
  name: z.string().describe("Name of the milestone"),
  description: z.string().optional().describe("Description of the milestone"),
  targetDate: z
    .string()
    .optional()
    .describe(
      "Target date for milestone completion (ISO format date string, e.g., '2023-12-31')"
    ),
});

export const CreateDocumentArgsSchema = z.object({
  projectId: z
    .string()
    .describe("ID of the project to associate the document with"),
  title: z.string().describe("Title of the document"),
  content: z.string().describe("Document content in markdown format"),
});
