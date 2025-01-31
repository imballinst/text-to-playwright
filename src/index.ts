import { expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';
import { parse } from './parser';

type MaybeAsyncFn<T = any> = (() => T) | (() => Promise<T>);

async function runPlaywrightExample() {
  const file = await readFile(
    path.join(process.cwd(), 'assets/test/index.html'),
    'utf-8'
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(file);

  const parsed = parse('Click "Teams" link, then click "Submit" button.');
  for (const command of parsed) {
    const { action, elementType, object } = command;

    if (action === 'click') {
      const element = page.getByRole(elementType, { name: object });
      await expect(element).toBeVisible();
      await element.click();
    }
  }

  await browser.close();
}

async function waitFor(
  cb: MaybeAsyncFn,
  options?: {
    interval?: number;
    timeout?: number;
  }
) {
  const interval = options?.interval ?? 1000;
  let timeout = options?.timeout ?? 10_000;
  let isPassed = false;

  while (!isPassed) {
    if (timeout < 0) throw new Error('');

    isPassed = await new Promise((res) => {
      setTimeout(async () => {
        try {
          await cb();
          res(true);
        } catch (err) {
          res(false);
        }
      }, interval);
    });

    timeout -= interval;
  }
}

runPlaywrightExample();
