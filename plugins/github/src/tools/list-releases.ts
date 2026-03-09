import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../github-api.js';
import { type RawRelease, mapRelease, releaseSchema } from './schemas.js';

export const listReleases = defineTool({
  name: 'list_releases',
  displayName: 'List Releases',
  description: 'List releases for a repository. Returns published and draft releases sorted by creation date.',
  summary: 'List releases for a repository',
  icon: 'package',
  group: 'Repositories',
  input: z.object({
    owner: z.string().min(1).describe('Repository owner (user or org)'),
    repo: z.string().min(1).describe('Repository name'),
    per_page: z.number().int().min(1).max(100).optional().describe('Results per page (default 30, max 100)'),
    page: z.number().int().min(1).optional().describe('Page number (default 1)'),
  }),
  output: z.object({
    releases: z.array(releaseSchema).describe('List of releases'),
  }),
  handle: async params => {
    const query: Record<string, string | number | boolean | undefined> = {
      per_page: params.per_page ?? 30,
      page: params.page,
    };

    const data = await api<RawRelease[]>(`/repos/${params.owner}/${params.repo}/releases`, { query });
    return { releases: (data ?? []).map(mapRelease) };
  },
});
