#!/bin/bash
# perfect-cli-plugin-developer.sh — Invoke Claude to perform a plugin-developer CLI experience test and create PRD(s) for frictions found.
#
# Usage: bash .ralph/perfect-cli-plugin-developer.sh
#
# This script launches a single Claude session (default model) that:
#   1. Spins up a Docker container simulating a brand-new plugin developer
#   2. Installs the CLI, scaffolds a plugin, builds it, and exercises all SDK features
#   3. Identifies DX frictions: broken scaffolding, confusing errors, missing guidance
#   4. Uses the ralph skill to generate PRD(s) targeting the root monorepo
#
# Prerequisites:
#   - Docker running (Docker Desktop or OrbStack)
#   - ~/.npmrc with valid auth token for @opentabs-dev packages
#
# The ralph daemon (.ralph/ralph.sh) must be running to pick up the PRDs.
# This script does NOT start ralph — it only creates the PRD files.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read -r -d '' PROMPT <<'PROMPT_EOF' || true
You are a QA engineer performing a first-time plugin developer experience test for the OpenTabs platform. Your job is to go through the entire plugin development workflow exactly as a new developer would — scaffold, build, use every SDK feature, exercise every CLI command — and identify every friction point. Then use the ralph skill to create PRD(s) to fix them.

## Important context

- The @opentabs-dev packages are published to the public npm registry. Treat them as public.
- Lack of mock/unit testing for plugin tool handlers is NOT an issue — plugins must be tested in a real browser with real auth. Do not report this as friction.
- The Chrome extension cannot be tested inside Docker (no GUI). That is expected. Focus on CLI and build toolchain friction only.

## Step 1: Read the rules and understand the project

Read these files to understand the intended developer experience:

1. CLAUDE.md (root) — overall platform architecture, key concepts
2. platform/cli/CLAUDE.md — CLI commands
3. platform/plugin-sdk/CLAUDE.md — SDK API surface, what's available to plugin developers
4. platform/plugin-tools/CLAUDE.md — plugin build toolchain
5. platform/create-plugin/CLAUDE.md — scaffolding CLI
6. platform/cli/src/scaffold.ts — the actual scaffold code that generates plugin files
7. docs/content/docs/quick-start.mdx — the documented quick-start flow
8. docs/content/docs/first-plugin.mdx — the documented first-plugin tutorial
9. docs/content/docs/guides/plugin-development.mdx — comprehensive plugin dev guide
10. docs/content/docs/guides/resources-prompts.mdx — resources and prompts guide

Understanding the source is critical — you need to know the intended behavior to evaluate whether the actual behavior matches developer expectations.

## Step 2: Set up a clean Docker environment

Launch a plain Node.js 22 container to simulate a brand-new developer machine:

```bash
docker run --rm -d \
  --name opentabs-plugin-dev-test \
  --network host \
  -v "$HOME/.npmrc:/root/.npmrc:ro" \
  node:22 \
  tail -f /dev/null
```

All commands run via `docker exec`. Example:
```bash
docker exec opentabs-plugin-dev-test npm install -g @opentabs-dev/cli
docker exec -w /root/my-plugin opentabs-plugin-dev-test npm run build
```

Use `docker exec -w <dir>` to set the working directory — never `cd && command`.

IMPORTANT: Clean up the container when done: `docker stop opentabs-plugin-dev-test`

## Step 3: Walk through the COMPLETE plugin developer journey

Act as a first-time plugin developer. Be thorough and methodical.

### Phase 1: Install and start the platform

1. `npm install -g @opentabs-dev/cli` — install the CLI
2. `opentabs --version` and `opentabs --help`
3. Start the server in the background:
   ```bash
   docker exec -d opentabs-plugin-dev-test bash -c "opentabs start > /tmp/start.log 2>&1"
   sleep 5
   docker exec opentabs-plugin-dev-test cat /tmp/start.log
   ```
4. Verify with `opentabs status`

### Phase 2: Test the scaffolding CLI — both invocation paths

1. **`npx create-opentabs-plugin`** — test the documented command:
   ```bash
   docker exec -w /tmp opentabs-plugin-dev-test npx create-opentabs-plugin test-a --domain example.com
   ```
   This may fail (404) because the package is scoped as @opentabs-dev/create-plugin but docs reference the unscoped binary name. Document the result.

