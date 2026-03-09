import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { getPlanId, syncWrite } from '../ynab-api.js';

export const deleteTransaction = defineTool({
  name: 'delete_transaction',
  displayName: 'Delete Transaction',
  description: 'Delete a transaction from the active YNAB plan. This marks the transaction as deleted (soft delete).',
  summary: 'Delete a transaction',
  icon: 'trash-2',
  group: 'Transactions',
  input: z.object({
    transaction_id: z.string().min(1).describe('Transaction ID to delete'),
    account_id: z.string().min(1).describe('Account ID the transaction belongs to'),
  }),
  output: z.object({
    success: z.boolean().describe('Whether the operation succeeded'),
  }),
  handle: async params => {
    const planId = getPlanId();

    await syncWrite(planId, {
      be_transactions: [
        {
          id: params.transaction_id,
          entities_account_id: params.account_id,
          is_tombstone: true,
        },
      ],
    });

    return { success: true };
  },
});
