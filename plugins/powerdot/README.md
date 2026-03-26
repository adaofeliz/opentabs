# PowerDot

OpenTabs plugin for PowerDot EV charger search — gives AI agents access to PowerDot through your authenticated browser session.

## Install

```bash
opentabs plugin install powerdot
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-powerdot
```

## Setup

1. Open [powerdot.eu](https://powerdot.eu/en) in Chrome and log in
2. Open the OpenTabs side panel — the PowerDot plugin should appear as **ready**

## Tools (4)

### Chargers (4)

| Tool | Description | Type |
|---|---|---|
| `list_all_chargers` | List all PowerDot EV charger locations | Read |
| `get_charger_details` | Get details of a specific PowerDot charger by ID | Read |
| `search_chargers_by_country` | Search PowerDot chargers by country | Read |
| `search_chargers_by_location` | Search PowerDot chargers near a location | Read |

## How It Works

This plugin runs inside your PowerDot tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
