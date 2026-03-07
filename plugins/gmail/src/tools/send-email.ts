import { sendViaCompose } from '../gmail-api.js';
import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';

export const sendEmail = defineTool({
  name: 'send_email',
  displayName: 'Send Email',
  description:
    'Send an email from the authenticated Gmail account. ' +
    'Supports multiple To, CC, and BCC recipients. The body is plain text.',
  summary: 'Send an email from Gmail',
  icon: 'send',
  group: 'Actions',
  input: z.object({
    to: z.array(z.string()).min(1).describe('Array of recipient email addresses (at least one required)'),
    cc: z.array(z.string()).optional().describe('Array of CC recipient email addresses'),
    bcc: z.array(z.string()).optional().describe('Array of BCC recipient email addresses'),
    subject: z.string().describe('Email subject line'),
    body: z.string().describe('Email body as plain text'),
  }),
  output: z.object({
    sent: z.boolean().describe('Whether the email was sent successfully'),
  }),
  handle: async params => {
    const result = await sendViaCompose({
      to: params.to,
      cc: params.cc,
      bcc: params.bcc,
      subject: params.subject,
      body: params.body,
    });
    return { sent: result.sent };
  },
});
