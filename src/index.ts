import { expect, Page } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';
import { chromium, Locator } from 'playwright';
import { parse } from './parser';
import { AriaRole } from './types/aria';

type MaybeAsyncFn<T = any> = (() => T) | (() => Promise<T>);

async function runPlaywrightExample() {
  const file = await readFile(path.join(process.cwd(), 'assets/test/index.html'), 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(file);

  const commands = [
    'Click "Teams" link, then click "Submit" button.',
    'Click "Users" link, then fill "User ID" input on the Real Users Section with value "123".',
    'Click "Submit" button on the Real Users Section.',
    'Ensure "Real output" element on the Real Users Section to have value "\"123\"".'
  ];

  for (const command of commands) {
    const parsedCommands = parse(command);

    for (const parsedCommand of parsedCommands) {
      const { action, elementType, object, specifier, assertBehavior, value } = parsedCommand;

      if (action === 'click') {
        const locator = getLocator(page, elementType, object, { specifier });

        await expect(locator).toBeVisible();
        await locator.click();
      } else if (action === 'fill') {
        const locator = getLocator(page, elementType, object, { specifier });

        await expect(locator).toBeVisible();
        await locator.fill(value!);
      } else if (action === 'ensure') {
        let locator: Locator;

        if (specifier) {
          if (/section/i.test(specifier)) {
            locator = page.locator('section', {
              has: page.getByRole('heading', { name: specifier })
            });

            if (elementType === 'generic') {
              // If generic, we can't really use `getByRole`, so we need to use `getByLabel`.
              locator = locator.getByLabel(object).first();
            } else {
              locator = locator.getByRole(elementType, { name: object }).first();
            }
          } else {
            locator = page.getByLabel(specifier).getByRole(elementType, { name: object }).first();
          }
        } else {
          locator = page.getByRole(elementType, { name: object });
        }

        await expect(locator).toBeVisible();

        if (assertBehavior === 'contain') {
          await expect(locator).toContainText(value!);
        } else if (assertBehavior === 'exact') {
          await expect(locator).toHaveText(value!);
        }
      }
    }
  }

  await browser.close();
}

function getLocator(page: Page, elementType: AriaRole, name: string, opts?: { specifier?: string }) {
  const { specifier } = opts ?? {};
  let locator: Locator;

  if (specifier) {
    if (/section/i.test(specifier)) {
      locator = page
        .locator('section', {
          has: page.getByRole('heading', { name: specifier })
        })
        .getByRole(elementType, { name })
        .first();
    } else {
      locator = page.getByLabel(specifier).getByRole(elementType, { name }).first();
    }
  } else {
    locator = page.getByRole(elementType, { name });
  }

  return locator;
}

runPlaywrightExample();
