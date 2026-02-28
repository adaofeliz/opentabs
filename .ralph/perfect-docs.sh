#!/bin/bash
# perfect-docs.sh — Invoke Claude to audit docs/ and create PRD(s) to sync them with the codebase.
#
# Usage: bash .ralph/perfect-docs.sh
#
# This script launches a single Claude session (default model) that:
#   1. Reads the current platform source code and docs content
#   2. Identifies docs that are outdated, inaccurate, or missing coverage
#   3. Uses the ralph skill to generate PRD(s) targeting the docs project
#
# The ralph daemon (.ralph/ralph.sh) must be running to pick up the PRDs.
# This script does NOT start ralph — it only creates the PRD files.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read -r -d '' PROMPT <<'PROMPT_EOF' || true
You are auditing the OpenTabs documentation site (docs/) to ensure it accurately reflects the current codebase. Your job is to identify gaps, inaccuracies, and outdated content, then use the ralph skill to create PRDs to fix them.

## Step 1: Read the rules and understand the codebase

1. Read docs/CLAUDE.md — docs project conventions, tech stack, design rules
2. Read CLAUDE.md (root) — overall platform architecture, key concepts, commands
3. Read these package-level CLAUDE.md files for authoritative descriptions of each package's public API, conventions, and architecture:
   - platform/plugin-sdk/CLAUDE.md
   - platform/mcp-server/CLAUDE.md
   - platform/browser-extension/CLAUDE.md
   - platform/cli/CLAUDE.md
   - platform/plugin-tools/CLAUDE.md

These CLAUDE.md files are the source of truth. If the docs contradict a CLAUDE.md, the docs are wrong.

## Step 2: Discover all documentation pages

List all .mdx files under docs/content/docs/ to find every documentation page. Do NOT assume a fixed list — discover them dynamically so you catch any new pages that need auditing or any pages that may have been removed but are still linked.

## Step 3: Audit the documentation against the source code

Systematically compare what the docs say against what the code actually does. For each documentation page, read the corresponding source code and check for:

- **Outdated API signatures** — tool parameters, resource URIs, prompt schemas that have changed in the source but not in the docs
- **Missing features** — new tools, resources, prompts, CLI commands, config options, SDK utilities that exist in the code but are not documented
- **Incorrect behavior descriptions** — docs that describe how something works but the implementation has changed
- **Stale code examples** — example code that would not work against the current API
- **Missing pages** — entire features or concepts that have no documentation page at all
- **Broken cross-references** — links to pages, sections, or code that no longer exist
- **Outdated SVG illustrations** — text labels, version numbers, API signatures, directory structures, or descriptions embedded in SVG illustration components that no longer match the codebase (see Step 3a)
- **Stale `lastUpdated` frontmatter** — pages whose `lastUpdated` date does not reflect when the content was last actually modified (see Step 3b)

### Audit priority order (highest-churn pages first):

