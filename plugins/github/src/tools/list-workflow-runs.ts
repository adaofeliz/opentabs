import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../github-api.js';
import { type RawWorkflowRun, mapWorkflowRun, workflowRunSchema } from './schemas.js';

interface RawWorkflowRunsResponse {
  total_count?: number;
  workflow_runs?: RawWorkflowRun[];
}

export const listWorkflowRuns = defineTool({
  name: 'list_workflow_runs',
  displayName: 'List Workflow Runs',
  description:
    'List workflow runs for a repository. Optionally filter by workflow ID, branch, or status. Returns runs sorted by creation date.',
  summary: 'List GitHub Actions workflow runs',
  icon: 'play',
  group: 'Actions',
  input: z.object({
    owner: z.string().min(1).describe('Repository owner (user or org)'),
    repo: z.string().min(1).describe('Repository name'),
    workflow_id: z.string().optional().describe('Workflow ID or filename to filter by (e.g., "ci.yml")'),
    branch: z.string().optional().describe('Filter by branch name'),
    status: z
      .enum([
        'completed',
        'action_required',
        'cancelled',
        'failure',
        'neutral',
        'skipped',
        'stale',
        'success',
        'timed_out',
        'in_progress',
        'queued',
        'requested',
        'waiting',
        'pending',
      ])
      .optional()
      .describe('Filter by run status'),
    per_page: z.number().int().min(1).max(100).optional().describe('Results per page (default 30, max 100)'),
    page: z.number().int().min(1).optional().describe('Page number (default 1)'),
  }),
  output: z.object({
    total_count: z.number().describe('Total number of matching workflow runs'),
    workflow_runs: z.array(workflowRunSchema).describe('List of workflow runs'),
  }),
  handle: async params => {
    const query: Record<string, string | number | boolean | undefined> = {
      per_page: params.per_page ?? 30,
      page: params.page,
    };
    if (params.branch) query.branch = params.branch;
    if (params.status) query.status = params.status;

    const endpoint = params.workflow_id
      ? `/repos/${params.owner}/${params.repo}/actions/workflows/${params.workflow_id}/runs`
      : `/repos/${params.owner}/${params.repo}/actions/runs`;

    const data = await api<RawWorkflowRunsResponse>(endpoint, { query });
    return {
      total_count: data.total_count ?? 0,
      workflow_runs: (data.workflow_runs ?? []).map(mapWorkflowRun),
    };
  },
});
