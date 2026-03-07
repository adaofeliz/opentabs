/** Prompt text for the `troubleshoot` prompt — guided debugging workflow. */

export const troubleshootPromptText = (error: string): string => {
  const errorClause = error
    ? `The user is experiencing this issue: "${error}"\n\nDiagnose this specific problem using the workflow below.`
    : 'Run a general health check of the OpenTabs platform using the workflow below.';

  return `${errorClause}

---

## Step 1: Check Extension Connectivity

\`\`\`
extension_get_state
\`\`\`

Verify the response shows the WebSocket is connected. Key fields to check:
- \`connected\`: must be \`true\`
- \`tabCount\`: number of tracked tabs
- \`injectedAdapters\`: plugins with adapters injected into tabs

**If the extension is not connected:**
1. Verify the Chrome extension is loaded: the user should check \`chrome://extensions/\` and confirm OpenTabs is enabled
2. Verify the MCP server is running: \`opentabs status\`
3. Check if the extension needs to be reloaded: the user should click the refresh icon on the OpenTabs extension card at \`chrome://extensions/\`
4. Check if the side panel is open — opening the OpenTabs side panel triggers the WebSocket connection
5. If the extension was recently updated, the user needs to reload it and reopen the side panel

---

## Step 2: Check Plugin State and Tab Readiness

\`\`\`
plugin_list_tabs
\`\`\`

This returns all loaded plugins with their tab states. For each plugin, verify:
- **state**: \`ready\` means a matching tab is open and the plugin's \`isReady()\` returned true
- **state**: \`unavailable\` means a matching tab exists but \`isReady()\` returned false (auth issue, page still loading)
- **state**: \`closed\` means no tab matches the plugin's URL patterns

**If the target plugin is not listed:**
- The plugin may not be installed: \`opentabs plugin list\`
- The plugin may have failed to load: check \`opentabs logs\` for discovery errors

**If state is \`closed\`:**
- The user needs to open the web app in a browser tab
- The URL must match the plugin's URL patterns

**If state is \`unavailable\`:**
- The user may not be logged in to the web app
- The page may still be loading — wait a few seconds and re-check
- The plugin's \`isReady()\` function may have a bug

---

## Step 3: Check Plugin Permissions

If the error mentions "not reviewed" or "permission":

**Plugin not reviewed (permission is \`off\`):**
1. Call \`plugin_inspect\` with the plugin name to retrieve the adapter source code and a review token
2. Review the code for security concerns (network requests, data access, DOM manipulation)
3. Ask the user to confirm the review
4. Call \`plugin_mark_reviewed\` with the plugin name, version, review token, and desired permission (\`ask\` or \`auto\`)

**Permission denied (user rejected approval):**
- In \`ask\` mode, the user sees an approval dialog for each tool call. If they click "Deny", the tool returns a permission error
- To avoid repeated prompts, the user can set the permission to \`auto\`:
  \`\`\`bash
  opentabs config set plugin-permission.<plugin> auto
  \`\`\`
- Or set per-tool permissions:
  \`\`\`bash
  opentabs config set tool-permission.<plugin>.<tool> auto
  \`\`\`

---

## Step 4: Check for Timeout Issues

If the error mentions "timeout" or "timed out":

- The default dispatch timeout is 30 seconds. Tools that report progress get an extended window (timeout resets on each progress update, up to 5 minutes max)
- Check if the tool is a long-running operation (e.g., large data export, file upload)
- Check if the target web app is slow to respond — use \`browser_get_network_requests\` to inspect API latency
- Check if the extension adapter is responsive:
  \`\`\`
  extension_check_adapter(plugin: "<plugin-name>")
  \`\`\`

---

## Step 5: Check for Rate Limiting

If the error mentions "rate limit" or includes \`retryAfterMs\`:

- The target web app's API is throttling requests
- Wait for the \`retryAfterMs\` duration before retrying
- Reduce the frequency of tool calls to the affected plugin
- Check if the web app has a rate limit dashboard or API usage page

---

## Step 6: Check for Tool Not Found

If the error mentions "tool not found" or "unknown tool":

- Verify the tool name uses the correct prefix: \`<plugin>_<tool>\` (e.g., \`slack_send_message\`)
- Check if the plugin is installed and loaded: \`plugin_list_tabs\`
- The plugin may have been updated and the tool renamed — check the plugin's tool list

---

## Step 7: Inspect Server and Extension Logs

For deeper diagnosis, check the logs:

\`\`\`
extension_get_logs
\`\`\`

This returns recent extension logs including adapter injection events, WebSocket messages, and errors. Look for:
- Adapter injection failures (CSP violations, script errors)
- WebSocket disconnection events
- Tool dispatch errors

Also check the MCP server logs:
\`\`\`bash
opentabs logs
\`\`\`

---

## Step 8: Browser-Level Diagnostics

If the issue persists, use browser tools for deeper investigation:

\`\`\`
browser_get_console_logs(tabId: <tabId>)
\`\`\`

Check for JavaScript errors in the target web app's console.

\`\`\`
browser_enable_network_capture(tabId: <tabId>, urlFilter: "/api")
\`\`\`

Then reproduce the issue and check captured network requests:

\`\`\`
browser_get_network_requests(tabId: <tabId>)
\`\`\`

Look for failed API calls (4xx/5xx responses), CORS errors, or network timeouts.

---

## Quick Reference: Common Errors

| Error | Likely Cause | Resolution |
|-------|-------------|------------|
| Extension not connected | Extension not loaded or side panel closed | Reload extension, open side panel |
| Tab closed | No matching tab open | Open the web app in a browser tab |
| Tab unavailable | User not logged in or page loading | Log in, wait, re-check |
| Plugin not reviewed | Permission is \`off\` | Run the review flow (inspect → review → mark reviewed) |
| Permission denied | User rejected approval dialog | Set permission to \`auto\` via CLI |
| Dispatch timeout | Tool or API too slow | Check network, increase timeout, check adapter |
| Rate limited | API throttling | Wait for retryAfterMs, reduce call frequency |
| Tool not found | Wrong name or plugin not loaded | Verify plugin installed and tool name correct |
| Concurrent dispatch limit | 5 active dispatches per plugin | Wait for in-flight tools to complete |

---

## Step 9: Write Learnings Back

After resolving the issue, write any new troubleshooting patterns, error messages, or resolution steps back into the source files so future AI agents benefit automatically.

**Where to write:**

| What you learned | Write to |
|---|---|
| New error messages or resolution steps | \`platform/mcp-server/src/resources/troubleshooting.ts\` |
| New diagnostic patterns or gotchas | \`platform/mcp-server/src/prompts/troubleshoot.ts\` (this prompt) |
| Permission or config issues | \`platform/mcp-server/src/resources/cli.ts\` |

**Rules:**
- Check for duplicates before adding — scan existing error reference
- Keep patterns generic, not specific to a single user's environment
- Verify the server builds after editing: \`cd platform/mcp-server && npm run build\``;
};
