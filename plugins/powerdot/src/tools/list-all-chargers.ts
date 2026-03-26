import { ToolError, defineTool } from '@opentabs-dev/plugin-sdk';
import type { ToolHandlerContext } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { fetchAllMarkers } from '../powerdot-api.js';
import { chargerSchema, mapCharger } from './schemas.js';

export const listAllChargers = defineTool({
  name: 'list_all_chargers',
  displayName: 'List All Chargers',
  description:
    'List PowerDot EV charger locations across Europe. Returns charger name, address, coordinates, and country. Use search_chargers_by_country or search_chargers_by_location for filtered results.',
  summary: 'List all PowerDot EV charger locations',
  icon: 'list',
  group: 'Chargers',
  input: z.object({
    limit: z.number().int().min(1).max(500).optional().describe('Maximum chargers to return (default 100, max 500)'),
  }),
  output: z.object({
    chargers: z.array(chargerSchema).describe('List of PowerDot EV charger locations'),
    total: z.number().int().describe('Total number of chargers in the PowerDot network'),
  }),
  handle: async (params, context?: ToolHandlerContext) => {
    context?.reportProgress({ message: 'Fetching PowerDot charger data...' });
    const rawMarkers = await fetchAllMarkers();
    const limit = params.limit ?? 100;
    const total = rawMarkers.length;
    if (total === 0) {
      throw ToolError.internal('No charger data returned from PowerDot API');
    }
    context?.reportProgress({ progress: 1, total: 2, message: 'Mapping charger data...' });
    const chargers = rawMarkers.slice(0, limit).map(mapCharger);
    return { chargers, total };
  },
});
