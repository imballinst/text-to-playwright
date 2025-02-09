import { expect, Locator, Page } from '@playwright/test';
import { parse } from './parser/command';
import { parseInputTestFile } from './parser/input';
import { AriaRole } from './types/aria';

export async function runTests(page: Page | Locator, testFileContent: string, logger: (typeof console)['log']) {
  const parsedTestFile = parseInputTestFile(testFileContent);

  for (const testCase of parsedTestFile.tests) {
    const { name, steps } = testCase;
    logger(`Running test: ${name}...`);

    for (let i = 0; i < steps.length; i++) {
      const command = steps[i];

      logger(`  Step ${i + 1}: ${command}`);
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
          const locator = getLocator(page, elementType, object, { specifier });

          await expect(locator).toBeVisible();

          if (assertBehavior === 'contain') {
            await expect(locator).toContainText(value!);
          } else if (assertBehavior === 'exact') {
            await expect(locator).toHaveText(value!);
          }
        }
      }
    }
  }
}

// Helper functions.
function getLocator(page: Page | Locator, elementType: AriaRole, name: string, opts?: { specifier?: string }) {
  const { specifier } = opts ?? {};
  let locator: Locator;

  if (specifier) {
    if (/section/i.test(specifier)) {
      locator = page.locator('section', {
        has: page.getByRole('heading', { name: specifier })
      });

      if (elementType === 'generic') {
        // If generic, we can't really use `getByRole`, so we need to use `getByLabel`.
        locator = locator.getByLabel(name).first();
      } else {
        locator = locator.getByRole(elementType, { name }).first();
      }
    } else {
      locator = page.getByLabel(specifier).getByRole(elementType, { name }).first();
    }
  } else {
    locator = page.getByRole(elementType, { name });
  }

  return locator;
}
