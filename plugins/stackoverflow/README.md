# Stack Overflow

OpenTabs plugin for Stack Overflow — gives AI agents access to Stack Overflow through your authenticated browser session.

## Install

```bash
opentabs plugin install stackoverflow
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-stackoverflow
```

## Setup

1. Open [stackoverflow.com](https://stackoverflow.com) in Chrome and log in
2. Open the OpenTabs side panel — the Stack Overflow plugin should appear as **ready**

## Tools (20)

### Questions (10)

| Tool | Description | Type |
|---|---|---|
| `search_questions` | Search questions with full-text query and filters | Read |
| `get_question` | Get question details by ID | Read |
| `list_questions` | List questions by activity, votes, or trending | Read |
| `get_question_answers` | Get answers for a question | Read |
| `get_question_comments` | Get comments on a question | Read |
| `list_related_questions` | Get related questions | Read |
| `list_linked_questions` | Get questions linking to a question | Read |
| `list_featured_questions` | List questions with active bounties | Read |
| `list_unanswered_questions` | List questions with no upvoted answers | Read |
| `get_similar_questions` | Find similar questions by title | Read |

### Answers (2)

| Tool | Description | Type |
|---|---|---|
| `get_answer` | Get answer details by ID | Read |
| `get_answer_comments` | Get comments on an answer | Read |

### Users (5)

| Tool | Description | Type |
|---|---|---|
| `get_user` | Get user profile by ID | Read |
| `search_users` | Search users by display name | Read |
| `get_user_questions` | Get questions by a user | Read |
| `get_user_answers` | Get answers by a user | Read |
| `get_my_profile` | Get current user profile | Read |

### Tags (2)

| Tool | Description | Type |
|---|---|---|
| `list_tags` | List tags by popularity or name | Read |
| `get_tag_info` | Get tag details and wiki | Read |

### Search (1)

| Tool | Description | Type |
|---|---|---|
| `search_excerpts` | Search with highlighted excerpts | Read |

## How It Works

This plugin runs inside your Stack Overflow tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
