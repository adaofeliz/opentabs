import { ToolError, defineTool } from '@opentabs-dev/plugin-sdk';
import type { ToolHandlerContext } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { fetchAllMarkers, haversineDistance } from '../powerdot-api.js';
import { chargerSchema, mapCharger } from './schemas.js';

export const searchChargersByLocation = defineTool({
  name: 'search_chargers_by_location',
  displayName: 'Search Chargers by Location',
  description:
    'Search for PowerDot EV chargers near a specific location using latitude/longitude coordinates and a search radius in kilometers.',
  summary: 'Search PowerDot chargers near a location',
  icon: 'map-pin',
  group: 'Chargers',
  input: z.object({
    latitude: z.number().min(-90).max(90).describe('Latitude of the search center'),
    longitude: z.number().min(-180).max(180).describe('Longitude of the search center'),
    radius_km: z.number().min(1).max(300).optional().describe('Search radius in kilometers (default 25)'),
    limit: z.number().int().min(1).max(100).optional().describe('Maximum chargers to return (default 20)'),
  }),
  output: z.object({
    chargers: z
      .array(
        chargerSchema.extend({
          distance_km: z.number().describe('Distance from search center in kilometers'),
        }),
      )
      .describe('Chargers within the search radius, sorted by distance ascending'),
    total_in_radius: z.number().int().describe('Total chargers within the search radius'),
  }),
  handle: async (params, context?: ToolHandlerContext) => {
    const radiusKm = params.radius_km ?? 25;
    const limit = params.limit ?? 20;

    context?.reportProgress({ message: 'Fetching PowerDot charger data...' });

    const rawMarkers = await fetchAllMarkers();
    if (rawMarkers.length === 0) {
      throw ToolError.internal('No charger data returned from PowerDot API');
    }

    context?.reportProgress({ progress: 1, total: 2, message: 'Calculating distances...' });

    const withDistance = rawMarkers
      .map(raw => {
        const charger = mapCharger(raw);
        const distance = haversineDistance(params.latitude, params.longitude, charger.latitude, charger.longitude);
        return { ...charger, distance_km: Math.round(distance * 10) / 10 };
      })
      .filter(c => c.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);

    return {
      chargers: withDistance.slice(0, limit),
      total_in_radius: withDistance.length,
    };
  },
});
