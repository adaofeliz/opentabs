import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { catalog, getPlanId } from '../ynab-api.js';
import type { RawPlan } from './schemas.js';
import { mapPlan, planSchema } from './schemas.js';

interface CatalogUserData {
  budget_version?: RawPlan;
}

export const getPlan = defineTool({
  name: 'get_plan',
  displayName: 'Get Plan',
  description:
    'Get details about the currently active YNAB plan (budget), including name, currency, and date format. The plan ID is extracted from the current URL.',
  summary: 'Get the active plan details',
  icon: 'wallet',
  group: 'Plans',
  input: z.object({}),
  output: z.object({ plan: planSchema }),
  handle: async () => {
    const planId = getPlanId();
    const result = await catalog<CatalogUserData>('getInitialUserData', {
      device_info: { id: planId, device_os: 'web' },
    });
    return { plan: mapPlan(result.budget_version as RawPlan) };
  },
});
