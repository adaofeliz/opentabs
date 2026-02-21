/**
 * `opentabs logs` command — tails the MCP server log output.
 *
 * The log file is written by `opentabs start` at ~/.opentabs/server.log
 * (or $OPENTABS_CONFIG_DIR/server.log).
 */

import { getLogFilePath } from '../config.js';
import { InvalidArgumentError } from 'commander';
import pc from 'picocolors';
import { existsSync, statSync, createReadStream, watch } from 'node:fs';
import type { Command } from 'commander';

interface LogsOptions {
  lines?: number;
  follow?: boolean;
}

const DEFAULT_LINES = 50;

/** Read buffer size for reverse-seek tail (64KB bounds memory usage) */
const TAIL_BUFFER_SIZE = 64 * 1024;

/**
 * Read the last N lines from a file using a reverse-seek approach.
 * Reads at most TAIL_BUFFER_SIZE bytes from the end instead of the entire file.
 * Returns the tail content as a string and the file size (for follow offset).
 */
const tailFile = async (filePath: string, lineCount: number): Promise<{ content: string; fileSize: number }> => {
  const file = Bun.file(filePath);
  const fileSize = file.size;
  if (lineCount <= 0 || fileSize === 0) return { content: '', fileSize };
  const readStart = Math.max(0, fileSize - TAIL_BUFFER_SIZE);
  const chunk = await file.slice(readStart, fileSize).text();
  const lines = chunk.split('\n');
  // If we didn't read from the start, the first line may be partial — skip it
  if (readStart > 0) lines.shift();
  const tail = lines.slice(-lineCount);
  return { content: tail.join('\n'), fileSize };
};

/**
 * Follow (tail -f) a log file. Watches for changes and streams new content.
 * Returns a promise that never resolves (runs until the process exits).
 */
const followFile = async (filePath: string, initialOffset: number): Promise<never> => {
  let offset = initialOffset;
  let reading = false;
  let readRequested = false;

  const readNewContent = (): void => {
    if (reading) {
      readRequested = true;
      return;
    }
    const currentSize = statSync(filePath).size;
    if (currentSize < offset) {
      // File was truncated (e.g., new server start) — read from beginning
      offset = 0;
    }
    if (currentSize <= offset) return;
    reading = true;
    const stream = createReadStream(filePath, { start: offset, encoding: 'utf-8' });
    stream.on('data', (chunk: string | Buffer) => {
      process.stdout.write(chunk);
    });
    stream.on('end', () => {
      offset = currentSize;
      reading = false;
      if (readRequested) {
        readRequested = false;
        readNewContent();
      }
    });
    stream.on('error', () => {
      reading = false;
    });
  };

  const watcher = watch(filePath, () => readNewContent());

  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    watcher.close();
    process.exit(0);
  });

  return new Promise<never>(() => {
    // Runs forever until interrupted
  });
};

const parseLines = (value: string): number => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new InvalidArgumentError('Must be a non-negative integer.');
  }
  return n;
};

const handleLogs = async (options: LogsOptions): Promise<void> => {
  const logFilePath = getLogFilePath();

  if (!existsSync(logFilePath)) {
    console.error(pc.red('No log file found.'));
    console.error(pc.dim(`Expected at: ${logFilePath}`));
    console.error(pc.dim('Start the server with: opentabs start'));
    process.exit(1);
  }

  const lineCount = options.lines ?? DEFAULT_LINES;
  const { content, fileSize } = await tailFile(logFilePath, lineCount);
  if (content) process.stdout.write(content);

  if (options.follow !== false) {
    await followFile(logFilePath, fileSize);
  }
};

const registerLogsCommand = (program: Command): void => {
  program
    .command('logs')
    .description('Tail the MCP server log output')
    .option('--lines <n>', `Number of lines to show (default: ${DEFAULT_LINES})`, parseLines)
    .option('--no-follow', 'Print recent lines and exit (do not follow)')
    .addHelpText(
      'after',
      `
Examples:
  $ opentabs logs                  # Tail logs (follows new output)
  $ opentabs logs --lines 100      # Show last 100 lines then follow
  $ opentabs logs --no-follow      # Show last 50 lines and exit`,
    )
    .action((options: LogsOptions) => handleLogs(options));
};

export { registerLogsCommand };
