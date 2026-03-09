import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { catalog, getPlanId } from '../ynab-api.js';
import type { RawAccount } from './schemas.js';
import { accountSchema, mapAccount } from './schemas.js';

interface BudgetData {
  be_accounts?: RawAccount[];
}

export const listAccounts = defineTool({
  name: 'list_accounts',
  displayName: 'List Accounts',
  description:
    'List all accounts in the active YNAB plan. Returns account name, type, balances, and on-budget status. Includes checking, savings, credit cards, and tracking accounts.',
  summary: 'List all budget accounts',
  icon: 'landmark',
  group: 'Accounts',
  input: z.object({
    include_closed: z.boolean().optional().describe('Include closed accounts (default false)'),
  }),
  output: z.object({
    accounts: z.array(accountSchema).describe('List of accounts'),
  }),
  handle: async params => {
    const planId = getPlanId();
    const result = await catalog<BudgetData>('syncBudgetData', {
      budget_version_id: planId,
      starting_device_knowledge: 0,
      ending_device_knowledge: 0,
      device_knowledge_of_server: 0,
    });

    const raw = (result as unknown as { changed_entities?: BudgetData }).changed_entities?.be_accounts ?? [];
    let accounts = raw.filter(a => !a.is_tombstone).map(mapAccount);

    if (!params.include_closed) {
      accounts = accounts.filter(a => !a.closed);
    }

    return { accounts };
  },
});
