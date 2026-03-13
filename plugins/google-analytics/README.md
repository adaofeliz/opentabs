# Google Analytics

OpenTabs plugin for Google Analytics — gives AI agents access to Google Analytics through your authenticated browser session.

## Install

```bash
opentabs plugin install google-analytics
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-google-analytics
```

## Setup

1. Open [analytics.google.com](https://analytics.google.com) in Chrome and log in
2. Open the OpenTabs side panel — the Google Analytics plugin should appear as **ready**

## Tools (8)

### Account (3)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get current user info | Read |
| `get_active_property` | Get the currently selected GA4 property | Read |
| `list_accounts` | List all GA accounts and properties | Read |

### Reporting (5)

| Tool | Description | Type |
|---|---|---|
| `get_metadata` | List available dimensions and metrics | Read |
| `run_report` | Run a GA4 analytics report | Write |
| `run_realtime_report` | Get realtime analytics data (last 30 minutes) | Write |
| `run_batch_report` | Run multiple reports in one request | Write |
| `check_compatibility` | Check dimension/metric compatibility | Read |

## How It Works

This plugin runs inside your Google Analytics tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
