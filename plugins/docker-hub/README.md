# Docker Hub

OpenTabs plugin for Docker Hub — gives AI agents access to Docker Hub through your authenticated browser session.

## Install

```bash
opentabs plugin install docker-hub
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-docker-hub
```

## Setup

1. Open [hub.docker.com](https://hub.docker.com) in Chrome and log in
2. Open the OpenTabs side panel — the Docker Hub plugin should appear as **ready**

## Tools (12)

### Users (2)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the authenticated Docker Hub user profile | Read |
| `get_user_profile` | Get a Docker Hub user profile by username | Read |

### Organizations (1)

| Tool | Description | Type |
|---|---|---|
| `list_organizations` | List your Docker Hub organizations | Read |

### Repositories (5)

| Tool | Description | Type |
|---|---|---|
| `list_repositories` | List repositories in a namespace | Read |
| `get_repository` | Get detailed repository information | Read |
| `create_repository` | Create a new Docker Hub repository | Write |
| `update_repository` | Update repository description or visibility | Write |
| `delete_repository` | Permanently delete a repository | Write |

### Tags (2)

| Tool | Description | Type |
|---|---|---|
| `list_tags` | List repository tags | Read |
| `get_tag` | Get tag details including digest and platforms | Read |

### Search (2)

| Tool | Description | Type |
|---|---|---|
| `search_repositories` | Search repositories by keyword | Read |
| `search_catalog` | Search Docker Hub catalog (images, models, extensions) | Read |

## How It Works

This plugin runs inside your Docker Hub tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
