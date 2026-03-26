import { ToolError, fetchJSON } from '@opentabs-dev/plugin-sdk';

// Fixed map ID for PowerDot's charger map
export const MAP_ID = 63;

// WPGMZA REST API endpoint (relative — runs in browser context)
const MARKERS_ENDPOINT = '/wp-json/wpgmza/v1/markers';
const MARKER_BY_ID_ENDPOINT = (id: string) => `/wp-json/wpgmza/v1/markers/${encodeURIComponent(id)}`;

// Country category IDs from /wp-json/wpgmza/v1/categories?map_id=63
// NOTE: Server-side category filtering is NOT supported by the API (all params ignored).
// Country is derived client-side using geographic bounding boxes.
export const COUNTRY_BOUNDING_BOXES: Record<
  string,
  { latMin: number; latMax: number; lngMin: number; lngMax: number }
> = {
  Belgium: { latMin: 49.5, latMax: 51.5, lngMin: 2.5, lngMax: 6.4 },
  France: { latMin: 41.3, latMax: 51.1, lngMin: -5.2, lngMax: 9.6 },
  Poland: { latMin: 49.0, latMax: 54.9, lngMin: 14.1, lngMax: 24.2 },
  Portugal: { latMin: 36.8, latMax: 42.2, lngMin: -9.5, lngMax: -6.2 },
  Spain: { latMin: 35.9, latMax: 43.8, lngMin: -9.3, lngMax: 4.3 },
};

export const VALID_COUNTRIES = Object.keys(COUNTRY_BOUNDING_BOXES);

// Derive country from coordinates using bounding boxes
export const deriveCountry = (lat: number, lng: number): string => {
  for (const [country, box] of Object.entries(COUNTRY_BOUNDING_BOXES)) {
    if (lat >= box.latMin && lat <= box.latMax && lng >= box.lngMin && lng <= box.lngMax) {
      return country;
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
