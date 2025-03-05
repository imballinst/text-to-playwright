import { readFile } from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';
import { parseInputTestFile } from './parser/input';
import { runTests } from './runner';

async function runPlaywrightExample() {
  const testFileContent = await readFile(path.join(process.cwd(), 'website/src/examples/meter/test.yaml'), 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // await page.goto('http://localhost:4173/meter/');
  await page.goto('http://localhost:5173/meter/');
  // await page.goto('https://imballinst.github.io/text-to-playwright/meter/');

  const parsedTestFile = parseInputTestFile(testFileContent);
  await runTests(page, parsedTestFile);

  await browser.close();
  console.info(`✅ All tests completed!`);
}

runPlaywrightExample();
