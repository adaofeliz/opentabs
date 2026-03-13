# Instacart

OpenTabs plugin for Instacart — search products, manage carts, browse stores, and view orders — gives AI agents access to Instacart through your authenticated browser session.

## Install

```bash
opentabs plugin install instacart
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-instacart
```

## Setup

1. Open [instacart.com](https://www.instacart.com/) in Chrome and log in
2. Open the OpenTabs side panel — the Instacart plugin should appear as **ready**

## Tools (12)

### Account (3)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get your Instacart profile | Read |
| `list_addresses` | List saved delivery addresses | Read |
| `get_location_context` | Get current delivery location info | Read |

### Shopping (2)

| Tool | Description | Type |
|---|---|---|
| `search_products` | Search for grocery products | Read |
| `get_product` | Get product details by item ID | Read |

### Cart (5)

| Tool | Description | Type |
|---|---|---|
| `list_active_carts` | List all shopping carts | Read |
| `get_cart` | Get cart details with items | Read |
| `update_cart_items` | Add, update, or remove cart items | Write |
| `delete_cart` | Delete a shopping cart | Write |
| `navigate_to_checkout` | Open cart for checkout | Write |

### Orders (2)

| Tool | Description | Type |
|---|---|---|
| `list_orders` | List recent orders | Read |
| `get_order` | Get order details | Read |

## How It Works

This plugin runs inside your Instacart tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