2. **`npx @opentabs-dev/create-plugin`** — test the scoped invocation:
   ```bash
   docker exec -w /tmp opentabs-plugin-dev-test npx @opentabs-dev/create-plugin test-b --domain example.com
   ```

3. **`opentabs plugin create`** — test the CLI subcommand:
   ```bash
   docker exec -w /root opentabs-plugin-dev-test opentabs plugin create my-plugin --domain example.com --display "My Plugin"
   ```

4. **Non-interactive mode without required args** (stdin is not a TTY in Docker):
   ```bash
   docker exec opentabs-plugin-dev-test opentabs plugin create
   ```

5. **Validation edge cases**:
   - Reserved name: `opentabs plugin create system --domain example.com`
   - Invalid name: `opentabs plugin create MyPlugin --domain example.com`
   - Overly broad domain: `opentabs plugin create test --domain "*.com"`
   - Duplicate directory: create the same plugin name twice

### Phase 3: Build the scaffolded plugin and check quality

For the plugin created in Phase 2 step 3:

1. `npm install`
2. `npm run build` — should compile and bundle
3. **Run ALL quality checks on the freshly scaffolded code** (this is critical):
   - `npm run type-check`
   - `npm run lint` — CHECK IF THIS PASSES. The scaffolder may generate code that violates the project's own lint rules.
   - `npm run format:check` — CHECK IF THIS PASSES.
   - If lint/format fails, run `npm run lint:fix` and `npm run format` to verify they auto-fix, then document the friction.
4. `npx opentabs-plugin inspect` — verify manifest
5. `npx opentabs-plugin inspect --json`
6. `opentabs plugin list` — verify the plugin appears
7. `opentabs status` — verify tool count

### Phase 4: Build a real plugin using ALL SDK features

Modify the scaffolded plugin to exercise every SDK capability. Create a plugin for example.com with:

1. **Multiple tools** using `defineTool`:
   - A tool using DOM utilities: `getCurrentUrl`, `getPageTitle`, `querySelectorAll`, `getTextContent`
   - A tool using fetch utilities: `fetchJSON`, `retry`, `ToolError`
   - A tool using progress reporting: `context.reportProgress()`
   - A tool using storage: `getCookie`, `getLocalStorage`
   - A tool using page state: `getPageGlobal`
   - A tool using timing: `sleep`, `waitUntil`

2. **A resource** using `defineResource` — note whether `override` is needed on the `resources` property

3. **A prompt** using `definePrompt` with typed `args` (Zod schema)

4. **All lifecycle hooks**: `onActivate`, `onDeactivate`, `onNavigate`, `onToolInvocationStart`, `onToolInvocationEnd`

5. **Logging**: `log.info`, `log.debug`, `log.warn`, `log.error`

6. **Error handling**: `ToolError.auth()`, `ToolError.notFound()`, `ToolError.rateLimited()`, etc.

7. **isReady() implementation**: a real readiness check (e.g., `document.readyState`)

After writing all the code:
- `npm run build` — must succeed
- `npm run type-check` — must succeed
- `npm run lint` — check for errors
- `npx opentabs-plugin inspect` — verify all tools, resources, prompts appear

Document any TypeScript errors, confusing error messages, or missing documentation you encounter while writing the plugin (e.g., needing `override` on `resources`/`prompts` but not knowing it).

### Phase 5: Test the dev workflow

1. Test watch mode briefly: `timeout 15 npm run dev` — verify it starts and does an initial build
2. Test `opentabs-plugin build --watch` separately

### Phase 6: Test plugin management CLI commands

1. `opentabs plugin search` — list available plugins
2. `opentabs plugin search slack`
3. `opentabs plugin search nonexistent-xyz-12345`
4. `opentabs plugin install slack` — install from npm
5. `opentabs plugin list` and `opentabs plugin list -v` — verify both plugins
6. `opentabs plugin remove slack` (without --confirm, then with --confirm)
7. `opentabs config set tool.` — list available tools
8. `opentabs config set tool.<plugin>_<tool> disabled` — disable a tool
9. `opentabs config show`
10. `opentabs config set localPlugins.add /nonexistent/path` — check behavior with bad paths

### Phase 7: Test npx opentabs-plugin outside a plugin directory

```bash
docker exec -w /tmp opentabs-plugin-dev-test npx opentabs-plugin build
```

This tests what happens when a developer runs the build command without having @opentabs-dev/plugin-tools installed locally. The binary name `opentabs-plugin` doesn't match the package name `@opentabs-dev/plugin-tools`, which may cause a confusing 404 error.

