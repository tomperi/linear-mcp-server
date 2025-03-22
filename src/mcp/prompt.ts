import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const serverPrompt: Prompt = {
  name: "linear-server-prompt",
  description: "Instructions for using the Linear MCP server effectively",
  instructions: `This server provides access to Linear, a project management tool. Use it to manage issues, track work, and coordinate with teams.
  
  Key capabilities:
  - Create and update issues: Create new tickets or modify existing ones with titles, descriptions, priorities, and team assignments.
  - Search functionality: Find issues across the organization using flexible search queries with team and user filters.
  - Team coordination: Access team-specific issues and manage work distribution within teams.
  - Issue tracking: Add comments and track progress through status updates and assignments.
  - Organization overview: View team structures and user assignments across the organization.
  - Label management: Retrieve available labels for categorizing and filtering issues.
  
  Tool Usage:
  - linear_create_issue:
    - use teamId from linear-organization: resource
    - priority levels: 1=urgent, 2=high, 3=normal, 4=low
    - status must match exact Linear workflow state names (e.g., "In Progress", "Done")
    - estimate allows setting story points or complexity values
    - labelIds takes an array of label IDs (use linear_get_labels to find valid IDs)
  
  - linear_update_issue:
    - get issue IDs from search_issues or linear-issue:/// resources
    - only include fields you want to change
    - status changes must use valid state IDs from the team's workflow
  
  - linear_search_issues:
    - combine multiple filters for precise results
    - use labels array for multiple tag filtering
    - query searches both title and description
    - returns max 10 results by default
  
  - linear_get_user_issues:
    - omit userId to get authenticated user's issues
    - useful for workload analysis and sprint planning
    - returns most recently updated issues first
  
  - linear_add_comment:
    - supports full markdown formatting
    - use displayIconUrl for bot/integration avatars
    - createAsUser for custom comment attribution
  
  - linear_get_labels:
    - retrieves all available issue labels in the workspace
    - useful for discovering valid label options when creating/updating issues
    - optional limit parameter (default: 100)
  
  - linear_get_projects:
    - retrieves detailed information about projects in the workspace
    - useful for getting an overview of ongoing projects
    - optional limit parameter (default: 5)
  
  - linear_get_project:
    - retrieves comprehensive details about a single project
    - includes recent updates (last 5), documents (up to 10), and issues (up to 30)
    - for each issue, includes status and assignee information
    - requires project ID (can be obtained from linear_list_projects)
    - useful for deep analysis of a specific project's progress
  
  Best practices:
  - When creating issues:
    - Write clear, actionable titles that describe the task well (e.g., "Implement user authentication for mobile app")
    - Include concise but appropriately detailed descriptions in markdown format with context and acceptance criteria
    - Set appropriate priority based on the context (1=critical to 4=nice-to-have)
    - Always specify the correct team ID (default to the user's team if possible)
    - Use appropriate labels to categorize issues (use linear_get_labels to discover available options)
    - Set estimate points when applicable to indicate complexity or effort required
  
  - When searching:
    - Use specific, targeted queries for better results (e.g., "auth mobile app" rather than just "auth")
    - Apply relevant filters when asked or when you can infer the appropriate filters to narrow results
  
  - When adding comments:
    - Use markdown formatting to improve readability and structure
    - Keep content focused on the specific issue and relevant updates
    - Include action items or next steps when appropriate
  
  - General best practices:
    - Fetch organization data first to get valid team IDs
    - Use search_issues to find issues for bulk operations
    - Include markdown formatting in descriptions and comments
  
  Resource patterns:
  - linear-issue:///{issueId} - Single issue details (e.g., linear-issue:///c2b318fb-95d2-4a81-9539-f3268f34af87)
  - linear-team:///{teamId}/issues - Team's issue list (e.g., linear-team:///OPS/issues)
  - linear-user:///{userId}/assigned - User assignments (e.g., linear-user:///USER-123/assigned)
  - linear-organization: - Organization for the current user
  - linear-viewer: - Current user context
  
  The server uses the authenticated user's permissions for all operations.`,
};
