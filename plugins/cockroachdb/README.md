# CockroachDB Cloud

OpenTabs plugin for CockroachDB Cloud — gives AI agents access to CockroachDB Cloud through your authenticated browser session.

## Install

```bash
opentabs plugin install cockroachdb
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-cockroachdb
```

## Setup

1. Open [cockroachlabs.cloud](https://cockroachlabs.cloud) in Chrome and log in
2. Open the OpenTabs side panel — the CockroachDB Cloud plugin should appear as **ready**

## Tools (18)

### Organization (4)

| Tool | Description | Type |
|---|---|---|
| `get_organization` | Get current organization details | Read |
| `list_org_users` | List organization members | Read |
| `get_resource_count` | Get cluster and folder counts | Read |
| `get_user_profile` | Get current user profile | Read |

### Clusters (6)

| Tool | Description | Type |
|---|---|---|
| `list_clusters` | List all clusters in the organization | Read |
| `get_cluster` | Get cluster details by ID | Read |
| `get_cluster_usage` | Get cluster usage metrics | Read |
| `list_cluster_nodes` | List nodes in a cluster | Read |
| `delete_cluster` | Delete a cluster | Write |
| `set_delete_protection` | Enable or disable cluster delete protection | Write |

### Databases (4)

| Tool | Description | Type |
|---|---|---|
| `list_database_names` | List database names in a cluster | Read |
| `list_database_users` | List SQL users in a cluster | Read |
| `create_database_user` | Create a SQL user in a cluster | Write |
| `delete_database_user` | Delete a SQL user from a cluster | Write |

### SQL (1)

| Tool | Description | Type |
|---|---|---|
| `execute_sql` | Execute SQL statements on a cluster | Write |

### Networking (1)

| Tool | Description | Type |
|---|---|---|
| `get_networking_config` | Get cluster networking configuration | Read |

### Billing (2)

| Tool | Description | Type |
|---|---|---|
| `list_invoices` | List organization invoices | Read |
| `get_credit_trial_status` | Get credit trial status | Read |

## How It Works

This plugin runs inside your CockroachDB Cloud tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
