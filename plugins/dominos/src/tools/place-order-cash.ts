import { defineTool, ToolError } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { requireActiveCart } from '../dominos-api.js';

/**
 * Wait for a DOM element matching the selector to appear, up to timeoutMs.
 */
const waitForElement = <T extends Element>(selector: string, timeoutMs = 10_000): Promise<T> =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector<T>(selector);
    if (existing) {
      resolve(existing);
      return;
    }
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 200;
      const el = document.querySelector<T>(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
        return;
      }
      if (elapsed >= timeoutMs) {
        clearInterval(interval);
        reject(new Error(`Timed out waiting for element: ${selector}`));
      }
    }, 200);
  });

export const placeOrderCash = defineTool({
  name: 'place_order_cash',
  displayName: 'Place Order (Cash)',
  description:
    'Place the current order with Cash payment (pay at pickup). This navigates to checkout, selects Cash, and submits the order. The AI should always confirm with the user before calling this tool.',
  summary: 'Place your order and pay cash at pickup',
  icon: 'banknote',
  group: 'Cart',
  input: z.object({}),
  output: z.object({
    success: z.boolean().describe('Whether the order was submitted successfully'),
    message: z.string().describe('Result message'),
  }),
  handle: async () => {
    requireActiveCart();

    // Navigate to checkout page
    window.location.href = 'https://www.dominos.com/checkout';

    // Wait for the Cash payment radio button to appear
    let cashRadio: HTMLInputElement;
    try {
      cashRadio = await waitForElement<HTMLInputElement>('input#payment-type-cash', 15_000);
    } catch {
      throw ToolError.internal('Checkout page did not load — make sure you have items in your cart.');
    }

    // Select Cash payment
    const cashLabel = document.querySelector<HTMLLabelElement>('label[for="payment-type-cash"]');
    if (cashLabel) cashLabel.click();
    else cashRadio.click();

    // Wait a moment for the form to update after payment selection
    await new Promise(r => setTimeout(r, 1000));

    // Click the Place Order button
    const placeOrderBtn = [...document.querySelectorAll('button')].find(el =>
      el.textContent?.trim().toUpperCase().includes('PLACE ORDER'),
    );
    if (!placeOrderBtn) {
      throw ToolError.internal('Place Order button not found on the checkout page.');
    }
    placeOrderBtn.click();

    return {
      success: true,
      message: "Order submitted with Cash payment. Check the Domino's Tracker for order status.",
    };
  },
});
