import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { catalog, getPlanId } from '../ynab-api.js';
import type { RawPayee } from './schemas.js';
import { mapPayee, payeeSchema } from './schemas.js';

interface BudgetData {
  be_payees?: RawPayee[];
}

export const listPayees = defineTool({
  name: 'list_payees',
  displayName: 'List Payees',
  description:
    'List all payees in the active YNAB plan. Payees represent merchants, employers, or transfer targets. Excludes deleted payees.',
  summary: 'List all payees',
  icon: 'store',
  group: 'Payees',
  input: z.object({}),
  output: z.object({
    payees: z.array(payeeSchema).describe('List of payees'),
  }),
  handle: async () => {
    const planId = getPlanId();
    const result = await catalog<BudgetData>('syncBudgetData', {
      budget_version_id: planId,
      starting_device_knowledge: 0,
      ending_device_knowledge: 0,
      device_knowledge_of_server: 0,
    });

    const raw = (result as unknown as { changed_entities?: BudgetData }).changed_entities?.be_payees ?? [];
    const payees = raw.filter(p => !p.is_tombstone).map(mapPayee);

    return { payees };
  },
});
