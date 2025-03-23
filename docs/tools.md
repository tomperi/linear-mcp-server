# Linear MCP Server Tools

This document provides detailed information about all the tools available in the Linear MCP Server. These tools allow you to interact with Linear's issue tracking system through the Model Context Protocol (MCP).

## Table of Contents

- [Issue Management](#issue-management)
  - [linear_create_issue](#linear_create_issue)
  - [linear_update_issue](#linear_update_issue)
  - [linear_search_issues](#linear_search_issues)
  - [linear_get_user_issues](#linear_get_user_issues)
  - [linear_add_comment](#linear_add_comment)
- [Project Management](#project-management)
  - [linear_list_projects](#linear_list_projects)
  - [linear_get_project](#linear_get_project)
  - [linear_create_milestone](#linear_create_milestone)
  - [linear_create_document](#linear_create_document)
- [Organization](#organization)
  - [linear_get_labels](#linear_get_labels)
  - [linear_get_viewer](#linear_get_viewer)
  - [linear_list_teams](#linear_list_teams)

## Issue Management

### linear_create_issue

Creates a new Linear issue with specified details. Use this to create tickets for tasks, bugs, or feature requests.

**Required Parameters:**

- `title` (string): Issue title
- `teamId` (string): Team ID

**Optional Parameters:**

- `description` (string): Issue description with markdown support
- `priority` (number, 0-4): Priority level where:
  - 0: No priority
  - 1: Urgent
  - 2: High
  - 3: Normal
  - 4: Low
- `status` (string): Issue status (must match your Linear workflow state names)
- `estimate` (number, 0-5): Story points or complexity value
- `labelIds` (string[]): Array of label IDs to attach to the issue
- `projectId` (string): Project ID to associate the issue with
- `milestoneId` (string): Project milestone ID to link the issue to

**Example:**

```json
{
  "title": "Implement user authentication for mobile app",
  "teamId": "TEAM-123",
  "description": "## Requirements\n- Add login screen\n- Implement OAuth2 flow\n- Add session management\n\n## Acceptance Criteria\n- Users can log in with email & password\n- OAuth providers work (Google, GitHub)",
  "priority": 2,
  "estimate": 3,
  "labelIds": ["label-123", "label-456"]
}
```

**Example with Project and Milestone:**

```json
{
  "title": "Add payment integration to checkout flow",
  "teamId": "TEAM-123",
  "description": "Implement Stripe payment processing in the checkout flow",
  "priority": 1,
  "projectId": "project-456",
  "milestoneId": "milestone-789",
  "estimate": 4
}
```

**Best Practices:**

- Write clear, actionable titles
- Include detailed descriptions with context and acceptance criteria
- Set appropriate priority based on urgency and impact
- Use proper team IDs (get them from the `linear-organization:` resource)
- Add relevant labels for better categorization
- When associating with projects, use `linear_list_projects` to find available projects
- For milestone linking, use `linear_get_project` to find available milestones

### linear_update_issue

Updates an existing Linear issue's properties. Use this to modify issue details like title, description, priority, or status.

**Required Parameters:**

- `id` (string): Issue ID

**Optional Parameters:**

- `title` (string): New title
- `description` (string): New description
- `priority` (number, 0-4): New priority
- `status` (string): New status

**Example:**

```json
{
  "id": "issue-123",
  "title": "Updated title for authentication issue",
  "priority": 1,
  "status": "In Progress"
}
```

**Best Practices:**

- Only include fields you want to change
- Use status values that match your team's workflow states
- Get issue IDs from `linear_search_issues` or the `linear-issue:///` resource

### linear_search_issues

Searches Linear issues using flexible criteria. Supports filtering by various parameters.

**Optional Parameters:**

- `query` (string): Text to search in title and description
- `teamId` (string): Filter by team ID
- `status` (string): Filter by status name (e.g., 'In Progress', 'Done')
- `assigneeId` (string): Filter by assignee's user ID
- `labels` (array of strings): Filter by label names
- `priority` (number): Filter by priority
- `estimate` (number): Filter by estimate points
- `projectId` (string): Filter by project ID
- `milestoneId` (string): Filter by project milestone ID
- `includeArchived` (boolean): Include archived issues in results (default: false)
- `limit` (number): Max results to return (default: 10)

**Example:**

```json
{
  "query": "authentication mobile",
  "teamId": "TEAM-123",
  "status": "In Progress",
  "priority": 1,
  "projectId": "project-456",
  "limit": 5
}
```

**Best Practices:**

- Use specific, targeted queries for better results
- Combine multiple filters to narrow down results
- Use the `projectId` parameter to find issues for a specific project
- Use the `milestoneId` parameter to find issues for a specific milestone

### linear_get_user_issues

Retrieves issues assigned to a specific user or the authenticated user if no userId is provided.

**Optional Parameters:**

- `userId` (string): User ID (omit for authenticated user's issues)
- `includeArchived` (boolean): Include archived issues in results
- `limit` (number): Maximum number of issues to return (default: 50)

**Example:**

```json
{
  "userId": "user-123",
  "limit": 20,
  "includeArchived": false
}
```

**Best Practices:**

- Omit `userId` to get the authenticated user's issues
- Use this for workload analysis and sprint planning
- Issues are returned with most recently updated first

### linear_add_comment

Adds a comment to an existing Linear issue. Supports markdown formatting.

**Required Parameters:**

- `issueId` (string): ID of the issue to comment on
- `body` (string): Comment text in markdown format

**Optional Parameters:**

- `createAsUser` (string): Optional custom username to show for the comment
- `displayIconUrl` (string): Optional avatar URL for the comment

**Example:**

```json
{
  "issueId": "issue-123",
  "body": "I've completed the first part of this task. The login screen is now working with email/password authentication.\n\n**TODO:** Implement OAuth providers",
  "createAsUser": "Bot Assistant"
}
```

**Best Practices:**

- Use markdown formatting to improve readability
- Keep comments focused on relevant updates
- Include action items or next steps when appropriate

## Project Management

### linear_list_projects

Retrieves projects from Linear with basic information.

**Optional Parameters:**

- `limit` (number): Maximum number of projects to return (default: 5)

**Example:**

```json
{
  "limit": 10
}
```

**Best Practices:**

- Use this tool to get an overview of all available projects
- Use the returned project IDs for other tools like `linear_get_project`

### linear_get_project

Retrieves a single project from Linear with detailed information including milestones, updates, and documents.

**Required Parameters:**

- `projectId` (string): ID of the project to fetch

**Example:**

```json
{
  "projectId": "project-123"
}
```

**Best Practices:**

- Use this tool for comprehensive project analysis
- To get issues associated with a project, use `linear_search_issues` with the `projectId` parameter
- The response includes up to 10 milestones, 5 recent updates, and 10 related documents

### linear_create_milestone

Creates a new milestone for a specific project in Linear. Milestones help track progress toward major goals or releases.

**Required Parameters:**

- `projectId` (string): ID of the project to create the milestone for
- `name` (string): Name of the milestone

**Optional Parameters:**

- `description` (string): Description of the milestone
- `targetDate` (string): Target date for milestone completion (ISO format date string, e.g., '2023-12-31')

**Example:**

```json
{
  "projectId": "project-123",
  "name": "Beta Release",
  "description": "First beta release with core functionality",
  "targetDate": "2023-12-31"
}
```

**Best Practices:**

- Create milestones for significant project phases or deliverables
- Use clear, descriptive names that indicate the goal
- Add target dates for better project planning
- Use milestones to group related issues and track progress over time

### linear_create_document

Creates a new document in Linear associated with a specific project. Documents can be used for specifications, meeting notes, or any project-related documentation.

**Required Parameters:**

- `projectId` (string): ID of the project to associate the document with
- `title` (string): Title of the document
- `content` (string): Document content in markdown format

**Example:**

```json
{
  "projectId": "project-123",
  "title": "API Documentation",
  "content": "# API Documentation\n\n## Authentication\n\nThis API uses OAuth2 for authentication. All requests must include a valid access token.\n\n## Endpoints\n\n### GET /users\n\nReturns a list of all users in the system."
}
```

**Best Practices:**

- Use meaningful titles that clearly indicate the document's purpose
- Organize content with markdown headings, lists, and code blocks for better readability
- Link related documents by including their URLs in the markdown content
- Group related documents by associating them with the same project

## Organization

### linear_get_labels

Retrieves all available issue labels in the Linear workspace.

**Optional Parameters:**

- `limit` (number): Maximum number of labels to return (default: 100)

**Example:**

```json
{
  "limit": 50
}
```

**Best Practices:**

- Use this tool to discover available label options
- Use the returned label IDs when creating or updating issues
- Labels help categorize and filter issues effectively

### linear_get_viewer

Retrieves information about the authenticated user in Linear, including their ID, name, email, organization, and teams they belong to.

**Parameters:**

- None required

**Example:**

```json
{}
```

**Response Example:**

```
User: Jane Doe
Email: jane@example.com
Admin: Yes
Organization: Example Organization
Teams:
- Engineering (ENG)
- Product (PRD)
```

**Best Practices:**

- Use this tool to identify the current user's context
- Helpful for understanding which teams the user belongs to
- Use the team information to create issues in the appropriate teams
- Useful for personalized workspace analysis and recommendations

### linear_list_teams

Lists teams in the Linear organization with details including ID, name, key, description, color, and member count.

**Optional Parameters:**

- `limit` (number): Maximum number of teams to return (default: 10)

**Example:**

```json
{
  "limit": 20
}
```

**Response Example:**

```
Found 3 teams:

- Engineering (ENG)
  ID: team-123
  Description: Core engineering team
  Members: 12

- Product (PRD)
  ID: team-456
  Description: Product management and design
  Members: 8

- Operations (OPS)
  ID: team-789
  Description: Customer support and operations
  Members: 6
```

**Best Practices:**

- Use this tool to discover available teams before creating issues
- Use the returned team IDs when creating issues with `linear_create_issue`
- Helpful for understanding the organization structure
- The member count can help identify team size and distribution
