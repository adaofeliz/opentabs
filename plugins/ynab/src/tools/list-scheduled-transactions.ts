import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { catalog, getPlanId } from '../ynab-api.js';
import type { RawScheduledTransaction } from './schemas.js';
import { mapScheduledTransaction, scheduledTransactionSchema } from './schemas.js';

interface BudgetData {
  be_scheduled_transactions?: RawScheduledTransaction[];
}

export const listScheduledTransactions = defineTool({
  name: 'list_scheduled_transactions',
  displayName: 'List Scheduled Transactions',
  description:
    'List all scheduled (recurring) transactions in the active YNAB plan. Returns frequency, next occurrence date, amount, payee, and category for each.',
  summary: 'List scheduled/recurring transactions',
  icon: 'clock',
  group: 'Transactions',
  input: z.object({}),
  output: z.object({
    scheduled_transactions: z.array(scheduledTransactionSchema).describe('List of scheduled transactions'),
  }),
  handle: async () => {
    const planId = getPlanId();
    const result = await catalog<BudgetData>('syncBudgetData', {
      budget_version_id: planId,
      starting_device_knowledge: 0,
      ending_device_knowledge: 0,
      device_knowledge_of_server: 0,
    });

    const raw =
      (result as unknown as { changed_entities?: BudgetData }).changed_entities?.be_scheduled_transactions ?? [];

    const scheduledTransactions = raw
      .filter(s => !s.is_tombstone)
      .map(mapScheduledTransaction)
      .sort((a, b) => a.date_next.localeCompare(b.date_next));

    return { scheduled_transactions: scheduledTransactions };
  },
});
