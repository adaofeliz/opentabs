# Twilio

OpenTabs plugin for Twilio Console — gives AI agents access to Twilio through your authenticated browser session.

## Install

```bash
opentabs plugin install twilio
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-twilio
```

## Setup

1. Open [console.twilio.com](https://console.twilio.com) in Chrome and log in
2. Open the OpenTabs side panel — the Twilio plugin should appear as **ready**

## Tools (35)

### Account (3)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get current Twilio account info | Read |
| `list_subaccounts` | List Twilio subaccounts | Read |
| `get_balance` | Get Twilio account balance | Read |

### Phone Numbers (5)

| Tool | Description | Type |
|---|---|---|
| `list_phone_numbers` | List incoming phone numbers | Read |
| `get_phone_number` | Get phone number details by SID | Read |
| `update_phone_number` | Update phone number configuration | Write |
| `search_available_numbers` | Search for available phone numbers to buy | Read |
| `list_caller_ids` | List verified outgoing caller IDs | Read |

### Messages (4)

| Tool | Description | Type |
|---|---|---|
| `list_messages` | List Messages | Read |
| `get_message` | Get Message | Read |
| `send_message` | Send Message | Write |
| `delete_message` | Delete Message | Write |

### Calls (4)

| Tool | Description | Type |
|---|---|---|
| `list_calls` | List Calls | Read |
| `get_call` | Get Call | Read |
| `create_call` | Create Call | Write |
| `update_call` | Update Call | Write |

### Recordings (3)

| Tool | Description | Type |
|---|---|---|
| `list_recordings` | List Recordings | Read |
| `get_recording` | Get Recording | Read |
| `delete_recording` | Delete Recording | Write |

### Usage (2)

| Tool | Description | Type |
|---|---|---|
| `list_usage_records` | List Usage Records | Read |
| `list_usage_triggers` | List Usage Triggers | Read |

### Messaging Services (3)

| Tool | Description | Type |
|---|---|---|
| `list_messaging_services` | List Messaging Services | Read |
| `get_messaging_service` | Get Messaging Service | Read |
| `create_messaging_service` | Create Messaging Service | Write |

### Verify (3)

| Tool | Description | Type |
|---|---|---|
| `list_verify_services` | List Verify Services | Read |
| `get_verify_service` | Get Verify Service | Read |
| `create_verify_service` | Create Verify Service | Write |

### Alerts (2)

| Tool | Description | Type |
|---|---|---|
| `list_alerts` | List Alerts | Read |
| `get_alert` | Get Alert | Read |

### API Keys (3)

| Tool | Description | Type |
|---|---|---|
| `list_api_keys` | List API Keys | Read |
| `create_api_key` | Create API Key | Write |
| `delete_api_key` | Delete API Key | Write |

### Applications (3)

| Tool | Description | Type |
|---|---|---|
| `list_applications` | List Applications | Read |
| `get_application` | Get Application | Read |
| `create_application` | Create Application | Write |

## How It Works

This plugin runs inside your Twilio tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
