import { defineTool, ToolError } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { catalog, getPlanId } from '../ynab-api.js';
import type { RawAccount } from './schemas.js';
import { accountSchema, mapAccount } from './schemas.js';

interface BudgetData {
  be_accounts?: RawAccount[];
}

export const getAccount = defineTool({
  name: 'get_account',
  displayName: 'Get Account',
  description:
    'Get details for a specific account in the active YNAB plan by its ID. Returns name, type, balances, and on-budget status.',
  summary: 'Get account details by ID',
  icon: 'landmark',
  group: 'Accounts',
  input: z.object({
    account_id: z.string().min(1).describe('Account ID to retrieve'),
  }),
  output: z.object({
    account: accountSchema,
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
    const account = raw.find(a => a.id === params.account_id && !a.is_tombstone);

    if (!account) {
      throw ToolError.notFound(`Account not found: ${params.account_id}`);
    }

    return { account: mapAccount(account) };
  },
});
