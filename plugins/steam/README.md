# Steam

OpenTabs plugin for Steam Store — gives AI agents access to Steam through your authenticated browser session.

## Install

```bash
opentabs plugin install steam
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-steam
```

## Setup

1. Open [store.steampowered.com](https://store.steampowered.com) in Chrome and log in
2. Open the OpenTabs side panel — the Steam plugin should appear as **ready**

## Tools (15)

### Store (6)

| Tool | Description | Type |
|---|---|---|
| `search_store` | Search for games and apps on the Steam store | Read |
| `get_app_details` | Get detailed info about a Steam app | Read |
| `get_featured` | Get featured games on the Steam store | Read |
| `get_featured_categories` | Get specials, top sellers, new releases, coming soon | Read |
| `get_app_reviews` | Get user reviews for a Steam app | Read |
| `get_popular_tags` | List popular Steam store tags | Read |

### Account (2)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get current logged-in Steam user info | Read |
| `get_user_data` | Get wishlist, owned games, and preferences | Read |

### Wishlist (2)

| Tool | Description | Type |
|---|---|---|
| `add_to_wishlist` | Add a game to your Steam wishlist | Write |
| `remove_from_wishlist` | Remove a game from your Steam wishlist | Write |

### Library (4)

| Tool | Description | Type |
|---|---|---|
| `get_app_user_details` | Check ownership, wishlist status, and friends who own an app | Read |
| `follow_app` | Follow an app for update notifications | Write |
| `ignore_app` | Hide an app from recommendations | Write |
| `unignore_app` | Show an app in recommendations again | Write |

### Discovery (1)

| Tool | Description | Type |
|---|---|---|
| `generate_discovery_queue` | Get personalized game recommendations | Write |

## How It Works

This plugin runs inside your Steam tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
