/**
 * Permission bypass detection — determined once at startup.
 *
 * Set OPENTABS_DANGEROUSLY_SKIP_PERMISSIONS=1 to bypass approval prompts
 * for tools in 'ask' mode (converts them to 'auto'). Tools set to 'off'
 * remain disabled. Intended for CI/testing environments where no human is
 * available to approve tool calls.
 */

const skipPermissions = process.env.OPENTABS_DANGEROUSLY_SKIP_PERMISSIONS === '1';

/** Whether the env var requests permission bypass */
export const isCliSkipPermissions = (): boolean => skipPermissions;
