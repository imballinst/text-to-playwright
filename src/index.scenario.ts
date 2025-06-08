import { readFile } from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';
import { parseArgs } from 'util';
import { parseInputTestFile } from './parser/input';
import { runTests } from './runner';

async function runPlaywrightExample() {
  const parsedArgs = parseArgs({
    options: {
      scenario: {
        type: 'string'
      }
    }
  });
  const {
    values: { scenario }
  } = parsedArgs;
  if (!scenario) throw new Error('The --scenario option must be provided.');

  const testFileContent = await readFile(path.join(process.cwd(), `website/src/examples/${scenario}/test.yaml`), 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ recordVideo: process.env.RECORD ? { dir: 'videos' } : undefined });

  // await page.goto(`http://localhost:4173/${scenario}/`);
  await page.goto(`http://localhost:5173/${scenario}/`);
  // await page.goto(`https://imballinst.github.io/text-to-playwright/${scenario}/`);

  const parsedTestFile = parseInputTestFile(testFileContent);

  try {
    await runTests(page, parsedTestFile);
  } catch (err) {
    console.error(err);
  }

  await browser.close();
  console.info(`✅ All tests completed!`);
}

runPlaywrightExample();
