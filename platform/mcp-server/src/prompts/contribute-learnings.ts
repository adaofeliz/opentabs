/**
 * contribute_learnings prompt — standalone workflow for writing learnings back
 * into the MCP server source code after completing any task.
 *
 * This prompt enables the self-improvement loop: AI agents that complete tasks
 * (plugin development, troubleshooting, setup, etc.) write their discoveries
 * back into the source files that compile into resources and prompts served
 * by this MCP server. Every future AI session then receives those learnings
 * automatically.
 */

export const contributeLearningsPromptText = (task: string): string => {
  const taskClause = task
    ? `You just completed a task: "${task}"\n\nReview what you learned and write it back into the appropriate source files.`
    : 'Review your recent session for new patterns, gotchas, and techniques, then write them back into the appropriate source files.';

  return `${taskClause}

---

## How the Self-Improvement Loop Works

The OpenTabs MCP server serves AI-facing documentation via three mechanisms:

| Mechanism | MCP method | Source files |
|---|---|---|
| **Instructions** | \`initialize\` (pushed to every session) | \`platform/mcp-server/src/mcp-setup.ts\` (\`SERVER_INSTRUCTIONS\`) |
| **Resources** | \`resources/read\` (pulled on demand) | \`platform/mcp-server/src/resources/*.ts\` |
| **Prompts** | \`prompts/get\` (user-triggered) | \`platform/mcp-server/src/prompts/*.ts\` |

These source files are **TypeScript constants** that compile into the content this server serves. When you edit them and the server rebuilds, every future AI agent that connects receives your learnings automatically. You are currently reading this prompt because a previous session wrote (or improved) it.

---

## Step 1: Identify What You Learned

Review your session for:

- **New patterns** — auth extraction techniques, API discovery methods, Zod schema tricks
- **Gotchas** — things that didn't work as expected, subtle bugs, non-obvious behaviors
- **Resolution steps** — how you fixed an error that isn't documented yet
- **Missing documentation** — things you had to figure out that should have been written down
- **Workflow improvements** — steps that should be added to existing prompts

---

## Step 2: Choose the Right File

| What you learned | Write to | Served as |
|---|---|---|
| Plugin dev patterns, gotchas, conventions | \`platform/mcp-server/src/resources/plugin-development.ts\` | \`opentabs://guide/plugin-development\` resource |
| Plugin dev workflow steps, code templates | \`platform/mcp-server/src/prompts/build-plugin.ts\` | \`build_plugin\` prompt |
| Icon handling patterns | \`platform/mcp-server/src/prompts/plugin-icon.ts\` | \`plugin_icon\` prompt |
| Troubleshooting patterns, error resolution | \`platform/mcp-server/src/resources/troubleshooting.ts\` | \`opentabs://guide/troubleshooting\` resource |
| Troubleshooting workflow improvements | \`platform/mcp-server/src/prompts/troubleshoot.ts\` | \`troubleshoot\` prompt |
| Plugin setup patterns | \`platform/mcp-server/src/prompts/setup-plugin.ts\` | \`setup_plugin\` prompt |
| CLI or config changes | \`platform/mcp-server/src/resources/cli.ts\` | \`opentabs://reference/cli\` resource |
| SDK utility additions | \`platform/mcp-server/src/resources/sdk-api.ts\` | \`opentabs://reference/sdk-api\` resource |
| Browser tool documentation | \`platform/mcp-server/src/resources/browser-tools.ts\` | \`opentabs://reference/browser-tools\` resource |
| Quick start improvements | \`platform/mcp-server/src/resources/quick-start.ts\` | \`opentabs://guide/quick-start\` resource |
| New workflow triggers or instruction gaps | \`platform/mcp-server/src/mcp-setup.ts\` (\`SERVER_INSTRUCTIONS\`) | Initialize instructions (every session) |
| Audit workflow improvements | \`platform/mcp-server/src/prompts/audit-ai-docs.ts\` | \`audit_ai_docs\` prompt |
| This contribution workflow itself | \`platform/mcp-server/src/prompts/contribute-learnings.ts\` | \`contribute_learnings\` prompt |

---

## Step 3: Write the Learnings

**Rules:**
1. **Check for duplicates** — read the target file first; scan existing content before adding
2. **Keep learnings generic** — no app-specific details (e.g., no "Notion uses space IDs")
3. **Be concise and factual** — write for AI consumption, not human narratives
4. **Add to the right section** — place gotchas in gotcha lists, patterns in pattern sections
5. **Preserve existing structure** — match the formatting and style of surrounding content

---

## Step 4: Verify

After editing, verify the server builds:

\`\`\`bash
cd platform/mcp-server && npm run build
\`\`\`

The build must succeed. If it fails, fix the issue before committing.

---

## Step 5: Do NOT Write to Local Files

Write learnings ONLY to the source files listed above. Do NOT write to:
- Local markdown files or skill files
- \`CLAUDE.md\` files (those are for platform contributors, not MCP-served content)
- Documentation site (\`docs/\`) — that's for humans, not AI agents
- Temporary files or scratch notes

The reason: only the source files in \`platform/mcp-server/src/\` compile into MCP content. Anything written elsewhere is invisible to future AI sessions.`;
};
