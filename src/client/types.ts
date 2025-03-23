export interface CreateIssueArgs {
  title: string;
  teamId: string;
  description?: string;
  priority?: number;
  status?: string;
  estimate?: number;
  labelIds?: string[];
  projectId?: string;
  milestoneId?: string;
}

export interface UpdateIssueArgs {
  id: string;
  title?: string;
  description?: string;
  priority?: number;
  status?: string;
}

export interface SearchIssuesArgs {
  query?: string;
  teamId?: string;
  limit?: number;
  status?: string;
  assigneeId?: string;
  labels?: string[];
  priority?: number;
  estimate?: number;
  includeArchived?: boolean;
  projectId?: string;
  milestoneId?: string;
}

export interface GetUserIssuesArgs {
  userId?: string;
  includeArchived?: boolean;
  limit?: number;
}

export interface AddCommentArgs {
  issueId: string;
  body: string;
  createAsUser?: string;
  displayIconUrl?: string;
}

export interface LinearIssueResponse {
  identifier: string;
  title: string;
  priority: number | null;
  status: string | null;
  stateName?: string;
  url: string;
}

export interface GetLabelsArgs {
  limit?: number;
}

export interface ListProjectsArgs {
  limit?: number;
}

export interface GetProjectArgs {
  projectId: string;
}

export interface CreateMilestoneArgs {
  projectId: string;
  name: string;
  description?: string;
  targetDate?: string;
}

export interface CreateDocumentArgs {
  projectId: string;
  title: string;
  content: string;
}
