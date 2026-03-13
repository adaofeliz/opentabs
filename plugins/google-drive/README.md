# Google Drive

OpenTabs plugin for Google Drive — gives AI agents access to Google Drive through your authenticated browser session.

## Install

```bash
opentabs plugin install google-drive
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-google-drive
```

## Setup

1. Open [drive.google.com](https://drive.google.com) in Chrome and log in
2. Open the OpenTabs side panel — the Google Drive plugin should appear as **ready**

## Tools (17)

### Account (2)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get Drive user profile and storage info | Read |
| `get_storage_quota` | Get Drive storage usage and limits | Read |

### Files (12)

| Tool | Description | Type |
|---|---|---|
| `list_files` | List files and folders in a Drive folder | Read |
| `get_file` | Get file or folder details by ID | Read |
| `search_files` | Search files by name or content | Read |
| `create_file` | Create a new file in Google Drive | Write |
| `create_folder` | Create a new folder | Write |
| `update_file` | Update file or folder metadata | Write |
| `delete_file` | Permanently delete a file or folder | Write |
| `move_file` | Move a file to a different folder | Write |
| `copy_file` | Create a copy of a file | Write |
| `trash_file` | Move a file to the trash | Write |
| `restore_file` | Restore a file from the trash | Write |
| `empty_trash` | Permanently delete all trashed files | Write |

### Sharing (3)

| Tool | Description | Type |
|---|---|---|
| `list_permissions` | List sharing permissions on a file | Read |
| `create_permission` | Share a file with someone | Write |
| `delete_permission` | Remove sharing access from a file | Write |

## How It Works

This plugin runs inside your Google Drive tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
