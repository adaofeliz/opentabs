# Instagram

OpenTabs plugin for Instagram — gives AI agents access to Instagram through your authenticated browser session.

## Install

```bash
opentabs plugin install instagram
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-instagram
```

## Setup

1. Open [instagram.com](https://www.instagram.com) in Chrome and log in
2. Open the OpenTabs side panel — the Instagram plugin should appear as **ready**

## Tools (28)

### Account (1)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the logged-in user profile | Read |

### Users (4)

| Tool | Description | Type |
|---|---|---|
| `get_user_profile` | Get a user profile by username | Read |
| `search_users` | Search for users | Read |
| `get_user_posts` | Get posts from a user | Read |
| `get_user_stories` | Get a user's active stories | Read |

### Feed (2)

| Tool | Description | Type |
|---|---|---|
| `get_home_feed` | Get the home timeline feed | Read |
| `get_stories_tray` | Get stories from followed users | Read |

### Posts (8)

| Tool | Description | Type |
|---|---|---|
| `get_post` | Get a post by media ID | Read |
| `get_post_comments` | Get comments on a post | Read |
| `get_post_likers` | Get users who liked a post | Read |
| `like_post` | Like a post | Write |
| `unlike_post` | Unlike a post | Write |
| `create_comment` | Comment on a post | Write |
| `save_post` | Save a post | Write |
| `unsave_post` | Unsave a post | Write |

### Social (6)

| Tool | Description | Type |
|---|---|---|
| `follow_user` | Follow a user | Write |
| `unfollow_user` | Unfollow a user | Write |
| `get_friendship_status` | Check relationship with a user | Read |
| `get_followers` | List a user's followers | Read |
| `get_following` | List who a user follows | Read |
| `get_suggested_users` | Get follow suggestions | Read |

### Search (2)

| Tool | Description | Type |
|---|---|---|
| `search` | Search users, hashtags, and places | Write |
| `search_hashtags` | Search for hashtags | Read |

### Messaging (3)

| Tool | Description | Type |
|---|---|---|
| `list_conversations` | List DM conversations | Read |
| `get_conversation_messages` | Get messages in a DM conversation | Read |
| `send_message` | Send a direct message | Write |

### Saved (2)

| Tool | Description | Type |
|---|---|---|
| `list_saved_posts` | List your saved posts | Read |
| `list_collections` | List saved collections | Read |

## How It Works

This plugin runs inside your Instagram tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
