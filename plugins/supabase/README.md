# Supabase

OpenTabs plugin for Supabase — gives AI agents access to Supabase through your authenticated browser session.

## Install

```bash
opentabs plugin install supabase
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-supabase
```

## Setup

1. Open [supabase.com](https://supabase.com/dashboard/projects) in Chrome and log in
2. Open the OpenTabs side panel — the Supabase plugin should appear as **ready**

## Tools (26)

### Projects (5)

| Tool | Description | Type |
|---|---|---|
| `list_projects` | List all Supabase projects | Read |
| `get_project` | Get details of a specific project | Read |
| `get_project_health` | Check project service health | Read |
| `pause_project` | Pause a project to save resources | Write |
| `restore_project` | Restore a paused project | Write |

### Organizations (3)

| Tool | Description | Type |
|---|---|---|
| `list_organizations` | List all organizations | Read |
| `get_organization` | Get organization details | Read |
| `list_organization_members` | List members of an organization | Read |

### Database (6)

| Tool | Description | Type |
|---|---|---|
| `run_query` | Execute a SQL query on a project database | Write |
| `run_read_only_query` | Execute a read-only SQL query | Write |
| `generate_types` | Generate TypeScript types from the DB schema | Write |
| `list_migrations` | List applied database migrations | Read |
| `list_backups` | List database backups | Read |
| `list_sql_snippets` | List saved SQL snippets | Read |

### Edge Functions (3)

| Tool | Description | Type |
|---|---|---|
| `list_functions` | List all Edge Functions for a project | Read |
| `get_function` | Get details of an Edge Function | Read |
| `delete_function` | Delete an Edge Function | Write |

### Secrets (4)

| Tool | Description | Type |
|---|---|---|
| `list_secrets` | List project secrets | Read |
| `create_secrets` | Create or update project secrets | Write |
| `delete_secrets` | Delete project secrets by name | Write |
| `get_api_keys` | Get project API keys | Read |

### Storage (1)

| Tool | Description | Type |
|---|---|---|
| `list_buckets` | List storage buckets | Read |

### Analytics (1)

| Tool | Description | Type |
|---|---|---|
| `get_project_logs` | Fetch project logs by source | Read |

### Advisors (2)

| Tool | Description | Type |
|---|---|---|
| `get_performance_advisors` | Get performance advisor recommendations | Read |
| `get_security_advisors` | Get security advisor recommendations | Read |

### Configuration (1)

| Tool | Description | Type |
|---|---|---|
| `get_postgrest_config` | Get PostgREST API configuration | Read |

## How It Works

This plugin runs inside your Supabase tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
