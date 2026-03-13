# Stripe

OpenTabs plugin for Stripe Dashboard — gives AI agents access to Stripe through your authenticated browser session.

## Install

```bash
opentabs plugin install stripe
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-stripe
```

## Setup

1. Open [dashboard.stripe.com](https://dashboard.stripe.com) in Chrome and log in
2. Open the OpenTabs side panel — the Stripe plugin should appear as **ready**

## Tools (30)

### Account (1)

| Tool | Description | Type |
|---|---|---|
| `get_account` | Get current Stripe account info | Read |

### Customers (6)

| Tool | Description | Type |
|---|---|---|
| `list_customers` | List customers with pagination | Read |
| `get_customer` | Get a customer by ID | Read |
| `create_customer` | Create a new customer | Write |
| `update_customer` | Update a customer | Write |
| `delete_customer` | Delete a customer | Write |
| `search_customers` | Search customers by query | Read |

### Products (7)

| Tool | Description | Type |
|---|---|---|
| `list_products` | List products with pagination | Read |
| `get_product` | Get a product by ID | Read |
| `create_product` | Create a new product | Write |
| `update_product` | Update a product | Write |
| `list_prices` | List prices with pagination | Read |
| `get_price` | Get a price by ID | Read |
| `create_price` | Create a new price | Write |

### Payments (3)

| Tool | Description | Type |
|---|---|---|
| `list_payment_intents` | List payment intents with pagination | Read |
| `get_payment_intent` | Get a payment intent by ID | Read |
| `search_payment_intents` | Search payment intents by query | Read |

### Invoices (6)

| Tool | Description | Type |
|---|---|---|
| `list_invoices` | List invoices with pagination | Read |
| `get_invoice` | Get an invoice by ID | Read |
| `create_invoice` | Create a draft invoice | Write |
| `finalize_invoice` | Finalize a draft invoice | Write |
| `void_invoice` | Void an open invoice | Write |
| `search_invoices` | Search invoices by query | Read |

### Subscriptions (3)

| Tool | Description | Type |
|---|---|---|
| `list_subscriptions` | List subscriptions with pagination | Read |
| `get_subscription` | Get a subscription by ID | Read |
| `search_subscriptions` | Search subscriptions by query | Read |

### Balance (2)

| Tool | Description | Type |
|---|---|---|
| `get_balance` | Get account balance | Read |
| `list_balance_transactions` | List balance transactions | Read |

### Events (2)

| Tool | Description | Type |
|---|---|---|
| `list_events` | List recent events | Read |
| `get_event` | Get an event by ID | Read |

## How It Works

This plugin runs inside your Stripe tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