### Phase 8: Check documentation accuracy

Compare what you experienced against the docs:
- Does `npx create-opentabs-plugin` work as documented?
- Does the first-plugin tutorial code compile without modifications?
- Are the `override` keywords documented for `resources` and `prompts`?
- Are there inconsistencies between docs pages?

### Phase 9: Cleanup

```bash
docker stop opentabs-plugin-dev-test
```

## Step 4: Evaluate every interaction for friction

For each step, evaluate from a first-time plugin developer's perspective:

1. **Scaffolding quality**: Does the generated code pass its own lint/format rules?
2. **Build toolchain**: Are errors clear? Does the build pipeline guide the developer?
3. **SDK discoverability**: Can the developer figure out how to use resources, prompts, lifecycle hooks?
4. **TypeScript experience**: Are type errors clear? Is `override` documented?
5. **Documentation accuracy**: Do the documented commands actually work?
6. **Error messages**: Do errors tell the developer what to do next?
7. **CLI consistency**: Are patterns consistent across `opentabs` and `opentabs-plugin`?

### Known friction categories from prior testing:

These are frictions that HAVE been observed. Verify they still exist and add any new ones:

1. **Scaffolded code fails lint/format** — The scaffold generates double-quoted strings but .prettierrc enforces singleQuote:true. Every fresh scaffold has 7 lint errors on `npm run lint`.

2. **`npx create-opentabs-plugin` returns 404** — The docs reference this command but the package is scoped as `@opentabs-dev/create-plugin`. Only `npx @opentabs-dev/create-plugin` or `npm create @opentabs-dev/plugin` works.

3. **`resources` and `prompts` need `override` but developer doesn't know** — When adding resources or prompts to a plugin, TypeScript requires `override readonly resources` because they're optional properties with defaults on the base class. The scaffolded code doesn't show this, the first-plugin tutorial doesn't cover it, and the error message (TS4114) doesn't explain the fix.

4. **`npx opentabs-plugin build` outside a plugin dir gives 404** — Running the command when not installed locally causes npm to look for an unscoped `opentabs-plugin` package which doesn't exist. The error is a confusing npm 404.

5. **`localPlugins.add` accepts nonexistent paths** — Adding a nonexistent path succeeds with only a dim warning. Easy to typo a path and have a broken config.

6. **Non-interactive scaffold error is unhelpful** — Running `opentabs plugin create` without args in a non-TTY context says "run interactively" without showing the full flag syntax.

## Step 5: Create PRD(s) using the ralph skill

After completing all testing, compile your findings and use the skill tool to load the "ralph" skill, then create PRD(s).

Key parameters:
- Target project: "OpenTabs Platform" (root monorepo)
- Do NOT set workingDirectory or qualityChecks (root monorepo uses defaults)
- Group related fixes into the same PRD to avoid merge conflicts (fixes to the same file go together)
- All stories: e2eCheckpoint: false (CLI/scaffold changes are not browser-observable)
- Always use small stories (1-3 files per story)
- Include repo-root-relative file paths and approximate line numbers in the notes field
- Every story must have concrete, verifiable acceptance criteria
- Skip clarifying questions — this prompt provides all the context needed

Severity triage:
- **HIGH**: Scaffolded code that fails its own quality checks, documented commands that don't work
- **MEDIUM**: Missing guidance, confusing errors, poor discoverability
- **LOW**: Cosmetic issues, minor inconsistencies

Only create PRDs for HIGH and MEDIUM issues. Document LOW issues in the PRD description field as known minor issues but do not create stories for them.

Do NOT create stories for:
- Lack of unit/mock testing (by design — plugins must test in a real browser)
- Chrome extension not working in Docker (expected — no GUI)
- Stylistic preferences about CLI output formatting
- Features that work correctly but you would design differently

DO create stories for:
- Scaffolded code that fails lint/format/type-check out of the box
- Documented commands that return errors (e.g., npx create-opentabs-plugin 404)
- Missing TypeScript guidance that causes confusing compiler errors
- Error messages that don't help the developer fix the problem
- Documentation inaccuracies
PROMPT_EOF

echo "=== perfect-cli-plugin-developer.sh ==="
echo "Launching Claude to test plugin developer experience and create PRD(s)..."
echo ""

echo "$PROMPT" | bash "$SCRIPT_DIR/run-prompt.sh"
