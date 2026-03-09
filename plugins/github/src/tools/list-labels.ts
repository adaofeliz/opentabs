import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../github-api.js';
import { type RawLabel, labelSchema, mapLabel } from './schemas.js';

export const listLabels = defineTool({
  name: 'list_labels',
  displayName: 'List Labels',
  description: 'List all labels for a repository. Returns label names, colors, and descriptions.',
  summary: 'List labels for a repository',
  icon: 'tag',
  group: 'Issues',
  input: z.object({
    owner: z.string().min(1).describe('Repository owner (user or org)'),
    repo: z.string().min(1).describe('Repository name'),
    per_page: z.number().int().min(1).max(100).optional().describe('Results per page (default 30, max 100)'),
    page: z.number().int().min(1).optional().describe('Page number (default 1)'),
  }),
  output: z.object({
    labels: z.array(labelSchema).describe('List of labels'),
  }),
  handle: async params => {
    const query: Record<string, string | number | boolean | undefined> = {
      per_page: params.per_page ?? 30,
      page: params.page,
    };

    const data = await api<RawLabel[]>(`/repos/${params.owner}/${params.repo}/labels`, { query });
    return { labels: (data ?? []).map(mapLabel) };
  },
});
