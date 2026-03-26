import { ToolError, defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { fetchMarkerById } from '../powerdot-api.js';
import { chargerSchema, mapCharger } from './schemas.js';

export const getChargerDetails = defineTool({
  name: 'get_charger_details',
  displayName: 'Get Charger Details',
  description:
    'Get detailed information about a specific PowerDot EV charger by its ID. Returns full location details including name, address, coordinates, country, and venue type.',
  summary: 'Get details of a specific PowerDot charger by ID',
  icon: 'info',
  group: 'Chargers',
  input: z.object({
    id: z.string().min(1).describe('Charger/marker ID (from list_all_chargers or search results)'),
  }),
  output: z.object({
    charger: chargerSchema.describe('Full charger location details'),
  }),
  handle: async params => {
    const raw = await fetchMarkerById(params.id);
    const charger = mapCharger(raw);
    if (!charger.id) {
      throw ToolError.notFound(`Charger with ID "${params.id}" not found`);
    }
    return { charger };
  },
});
