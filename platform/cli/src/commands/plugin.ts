/**
 * `opentabs plugin` command — plugin management (create).
 */

import { scaffoldPlugin, ScaffoldError } from '../scaffold.js';
import pc from 'picocolors';
import type { Command } from 'commander';

// --- Command registration ---

const registerPluginCommand = (program: Command): void => {
  const pluginCmd = program
    .command('plugin')
    .description('Manage plugins')
    .action(() => {
      pluginCmd.help();
    });

  pluginCmd
    .command('create')
    .description('Scaffold a new plugin project')
    .argument('<name>', 'Plugin name (lowercase alphanumeric + hyphens)')
    .requiredOption('--domain <domain>', 'Target domain (e.g., .slack.com or github.com)')
    .option('--display <name>', 'Display name (e.g., Slack)')
    .option('--description <desc>', 'Plugin description')
    .addHelpText(
      'after',
      `
Examples:
  $ opentabs plugin create my-plugin --domain .example.com
  $ opentabs plugin create slack --domain .slack.com --display Slack`,
    )
    .action(async (name: string, options: { domain: string; display?: string; description?: string }) => {
      try {
        await scaffoldPlugin({
          name,
          domain: options.domain,
          display: options.display,
          description: options.description,
        });
      } catch (err: unknown) {
        if (err instanceof ScaffoldError) {
          console.error(pc.red(`Error: ${err.message}`));
          process.exit(1);
        }
        throw err;
      }
    });
};

export { registerPluginCommand };
