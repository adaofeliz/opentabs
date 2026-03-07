/**
 * Plugin package.json manifest types and validation.
 *
 * Defines the PluginPackageJson interface representing a plugin's package.json
 * with an `opentabs` field for plugin metadata. The parsePluginPackageJson
 * function validates a raw JSON object and returns a typed Result.
 */

import type { Result } from './result.js';
import { err, ok } from './result.js';

/** Plugin-specific metadata in the `opentabs` field of package.json */
interface PluginOpentabsField {
  readonly displayName: string;
  readonly description: string;
  readonly urlPatterns: string[];
  readonly excludePatterns?: string[];
  readonly homepage?: string;
}

/** A plugin's package.json with the required `opentabs` field */
interface PluginPackageJson {
  readonly name: string;
  readonly version: string;
  readonly main: string;
  readonly opentabs: PluginOpentabsField;
}

/**
 * Validate that a package name matches the opentabs plugin naming convention.
 *
 * Accepts `opentabs-plugin-<name>` (unscoped) and `@scope/opentabs-plugin-<name>` (scoped).
 * The name portion after the prefix must be non-empty.
 */
const isValidPluginPackageName = (name: string): boolean => {
  if (name.startsWith('@')) {
    return /^@[^/]+\/opentabs-plugin-.+$/.test(name);
  }
  return name.startsWith('opentabs-plugin-') && name.length > 'opentabs-plugin-'.length;
};

/**
 * Parse and validate a raw JSON object as a PluginPackageJson.
 *
 * Checks that the object has a valid plugin package name, a version string,
 * a main entry point, and an opentabs field with the required metadata.
 * Returns a Result with the validated PluginPackageJson or a descriptive error.
 */
const parsePluginPackageJson = (json: unknown, sourcePath: string): Result<PluginPackageJson, string> => {
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    return err(`Invalid package.json at ${sourcePath}: expected an object`);
  }

  const obj = json as Record<string, unknown>;

  // Validate name
  const name = obj.name;
  if (typeof name !== 'string' || name.length === 0) {
    return err(`Invalid package.json at ${sourcePath}: "name" must be a non-empty string`);
  }
  if (!isValidPluginPackageName(name)) {
    return err(
      `Invalid plugin package name "${name}" at ${sourcePath}: must start with "opentabs-plugin-" or be a scoped package like "@org/opentabs-plugin-foo"`,
    );
  }

  // Validate version
  const version = obj.version;
  if (typeof version !== 'string' || version.length === 0) {
    return err(`Invalid package.json at ${sourcePath}: "version" must be a non-empty string`);
  }

  // Validate main
  const main = obj.main;
  if (typeof main !== 'string' || main.length === 0) {
    return err(`Invalid package.json at ${sourcePath}: "main" must be a non-empty string`);
  }

  // Validate opentabs field
  const opentabs = obj.opentabs;
  if (typeof opentabs !== 'object' || opentabs === null || Array.isArray(opentabs)) {
    return err(`Invalid package.json at ${sourcePath}: "opentabs" field is required and must be an object`);
  }

  const ot = opentabs as Record<string, unknown>;

  const displayName = ot.displayName;
  if (typeof displayName !== 'string' || displayName.length === 0) {
    return err(`Invalid package.json at ${sourcePath}: "opentabs.displayName" must be a non-empty string`);
  }

  const description = ot.description;
  if (typeof description !== 'string' || description.length === 0) {
    return err(`Invalid package.json at ${sourcePath}: "opentabs.description" must be a non-empty string`);
  }

  const urlPatterns = ot.urlPatterns;
  if (!Array.isArray(urlPatterns) || urlPatterns.length === 0) {
    return err(`Invalid package.json at ${sourcePath}: "opentabs.urlPatterns" must be a non-empty array of strings`);
  }
  for (let i = 0; i < urlPatterns.length; i++) {
    if (typeof urlPatterns[i] !== 'string') {
      return err(`Invalid package.json at ${sourcePath}: "opentabs.urlPatterns[${i}]" must be a string`);
    }
  }

  // Parse excludePatterns (optional)
  const excludePatterns = ot.excludePatterns;
  let parsedExcludePatterns: string[] | undefined;
  if (excludePatterns !== undefined) {
    if (!Array.isArray(excludePatterns)) {
      return err(`Invalid package.json at ${sourcePath}: "opentabs.excludePatterns" must be an array of strings`);
    }
    for (let i = 0; i < excludePatterns.length; i++) {
      if (typeof excludePatterns[i] !== 'string') {
        return err(`Invalid package.json at ${sourcePath}: "opentabs.excludePatterns[${i}]" must be a string`);
      }
    }
    parsedExcludePatterns = excludePatterns as string[];
  }

  // Parse homepage (optional)
  const homepage = ot.homepage;
  let parsedHomepage: string | undefined;
  if (homepage !== undefined) {
    if (typeof homepage !== 'string' || homepage.length === 0) {
      return err(`Invalid package.json at ${sourcePath}: "opentabs.homepage" must be a non-empty string`);
    }
    parsedHomepage = homepage;
  }

  return ok({
    name,
    version,
    main,
    opentabs: {
      displayName,
      description,
      urlPatterns: urlPatterns as string[],
      ...(parsedExcludePatterns ? { excludePatterns: parsedExcludePatterns } : {}),
      ...(parsedHomepage ? { homepage: parsedHomepage } : {}),
    },
  });
};

export { parsePluginPackageJson, isValidPluginPackageName };
export type { PluginOpentabsField, PluginPackageJson };
