import { readFile } from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';
import { parseArgs } from 'util';
import { findAndImportConfig } from './config/config';
import { parseInputTestFile } from './parser/input';
import { runTests } from './runner';

async function run() {
  const parsedArgs = parseArgs({
    allowPositionals: true,
    options: {
      config: {
        type: 'string',
        short: 'c'
      }
    }
  });
  const { positionals, values } = parsedArgs;
  const [pathToYamlFileArg, urlArg] = positionals;

  if (!pathToYamlFileArg) throw new Error('The first argument `pathToYamlFile` must be provided.');
  if (!urlArg) throw new Error('The second argument `url` must be provided.');

  const config = await findAndImportConfig(values.config);
  const testFileContent = await readFile(path.join(process.cwd(), pathToYamlFileArg), 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ recordVideo: process.env.RECORD ? { dir: 'videos' } : undefined });

  const parsedTestFile = parseInputTestFile(testFileContent);
  await page.goto(urlArg);

  try {
    await runTests(page, parsedTestFile, { config });
    console.info(`✅ All tests completed!`);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

run();
