# ClickHouse Cloud

OpenTabs plugin for ClickHouse Cloud — gives AI agents access to ClickHouse Cloud through your authenticated browser session.

## Install

```bash
opentabs plugin install clickhouse
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-clickhouse
```

## Setup

1. Open [console.clickhouse.cloud](https://clickhouse.cloud) in Chrome and log in
2. Open the OpenTabs side panel — the ClickHouse Cloud plugin should appear as **ready**

## Tools (9)

### Organization (2)

| Tool | Description | Type |
|---|---|---|
| `get_organization` | Get organization details | Read |
| `list_organization_members` | List organization members | Read |

### Services (4)

| Tool | Description | Type |
|---|---|---|
| `list_services` | List all services | Read |
| `get_service` | Get service details | Read |
| `get_scaling_limits` | Get region scaling limits | Read |
| `get_private_endpoint_config` | Get private endpoint configuration | Read |

### Monitoring (2)

| Tool | Description | Type |
|---|---|---|
| `query_metrics` | Get service health metrics | Read |
| `get_status` | Get platform status | Read |

### Backups (1)

| Tool | Description | Type |
|---|---|---|
| `list_backups` | List service backups | Read |

## How It Works

This plugin runs inside your ClickHouse Cloud tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
