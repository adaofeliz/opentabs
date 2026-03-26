import { z } from 'zod';
import { deriveCountry } from '../powerdot-api.js';
import type { RawMarker } from '../powerdot-api.js';

// Output schema for a charger location
export const chargerSchema = z.object({
  id: z.string().describe('Unique charger/marker ID'),
  name: z.string().describe('Charger location name (e.g., shopping center or venue name)'),
  address: z.string().describe('Street address or location description'),
  latitude: z.number().describe('Latitude coordinate'),
  longitude: z.number().describe('Longitude coordinate'),
  country: z
    .string()
    .describe('Country where the charger is located (Portugal, Spain, France, Belgium, Poland, or Unknown)'),
  venue_type: z.string().optional().describe('Type of venue (e.g., Supermarket, Shopping Mall, Hotel)'),
  description: z.string().optional().describe('Additional details about the charger location'),
  icon_url: z.string().optional().describe('URL of the charger status icon'),
});

export type Charger = z.infer<typeof chargerSchema>;

// Map a raw WPGMZA marker to a normalized Charger object
export const mapCharger = (raw: RawMarker): Charger => {
  const lat = parseFloat(raw.lat ?? '0') || 0;
  const lng = parseFloat(raw.lng ?? '0') || 0;
  const country = deriveCountry(lat, lng);

  return {
    id: String(raw.id ?? ''),
    name: raw.title ?? '',
    address: raw.address ?? '',
    latitude: lat,
    longitude: lng,
    country,
    venue_type: raw.did && raw.did.trim() !== '' ? raw.did.trim() : undefined,
    description: raw.description && raw.description.trim() !== '' ? raw.description.trim() : undefined,
    icon_url: raw.icon?.url ?? raw.pic ?? undefined,
  };
};
