# Target

OpenTabs plugin for Target — gives AI agents access to Target through your authenticated browser session.

## Install

```bash
opentabs plugin install target
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-target
```

## Setup

1. Open [target.com](https://www.target.com) in Chrome and log in
2. Open the OpenTabs side panel — the Target plugin should appear as **ready**

## Tools (18)

### Account (3)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the authenticated Target user profile | Read |
| `get_loyalty_details` | Get Target Circle loyalty balance and savings | Read |
| `get_savings_summary` | Get Target savings breakdown by category | Read |

### Stores (2)

| Tool | Description | Type |
|---|---|---|
| `find_nearby_stores` | Find Target stores near a location | Read |
| `get_store` | Get details for a Target store | Read |

### Products (2)

| Tool | Description | Type |
|---|---|---|
| `search_products` | Search for products on Target | Read |
| `get_product` | Get product details by TCIN | Read |

### Cart (6)

| Tool | Description | Type |
|---|---|---|
| `get_cart` | View current cart contents and total | Read |
| `add_to_cart` | Add a product to the cart | Write |
| `update_cart_item_quantity` | Change item quantity in the cart | Write |
| `remove_cart_item` | Remove an item from the cart | Write |
| `apply_promo_code` | Apply a promo code to the cart | Write |
| `navigate_to_checkout` | Go to checkout to complete purchase | Write |

### Favorites (1)

| Tool | Description | Type |
|---|---|---|
| `list_favorites` | List saved/favorited products | Read |

### Lists (2)

| Tool | Description | Type |
|---|---|---|
| `list_shopping_lists` | List all shopping lists | Read |
| `get_shopping_list` | Get items in a shopping list | Read |

### Orders (2)

| Tool | Description | Type |
|---|---|---|
| `list_orders` | List order history | Read |
| `get_order` | Get details for a specific order | Read |

## How It Works

This plugin runs inside your Target tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
