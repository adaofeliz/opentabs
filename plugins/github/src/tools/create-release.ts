import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../github-api.js';
import { type RawRelease, mapRelease, releaseSchema } from './schemas.js';

export const createRelease = defineTool({
  name: 'create_release',
  displayName: 'Create Release',
  description: 'Create a new release for a repository. Optionally create as a draft or prerelease.',
  summary: 'Create a release in a repository',
  icon: 'package',
  group: 'Repositories',
  input: z.object({
    owner: z.string().min(1).describe('Repository owner (user or org)'),
    repo: z.string().min(1).describe('Repository name'),
    tag_name: z.string().min(1).describe('Git tag name for the release'),
    name: z.string().optional().describe('Release title'),
    body: z.string().optional().describe('Release notes in Markdown'),
    draft: z.boolean().optional().describe('Create as a draft release (default: false)'),
    prerelease: z.boolean().optional().describe('Mark as a prerelease (default: false)'),
    target_commitish: z.string().optional().describe('Branch or commit SHA to tag — defaults to the default branch'),
  }),
  output: z.object({
    release: releaseSchema.describe('The created release'),
  }),
  handle: async params => {
    const body: Record<string, unknown> = {
      tag_name: params.tag_name,
    };
    if (params.name !== undefined) body.name = params.name;
    if (params.body !== undefined) body.body = params.body;
    if (params.draft !== undefined) body.draft = params.draft;
    if (params.prerelease !== undefined) body.prerelease = params.prerelease;
    if (params.target_commitish !== undefined) body.target_commitish = params.target_commitish;

    const data = await api<RawRelease>(`/repos/${params.owner}/${params.repo}/releases`, {
      method: 'POST',
      body,
    });
    return { release: mapRelease(data) };
  },
});
