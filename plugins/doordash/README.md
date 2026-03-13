# DoorDash

OpenTabs plugin for DoorDash — gives AI agents access to DoorDash through your authenticated browser session.

## Install

```bash
opentabs plugin install doordash
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-doordash
```

## Setup

1. Open [doordash.com](https://www.doordash.com) in Chrome and log in
2. Open the OpenTabs side panel — the DoorDash plugin should appear as **ready**

## Tools (11)

### Account (7)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get your DoorDash profile | Read |
| `update_profile` | Update your DoorDash profile | Write |
| `list_addresses` | List your saved delivery addresses | Read |
| `update_default_address` | Set your default delivery address | Write |
| `list_payment_methods` | List your saved payment methods | Read |
| `get_notifications` | Check for new notifications | Read |
| `mark_notifications_read` | Mark notifications as read | Write |

### Orders (2)

| Tool | Description | Type |
|---|---|---|
| `list_orders` | List your order history | Read |
| `get_order` | Get details of a specific order | Read |

### Stores (2)

| Tool | Description | Type |
|---|---|---|
| `bookmark_store` | Save a store as a favorite | Write |
| `unbookmark_store` | Remove a store from favorites | Write |

## How It Works

This plugin runs inside your DoorDash tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
