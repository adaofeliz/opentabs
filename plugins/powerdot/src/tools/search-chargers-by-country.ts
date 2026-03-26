import { ToolError, defineTool } from '@opentabs-dev/plugin-sdk';
import type { ToolHandlerContext } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { VALID_COUNTRIES, fetchAllMarkers } from '../powerdot-api.js';
import { chargerSchema, mapCharger } from './schemas.js';

export const searchChargersByCountry = defineTool({
  name: 'search_chargers_by_country',
  displayName: 'Search Chargers by Country',
  description:
    'Search for PowerDot EV chargers in a specific country. Available countries: Portugal, Spain, France, Belgium, Poland.',
  summary: 'Search PowerDot chargers by country',
  icon: 'globe',
  group: 'Chargers',
  input: z.object({
    country: z.string().describe('Country name (Portugal, Spain, France, Belgium, or Poland)'),
    limit: z.number().int().min(1).max(200).optional().describe('Maximum chargers to return (default 50)'),
  }),
  output: z.object({
    chargers: z.array(chargerSchema).describe('Chargers in the specified country'),
    total: z.number().int().describe('Total chargers found in this country'),
    country: z.string().describe('Normalized country name used for filtering'),
  }),
  handle: async (params, context?: ToolHandlerContext) => {
    const normalized = VALID_COUNTRIES.find(c => c.toLowerCase() === params.country.toLowerCase());
    if (!normalized) {
      throw ToolError.validation(`Invalid country "${params.country}". Valid countries: ${VALID_COUNTRIES.join(', ')}`);
    }
    context?.reportProgress({ message: `Fetching chargers in ${normalized}...` });
    const rawMarkers = await fetchAllMarkers();
    context?.reportProgress({ progress: 1, total: 2, message: 'Filtering by country...' });
    const allMapped = rawMarkers.map(mapCharger);
    const filtered = allMapped.filter(c => c.country === normalized);
    const limit = params.limit ?? 50;
    return {
      chargers: filtered.slice(0, limit),
      total: filtered.length,
      country: normalized,
    };
  },
});
