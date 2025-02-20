import { readFile } from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';
import { parseInputTestFile } from './parser/input';
import { runTests } from './runner';

async function runPlaywrightExample() {
  const fileContent = await readFile(path.join(process.cwd(), 'assets/test/index.html'), 'utf-8');
  const testFileContent = await readFile(path.join(process.cwd(), 'assets/test/test.yaml'), 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(fileContent);

  const parsedTestFile = parseInputTestFile(testFileContent);
  await runTests(page, parsedTestFile);

  await browser.close();
  console.info(`✅ All tests completed!`);
}

runPlaywrightExample();
