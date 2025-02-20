import { expect, Locator, Page } from '@playwright/test';
import { LoggerSingleton } from './logger';
import { parse } from './parser/command';
import { InputStructure } from './parser/input';
import { AriaRole } from './types/aria';

export async function runTests(page: Page, parsedTestFile: InputStructure) {
  const variables: Record<string, string> = {};
  const innerHtml = await page.innerHTML('html');

  for (const testCase of parsedTestFile.tests) {
    const { name, steps } = testCase;
    LoggerSingleton.log(name);

    for (let i = 0; i < steps.length; i++) {
      const command = steps[i];

      LoggerSingleton.log(`  Step ${i + 1}: ${command}`);
      const parsedCommands = parse(command);

      for (const parsedCommand of parsedCommands) {
        const { action, elementType, object, specifier, assertBehavior, isNegativeAssertion, variableName, value, valueBehavior } =
          parsedCommand;

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
          const expectedValue = getAssertedValueDependingOnEnv(variables, variableName, value);
          let expectLocator = isNegativeAssertion ? expect(locator).not : expect(locator);

          await expect(locator).toBeVisible();

          switch (assertBehavior) {
            case 'contain': {
              await expectLocator.toContainText(expectedValue);
              break;
            }
            case 'exact': {
              if (valueBehavior === 'accessible') {
                await expectLocator.toHaveAccessibleDescription(expectedValue);
              } else {
                await expectLocator.toHaveText(expectedValue);
              }

              break;
            }
            case 'match': {
              if (isNegativeAssertion) {
                expectLocator = expect(locator.getByText(new RegExp(value!))).not;
              }

              await expectLocator.toBeVisible();
              break;
            }
            default:
              break;
          }
        } else if (action === 'store') {
          LoggerSingleton.setPreText(`    let ${variableName} = `);
          const locator = getLocator(page, elementType, object, { specifier });

          variables[variableName!] = elementType === 'textbox' ? await locator.inputValue() : await locator.innerText();
        } else if (action === 'hover') {
          const locator = getLocator(page, elementType, object, { specifier });

          await expect(locator).toBeVisible();
          await locator.hover();
        }
      }
    }

    // Reset the state for the next run.
    await page.reload();
    await page.setContent(innerHtml);
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

      locator = getLocatorByElementType(locator, elementType, name);
    } else {
      locator = page.getByLabel(specifier).getByRole(elementType, { name }).first();
    }
  } else {
    locator = getLocatorByElementType(page, elementType, name);
  }

  return locator;
}

function getLocatorByElementType(locator: Page | Locator, elementType: AriaRole, name: string) {
  if (elementType === 'generic') {
    // If generic, we can't really use `getByRole`, so we need to use `getByLabel`.
    return locator.getByLabel(name).first();
  }

  return locator.getByRole(elementType, { name }).first();
}

function getAssertedValueDependingOnEnv(variables: Record<string, string>, variableName?: string, value?: string) {
  if (process.env.MOCK) {
    return variableName ? variableName : `"${value}"`;
  }

  return variableName ? variables[variableName] : value!;
}
