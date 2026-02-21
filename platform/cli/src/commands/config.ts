/**
 * `opentabs config` command — view and manage configuration.
 */

import { atomicWriteConfig, getConfigDir, getConfigPath, readConfig } from '../config.js';
import pc from 'picocolors';
import { existsSync, mkdirSync } from 'node:fs';
import type { Command } from 'commander';

const REDACTED = '***';

const redactSecret = (config: Record<string, unknown>): Record<string, unknown> => {
  if (typeof config.secret === 'string') {
    return { ...config, secret: REDACTED };
  }
  return config;
};

const handleConfigPath = (): void => {
  console.log(getConfigPath());
};

interface ConfigInitOptions {
  force?: boolean;
}

const handleConfigInit = async (options: ConfigInitOptions): Promise<void> => {
  const configPath = getConfigPath();

  if (existsSync(configPath) && !options.force) {
    console.log(pc.yellow(`Config already exists at ${configPath}`));
    console.log('Use --force to overwrite.');
    return;
  }

  const configDir = getConfigDir();
  mkdirSync(configDir, { recursive: true });

  const config = { plugins: [], tools: {}, secret: crypto.randomUUID() };
  await atomicWriteConfig(configPath, JSON.stringify(config, null, 2) + '\n');

  console.log(pc.green(`Config created at ${configPath}`));
};

interface ConfigShowOptions {
  json?: boolean;
}

const handleConfigShow = async (options: ConfigShowOptions): Promise<void> => {
  const configPath = getConfigPath();
  const config = await readConfig(configPath);

  if (!config) {
    console.error(pc.red(`No config found at ${configPath}`));
    console.error('Run opentabs config init to create one.');
    process.exit(1);
  }

  const redacted = redactSecret(config);

  if (options.json) {
    console.log(JSON.stringify(redacted, null, 2));
  } else {
    console.log(pc.bold('OpenTabs Config'));
    console.log(pc.dim(configPath));
    console.log('');

    for (const [key, value] of Object.entries(redacted)) {
      if (key === 'plugins' && Array.isArray(value)) {
        console.log(`  ${pc.cyan('plugins')}`);
        if (value.length === 0) {
          console.log(`    ${pc.dim('(none)')}`);
        } else {
          for (const p of value) {
            console.log(`    - ${String(p)}`);
          }
        }
      } else if (key === 'tools' && typeof value === 'object' && value !== null) {
        const entries = Object.entries(value as Record<string, unknown>);
        console.log(`  ${pc.cyan('tools')}`);
        if (entries.length === 0) {
          console.log(`    ${pc.dim('(none)')}`);
        } else {
          for (const [toolName, enabled] of entries) {
            const indicator = enabled ? pc.green('enabled') : pc.red('disabled');
            console.log(`    ${toolName}: ${indicator}`);
          }
        }
      } else {
        const display =
          typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
            ? String(value)
            : JSON.stringify(value);
        console.log(`  ${pc.cyan(key)}  ${display}`);
      }
    }
  }
};

const TOOL_PREFIX = 'tool.';

const handleConfigSet = async (key: string, value: string): Promise<void> => {
  if (!key.startsWith(TOOL_PREFIX)) {
    console.error(pc.red(`Unknown config key: ${key}`));
    console.error(`Supported keys: tool.<plugin>_<tool>`);
    process.exit(1);
  }

  const toolName = key.slice(TOOL_PREFIX.length);
  if (!toolName || !toolName.includes('_')) {
    console.error(pc.red(`Invalid tool name: ${toolName || '(empty)'}`));
    console.error('Tool names use the format <plugin>_<tool>, e.g. slack_send_message');
    process.exit(1);
  }

  if (value !== 'enabled' && value !== 'disabled') {
    console.error(pc.red(`Invalid value: ${value}`));
    console.error('Value must be "enabled" or "disabled".');
    process.exit(1);
  }

  const configPath = getConfigPath();
  const config = await readConfig(configPath);

  if (!config) {
    console.error(pc.red(`No config found at ${configPath}`));
    console.error('Run opentabs config init to create one.');
    process.exit(1);
  }

  if (!config.tools || typeof config.tools !== 'object' || Array.isArray(config.tools)) {
    config.tools = {};
  }
  const tools = config.tools as Record<string, boolean>;
  const enabled = value === 'enabled';
  tools[toolName] = enabled;

  await atomicWriteConfig(configPath, JSON.stringify(config, null, 2) + '\n');

  const indicator = enabled ? pc.green('enabled') : pc.red('disabled');
  console.log(`${toolName}: ${indicator}`);
};

const registerConfigCommand = (program: Command): void => {
  const configCmd = program
    .command('config')
    .description('View configuration details')
    .action(() => {
      configCmd.help();
    });

  configCmd
    .command('init')
    .description('Create config file with sensible defaults')
    .option('--force', 'Overwrite existing config')
    .addHelpText(
      'after',
      `
Examples:
  $ opentabs config init
  $ opentabs config init --force`,
    )
    .action((options: ConfigInitOptions) => handleConfigInit(options));

  configCmd
    .command('set <key> <value>')
    .description('Set a config value (e.g. tool.slack_send_message enabled)')
    .addHelpText(
      'after',
      `
Examples:
  $ opentabs config set tool.slack_send_message disabled
  $ opentabs config set tool.slack_send_message enabled`,
    )
    .action((key: string, value: string) => handleConfigSet(key, value));

  configCmd
    .command('path')
    .description('Print the config file path')
    .addHelpText(
      'after',
      `
Examples:
  $ opentabs config path`,
    )
    .action(() => handleConfigPath());

  configCmd
    .command('show')
    .description('Show config contents (secret redacted)')
    .option('--json', 'Output config as JSON')
    .addHelpText(
      'after',
      `
Examples:
  $ opentabs config show
  $ opentabs config show --json`,
    )
    .action((options: ConfigShowOptions) => handleConfigShow(options));
};

export { registerConfigCommand };
