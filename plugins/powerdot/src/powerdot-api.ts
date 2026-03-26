import { ToolError, fetchJSON } from '@opentabs-dev/plugin-sdk';

// Fixed map ID for PowerDot's charger map
export const MAP_ID = 63;

// WPGMZA REST API endpoint (relative — runs in browser context)
const MARKERS_ENDPOINT = '/wp-json/wpgmza/v1/markers';
const MARKER_BY_ID_ENDPOINT = (id: string) => `/wp-json/wpgmza/v1/markers/${encodeURIComponent(id)}`;

// Country bounding boxes — checked in priority order (smaller/more specific regions first)
// to handle overlapping boundaries correctly.
const COUNTRY_PRIORITY_ORDER = [
  { name: 'Portugal', latMin: 36.8, latMax: 42.2, lngMin: -9.5, lngMax: -6.2 },
  { name: 'Belgium', latMin: 49.5, latMax: 51.5, lngMin: 2.5, lngMax: 6.4 },
  { name: 'Poland', latMin: 49.0, latMax: 54.9, lngMin: 14.1, lngMax: 24.2 },
  { name: 'Spain', latMin: 35.9, latMax: 43.8, lngMin: -9.3, lngMax: 4.3 },
  { name: 'France', latMin: 41.3, latMax: 51.1, lngMin: -5.2, lngMax: 9.6 },
];

export const COUNTRY_BOUNDING_BOXES: Record<
  string,
  { latMin: number; latMax: number; lngMin: number; lngMax: number }
> = Object.fromEntries(COUNTRY_PRIORITY_ORDER.map(({ name, ...box }) => [name, box]));

export const VALID_COUNTRIES = COUNTRY_PRIORITY_ORDER.map(c => c.name);

// Derive country from coordinates using bounding boxes.
// Countries are checked in priority order so that smaller/more specific regions
// (Portugal, Belgium, Poland) are matched before larger overlapping ones (France, Spain).
export const deriveCountry = (lat: number, lng: number): string => {
  for (const { name, latMin, latMax, lngMin, lngMax } of COUNTRY_PRIORITY_ORDER) {
    if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
      return name;
    }
  }
  return 'Unknown';
};

// Haversine distance formula — returns distance in km
export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Page readiness check — PowerDot is a public site, no auth needed
export const isPageReady = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.readyState === 'complete' || document.readyState === 'interactive';
};

// Fetch all markers from the WPGMZA REST API
// NOTE: The API does NOT support server-side filtering, pagination, or limiting.
// All 17,569+ markers are always returned. Filtering is done client-side.
export const fetchAllMarkers = async (): Promise<RawMarker[]> => {
  try {
    const data = await fetchJSON<RawMarker[]>(MARKERS_ENDPOINT);
    if (!Array.isArray(data)) {
      throw ToolError.internal('Unexpected response format from PowerDot API');
    }
    return data;
  } catch (err) {
    if (err instanceof ToolError) throw err;
    throw ToolError.internal(`Failed to fetch charger data: ${String(err)}`);
  }
};

// Fetch a single marker by ID
export const fetchMarkerById = async (id: string): Promise<RawMarker> => {
  try {
    const data = await fetchJSON<RawMarker>(MARKER_BY_ID_ENDPOINT(id));
    if (!data) {
      throw ToolError.notFound(`Charger with ID "${id}" not found`);
    }
    return data;
  } catch (err) {
    if (err instanceof ToolError) throw err;
    // WPGMZA returns 404 with { code: "wpgmza_marker_not_found" } for missing markers
    const msg = String(err);
    if (msg.includes('404') || msg.includes('wpgmza_marker_not_found') || msg.includes('not found')) {
      throw ToolError.notFound(`Charger with ID "${id}" not found`);
    }
    throw ToolError.internal(`Failed to fetch charger: ${msg}`);
  }
};

// Raw marker shape from the WPGMZA REST API
export interface RawMarker {
  id: string | number;
  map_id?: string;
  title?: string | null;
  address?: string | null;
  description?: string | null;
  lat?: string | null;
  lng?: string | null;
  did?: string | null;
  pic?: string | null;
  link?: string | null;
  icon?: { url?: string; retina?: boolean } | null;
  category?: string | null;
  categories?: unknown[];
  approved?: string | null;
  anim?: string | null;
  infoopen?: string | null;
  retina?: string | null;
  type?: string | null;
  sticky?: string | null;
  layergroup?: string | null;
  gallery?: Array<{ attachment_id?: number; url?: string; thumbnail?: string }> | null;
  custom_field_data?: unknown[];
  custom_fields_html?: string | null;
}
