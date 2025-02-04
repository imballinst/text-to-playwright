import { expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';
import { chromium, Locator } from 'playwright';
import { parse } from './parser';

type MaybeAsyncFn<T = any> = (() => T) | (() => Promise<T>);

async function runPlaywrightExample() {
  const file = await readFile(path.join(process.cwd(), 'assets/test/index.html'), 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(file);

  const commands = [
    'Click "Teams" link, then click "Submit" button.',
    'Click "Users" link, then fill "User ID" input on the Real Users Section with value "123".',
    'Click "Submit" button on the Real Users Section.'
  ];

  for (const command of commands) {
    const parsedCommands = parse(command);

    for (const parsedCommand of parsedCommands) {
      const { action, elementType, object, specifier, value } = parsedCommand;

      if (action === 'click') {
        let locator: Locator;

        if (specifier) {
          if (/section/i.test(specifier)) {
            locator = page
              .locator('section', {
                has: page.getByRole('heading', { name: specifier })
              })
              .getByRole(elementType, { name: object })
              .first();
          } else {
            locator = page.getByLabel(specifier).getByRole(elementType, { name: object }).first();
          }
        } else {
          locator = page.getByRole(elementType, { name: object });
        }

        await expect(locator).toBeVisible();
        await locator.click();
      } else if (action === 'fill') {
        let locator: Locator;

        if (specifier) {
          if (/section/i.test(specifier)) {
            locator = page
              .locator('section', {
                has: page.getByRole('heading', { name: specifier })
              })
              .getByRole(elementType, { name: object })
              .first();
          } else {
            locator = page.getByLabel(specifier).getByRole(elementType, { name: object }).first();
          }
        } else {
          locator = page.getByRole(elementType, { name: object });
        }

        await expect(locator).toBeVisible();
        await locator.fill(value!);
      }
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
