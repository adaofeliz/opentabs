import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../github-api.js';
import { type RawWorkflowRun, mapWorkflowRun, workflowRunSchema } from './schemas.js';

export const getWorkflowRun = defineTool({
  name: 'get_workflow_run',
  displayName: 'Get Workflow Run',
  description: 'Get detailed information about a specific GitHub Actions workflow run by its run ID.',
  summary: 'Get a workflow run by ID',
  icon: 'play',
  group: 'Actions',
  input: z.object({
    owner: z.string().min(1).describe('Repository owner (user or org)'),
    repo: z.string().min(1).describe('Repository name'),
    run_id: z.number().int().min(1).describe('Workflow run ID'),
  }),
  output: z.object({
    workflow_run: workflowRunSchema.describe('The workflow run'),
  }),
  handle: async params => {
    const data = await api<RawWorkflowRun>(`/repos/${params.owner}/${params.repo}/actions/runs/${params.run_id}`);
    return { workflow_run: mapWorkflowRun(data) };
  },
});
