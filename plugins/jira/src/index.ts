import { OpenTabsPlugin } from '@opentabs-dev/plugin-sdk';
import type { ToolDefinition } from '@opentabs-dev/plugin-sdk';
import { isAuthenticated, waitForAuth } from './jira-api.js';
import { searchIssues } from './tools/search-issues.js';
import { getIssue } from './tools/get-issue.js';
import { createIssue } from './tools/create-issue.js';
import { updateIssue } from './tools/update-issue.js';
import { deleteIssue } from './tools/delete-issue.js';
import { transitionIssue } from './tools/transition-issue.js';
import { getTransitions } from './tools/get-transitions.js';
import { assignIssue } from './tools/assign-issue.js';
import { addComment } from './tools/add-comment.js';
import { listComments } from './tools/list-comments.js';
import { listProjects } from './tools/list-projects.js';
import { getProject } from './tools/get-project.js';
import { searchUsers } from './tools/search-users.js';
import { getMyself } from './tools/get-myself.js';

class JiraPlugin extends OpenTabsPlugin {
  readonly name = 'jira';
  readonly description = 'OpenTabs plugin for Jira';
  override readonly displayName = 'Jira';
  readonly urlPatterns = ['*://*.atlassian.net/*'];
  readonly tools: ToolDefinition[] = [
    // Issues
    searchIssues,
    getIssue,
    createIssue,
    updateIssue,
    deleteIssue,
    transitionIssue,
    getTransitions,
    assignIssue,
    // Comments
    addComment,
    listComments,
    // Projects
    listProjects,
    getProject,
    // Users
    searchUsers,
    getMyself,
  ];

  async isReady(): Promise<boolean> {
    if (isAuthenticated()) return true;
    return waitForAuth();
  }
}

export default new JiraPlugin();