1. **SDK Reference** (sdk/*.mdx) — compare every documented function signature, parameter, return type, and example against platform/plugin-sdk/src/ exports. These go stale the fastest.
2. **CLI Reference** (reference/cli.mdx) — compare every documented command, flag, and example against platform/cli/src/commands/. Also check platform/plugin-tools/src/ for the plugin developer CLI.
3. **Configuration** (reference/configuration.mdx) — compare documented config schema against platform/mcp-server/src/config.ts and platform/cli/src/config.ts.
4. **Guides** (guides/*.mdx) — check code examples and described behavior against the actual implementation.
5. **Architecture and MCP server** (contributing/architecture.mdx, reference/mcp-server.mdx) — compare against platform/mcp-server/src/ structure and the root CLAUDE.md architecture description.
6. **Browser tools** (reference/browser-tools.mdx) — compare against platform/mcp-server/src/browser-tools/ and platform/browser-extension/src/.
7. **Root pages and install** (index.mdx, quick-start.mdx, first-plugin.mdx, install/index.mdx) — check that installation steps, quick start flow, and first plugin tutorial still work.
8. **Contributing** (contributing/*.mdx) — compare dev-setup instructions against root package.json scripts and CLAUDE.md commands.

### Step 3a: Audit SVG illustrations

All SVG illustrations are React/TSX components in `docs/components/illustrations.tsx`, registered in `docs/components/MDX.tsx`. These are NOT standalone .svg files — they are inline JSX that render `<svg>` elements with embedded `<text>` content.

Read `docs/components/illustrations.tsx` in full and audit every text string, label, description, version number, directory name, API signature, command, and port number against the actual source code. Common things that go stale in illustrations:

- **Version numbers** — e.g., "Node.js 20+" should match the actual `engines.node` in package.json
- **Port numbers** — e.g., "localhost:9515" should match `DEFAULT_PORT` in platform/shared/src/constants.ts
- **API signatures** — e.g., `defineTool({ name, input, output, handle })` should include all required properties from the actual TypeScript interface
- **CLI commands** — e.g., "opentabs plugin create" should match actual command definitions
- **Directory structures** — e.g., ConfigDirectory, MonorepoStructure, PluginStructure trees should reflect the actual file layout
- **File descriptions** — e.g., "Auth secret + port" should match actual file contents
- **Hook signatures** — e.g., lifecycle hook names and parameters should match the SDK source
- **Error categories** — e.g., ToolError factory methods should match actual exports
- **Missing entries** — new hooks, files, directories, or features that should appear in an illustration but don't

Cross-reference against the docs/CLAUDE.md "Current Illustrations" table to ensure every illustration listed there still exists and is used on the page it claims.

### Step 3b: Audit `lastUpdated` frontmatter dates

Every .mdx file under docs/content/docs/ has a `lastUpdated` field in its frontmatter. For every page that you create a story to update (in Step 4), the story MUST include updating that page's `lastUpdated` to today's date (YYYY-MM-DD format). This ensures the "Last Updated" footer shown on each docs page stays accurate.

Do NOT create standalone stories just to bump dates — only update `lastUpdated` on pages that have substantive content changes in the same story.

### Source code to read:

For each docs page, read the actual source files it documents. Key entry points:

- platform/plugin-sdk/src/index.ts — all SDK exports (the public API surface)
- platform/plugin-sdk/src/*.ts — individual module implementations (errors, dom, fetch, storage, timing, log, page-state)
- platform/mcp-server/src/config.ts — config schema and defaults
- platform/mcp-server/src/browser-tools/ — browser tool implementations
- platform/mcp-server/src/mcp-setup.ts — MCP tool/resource/prompt registration
- platform/mcp-server/src/mcp-tool-dispatch.ts — tool dispatch pipeline
- platform/cli/src/cli.ts — CLI command definitions
- platform/cli/src/commands/ — individual CLI command implementations
- platform/plugin-tools/src/cli.ts — plugin developer CLI commands
- platform/create-plugin/src/index.ts — scaffolding CLI

Read the actual function signatures, exported types, and Zod schemas to compare against what the docs claim.

For illustration auditing, also read:
- docs/components/illustrations.tsx — all SVG illustration components (the full file, every text element)
- docs/components/MDX.tsx — illustration registration (which components are available in MDX)
- platform/shared/src/constants.ts — DEFAULT_PORT and other constants referenced in illustrations
- Root package.json — engines.node version constraint

## Step 4: Create PRD(s) using the ralph skill

After completing the audit, use the skill tool to load the "ralph" skill, then follow its instructions to create PRD(s) for the docs project.

Key parameters for docs PRDs:
- Target project: "OpenTabs Docs"
- workingDirectory: "docs"
- qualityChecks: "cd docs && npm run build && npm run type-check && npm run lint && npm run knip && npm run format:check"
- All stories: e2eCheckpoint: false (docs has no E2E tests)
- Always use small stories (1-3 files per story)
- Include repo-root-relative file paths in the notes field
- Every story must have concrete, verifiable acceptance criteria
- Skip clarifying questions — this prompt provides all the context needed

Do NOT create stories for:
- Cosmetic preferences or stylistic rewording that does not fix an inaccuracy
- Content that is already correct and up-to-date
- Adding documentation for internal implementation details that users/plugin developers do not need
- Bumping `lastUpdated` dates without accompanying content changes

DO create stories for:
- Incorrect or outdated API documentation
- Missing documentation for public features
- Code examples that would fail against the current API
- Stale configuration options or CLI flags
- Architectural descriptions that no longer match reality
- SVG illustrations with outdated text (wrong version numbers, stale API signatures, incorrect directory structures, wrong file descriptions, missing hooks/entries)

### Important: illustration and date rules
- When a story updates an .mdx page, it MUST also update that page's `lastUpdated` frontmatter to the current date (YYYY-MM-DD format)
- When a story updates docs/components/illustrations.tsx, include the specific illustration component name(s) and the exact text changes needed in the acceptance criteria
- Group illustration fixes by topic — e.g., if multiple illustrations reference "Node.js 20+" (should be 22+), fix them all in one story
PROMPT_EOF

echo "=== perfect-docs.sh ==="
echo "Launching Claude to audit docs/ and create PRD(s)..."
echo ""

echo "$PROMPT" | bash "$SCRIPT_DIR/run-prompt.sh"
