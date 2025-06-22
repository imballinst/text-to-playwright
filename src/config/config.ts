import { stat } from 'fs/promises';
import { createJiti } from 'jiti';
import path from 'path';
import z from 'zod/v4';

const CONFIG_NAMES = ['js', 'mjs', 'ts'].map((ext) => `t2p.config.${ext}`);

const Config = z.object({
  globalVariables: z.record(z.string(), z.string().nullish()).optional()
});
export type Config = z.infer<typeof Config>;

export const DEFAULT_CONFIG: Config = {
  globalVariables: {}
};

export async function findAndImportConfig(customFilePath?: string): Promise<Config | undefined> {
  let pathToConfigFile: string | undefined;

  if (!customFilePath) {
    pathToConfigFile = await safeFindExistingFile(CONFIG_NAMES, process.cwd());
  }

  if (!pathToConfigFile) {
    return undefined;
  }

  // This steals from https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-utils/src/moduleUtils.ts#L14.
  const load = createJiti(import.meta.url, {
    cache: true,
    requireCache: false,
    interopDefault: true
  });

  return Config.parse(await load.import(pathToConfigFile));
}

const GLOBAL_VARIABLE_YAML_REGEX = /^\{\{globalEnv\.[\w.]+\}\}$/;

export class ConfigVariables {
  static set(record: Record<string, string>, k: string, v: string | null | undefined) {
    if (v === null || v === undefined) return;

    record[`globalEnv.${k}`] = v;
  }

  static get(record: Record<string, string>, k: string) {
    return record[k.slice(2, -2)];
  }

  static isGlobalVariable(k: string) {
    return GLOBAL_VARIABLE_YAML_REGEX.test(k);
  }
}

// Helper functions.
async function safeFindExistingFile(fileNames: string[], dir: string) {
  for (const fileName of fileNames) {
    try {
      const fullPath = path.join(dir, fileName);

      await stat(path.join(dir, fileName));
      return fullPath;
    } catch (err) {
      // No-op.
    }
  }

  return undefined;
}
