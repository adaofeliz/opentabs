/** Prompt text for the `setup_plugin` prompt — plugin installation and configuration workflow. */

export const setupPluginPromptText = (name: string): string => {
  const isFullPackageName = name.includes('/') || name.startsWith('opentabs-plugin-');
  const packageName = isFullPackageName ? name : `opentabs-plugin-${name}`;
  const pluginName = isFullPackageName ? name.replace(/^@[^/]+\//, '').replace(/^opentabs-plugin-/, '') : name;

  return `Set up the **${pluginName}** OpenTabs plugin. Follow each step below.

---

## Step 1: Search for the Plugin

Search npm to find the plugin package:

\`\`\`bash
opentabs plugin search ${pluginName}
\`\`\`

This lists matching packages with their descriptions and versions. Look for the official package (usually \`@opentabs-dev/${packageName}\` or \`${packageName}\`).

If the search returns no results, the plugin may not be published to npm. Check if the user has a local plugin directory to add instead.

---

## Step 2: Install the Plugin

Install the plugin via the CLI:

\`\`\`bash
opentabs plugin install ${packageName}
\`\`\`

This installs the package globally and triggers plugin rediscovery. The MCP server picks it up automatically (no restart needed).

**If the install fails:**
- Check the package name is correct
- Check npm registry access: \`npm ping\`
- For scoped packages, ensure the user is authenticated: \`npm whoami\`

For local plugins (under active development), add the path instead:

\`\`\`bash
opentabs config set localPlugins.add /path/to/plugin
\`\`\`

---

## Step 3: Open the Target Web App

The user needs to open the web app that the plugin targets in a Chrome browser tab. The plugin's URL patterns determine which tabs it matches.

Ask the user to navigate to the appropriate URL in their browser.

---

## Step 4: Verify Plugin Loaded

Check that the plugin was discovered and a matching tab is ready:

\`\`\`
plugin_list_tabs(plugin: "${pluginName}")
\`\`\`

Expected result:
- The plugin appears in the list
- \`state\` is \`ready\` (the tab matches and the plugin's \`isReady()\` returned true)
- At least one tab is shown with \`ready: true\`

**If the plugin is not listed:**
- Check the server logs: \`opentabs logs\`
- The plugin may have failed to load (missing \`dist/adapter.iife.js\`, invalid \`package.json\`, etc.)

**If state is \`unavailable\`:**
- The user may need to log in to the web app first
- Wait a few seconds for the page to finish loading, then re-check

**If state is \`closed\`:**
- No open tab matches the plugin's URL patterns
- Ask the user to open the correct URL

---

## Step 5: Review the Plugin

New plugins start with permission \`off\` (disabled) and must be reviewed before use. This is a security measure — the plugin adapter runs code in the user's authenticated browser session.

### 5a. Inspect the plugin's adapter code:

\`\`\`
plugin_inspect(plugin: "${pluginName}")
\`\`\`

This returns the full adapter IIFE source code, metadata (name, version, author, line count), and a review token.

### 5b. Review the code for security concerns:

Check for:
- **Network requests**: Are they only to the expected API domains? No exfiltration to third-party servers?
- **Data access**: Does it only read data relevant to its tools? No excessive localStorage/cookie reading?
- **DOM manipulation**: Does it only interact with the target web app's UI? No injecting external scripts?
- **Permissions**: Does it request only the capabilities it needs?

### 5c. Mark the plugin as reviewed:

After reviewing and confirming with the user:

\`\`\`
plugin_mark_reviewed(
  plugin: "${pluginName}",
  version: "<version from inspect>",
  reviewToken: "<token from inspect>",
  permission: "ask"
)
\`\`\`

Use \`ask\` permission initially — this requires user approval for each tool call. The user can upgrade to \`auto\` later if they trust the plugin.

---

## Step 6: Test the Plugin

Call a read-only tool first to verify everything works end-to-end:

1. Check which tools are available — they are prefixed with \`${pluginName}_\` (e.g., \`${pluginName}_list_channels\`, \`${pluginName}_get_profile\`)
2. Call a simple read-only tool (list, get, search) to verify:
   - The tool dispatches to the browser tab
   - The adapter extracts auth correctly
   - The API call succeeds
   - The response is well-formatted

If the tool call fails, use the \`troubleshoot\` prompt for guided debugging.

---

## Step 7: Configure Permissions

Once the plugin is working, help the user set permissions based on their trust level:

### Plugin-level permission (applies to all tools):

\`\`\`bash
# Require approval for every tool call (default after review)
opentabs config set plugin-permission.${pluginName} ask

# Auto-approve all tool calls (skip approval dialogs)
opentabs config set plugin-permission.${pluginName} auto

# Disable the plugin
opentabs config set plugin-permission.${pluginName} off
\`\`\`

### Per-tool permissions (override the plugin-level default):

\`\`\`bash
# Auto-approve read-only tools, require approval for write tools
opentabs config set tool-permission.${pluginName}.list_channels auto
opentabs config set tool-permission.${pluginName}.send_message ask
\`\`\`

### Permission resolution order:
1. \`skipPermissions\` env var (bypasses everything — development only)
2. Per-tool override (\`tool-permission.<plugin>.<tool>\`)
3. Plugin default (\`plugin-permission.<plugin>\`)
4. Global default: \`off\`

---

## Summary

After completing all steps, the plugin is:
- Installed and discovered by the MCP server
- Loaded with a matching browser tab in \`ready\` state
- Reviewed and approved with the appropriate permission level
- Tested with at least one successful tool call
- Configured with the user's preferred permission settings

The plugin's tools are now available for use in your AI workflow.

---

## Step 8: Write Learnings Back

If the setup process surfaced new patterns, gotchas, or common issues, write them back into the source files so future AI agents benefit automatically.

**Where to write:**

| What you learned | Write to |
|---|---|
| Installation or discovery issues | \`platform/mcp-server/src/resources/quick-start.ts\` |
| Permission or review flow issues | \`platform/mcp-server/src/prompts/setup-plugin.ts\` (this prompt) |
| New troubleshooting patterns | \`platform/mcp-server/src/resources/troubleshooting.ts\` |

**Rules:**
- Check for duplicates before adding — scan existing content
- Keep learnings generic, not specific to a single plugin
- Verify the server builds after editing: \`cd platform/mcp-server && npm run build\``;
};
