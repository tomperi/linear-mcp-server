# Linear MCP Server

[![npm version](https://img.shields.io/npm/v/@tomperi/linear-mcp-server.svg)](https://www.npmjs.com/package/@tomperi/linear-mcp-server)

A [Model Context Protocol](https://github.com/modelcontextprotocol) server for the [Linear API](https://developers.linear.app/docs/graphql/working-with-the-graphql-api).

This server provides integration with Linear's issue tracking system through MCP, allowing LLMs to interact with Linear issues.

> **Note:** This package is published as a scoped package `@tomperi/linear-mcp-server`. It's currently in beta (v0.1.0).

## Installation

1. Install the package:

```bash
npm install @tomperi/linear-mcp-server
# or
yarn add @tomperi/linear-mcp-server
# or
pnpm add @tomperi/linear-mcp-server
```

2. Create or get a Linear API key for your team: [https://linear.app/YOUR-TEAM/settings/api](https://linear.app/YOUR-TEAM/settings/api)

3. Add server config to Claude Desktop:
   - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@tomperi/linear-mcp-server"],
      "env": {
        "LINEAR_API_KEY": "your_linear_api_key_here"
      }
    }
  }
}
```

## Components

### Tools

The Linear MCP Server provides tools for managing issues, projects, milestones, and more.

A detailed documentation of all tools, their parameters, examples, and best practices can be found in our [Tools Documentation](./docs/tools.md).

Here's a quick overview of the available tools:

#### Issue Management

- **`linear_create_issue`**: Create new Linear issues
- **`linear_update_issue`**: Update existing issues
- **`linear_search_issues`**: Search issues with flexible filtering
- **`linear_get_user_issues`**: Get issues assigned to a user
- **`linear_add_comment`**: Add comments to issues

#### Project Management

- **`linear_list_projects`**: List available projects
- **`linear_get_project`**: Get detailed project information
- **`linear_create_milestone`**: Create new project milestones

#### Organization

- **`linear_get_labels`**: Get available issue labels

### Resources

- `linear-issue:///{issueId}` - View individual issue details
- `linear-team:///{teamId}/issues` - View team issues
- `linear-user:///{userId}/assigned` - View user's assigned issues
- `linear-organization:` - View organization info
- `linear-viewer:` - View current user context

## Usage examples

Some example prompts you can use with Claude Desktop to interact with Linear:

1. "Show me all my high-**priority** issues" → execute the `search_issues` tool and/or `linear-user:///{userId}/assigned` to find issues assigned to you with priority 1

2. "Based on what I've told you about this bug already, make a bug report for the authentication system" → use `create_issue` to create a new high-priority issue with appropriate details and status tracking

3. "Find all in progress frontend tasks" → use `search_issues` to locate frontend-related issues with in progress task

4. "Give me a summary of recent updates on the issues for mobile app development" → use `search_issues` to identify the relevant issue(s), then `linear-issue:///{issueId}` fetch the issue details and show recent activity and comments

5. "What's the current workload for the mobile team?" → combine `linear-team:///{teamId}/issues` and `search_issues` to analyze issue distribution and priorities across the mobile team

## Development

1. Clone the repository:

```bash
git clone https://github.com/tomperi/linear-mcp-server.git
cd linear-mcp-server
```

2. Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

3. Configure Linear API key in `.env`:

```bash
LINEAR_API_KEY=your_api_key_here
```

4. Build the server:

```bash
npm run build
# or
yarn build
# or
pnpm run build
```

For development with auto-rebuild:

```bash
npm run watch
# or
yarn watch
# or
pnpm run watch
```

## Publishing

To publish a new version to npm:

1. Update the version in `package.json`
2. Build the package:
   ```bash
   pnpm run build
   ```
3. Publish the package:
   ```bash
   pnpm run release
   ```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
