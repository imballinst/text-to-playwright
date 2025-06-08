import { expect, Page } from '@playwright/test';
import { getLocator } from './locators/common';
import { SliderLocator } from './locators/slider';
import { LoggerSingleton } from './logger';
import { parse } from './parser/command';
import { InputStructure, SharedFields } from './parser/input';

export async function runTests(
  page: Page,
  parsedTestFile: InputStructure,
  opts?: {
    onFinishTestCase: (page: Page) => void | Promise<void>;
  }
) {
  const variables: Record<string, string> = {};
  const globalSelector = parsedTestFile.selector;
  const globalSliderSelector = parsedTestFile.sliderSelector;

  for (const testCase of parsedTestFile.tests) {
    const { name, selector, sliderSelector, steps } = testCase;
    const testSelector = selector ?? globalSelector ?? 'label';
    const testSliderSelector = sliderSelector ?? globalSliderSelector ?? 'native';

    LoggerSingleton.log(name);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      let tmpSelector: SharedFields['selector'];
      let tmpSliderSelector: SharedFields['sliderSelector'];
      let command: string;

      if (typeof step === 'object') {
        command = step.command;
        tmpSelector = step.selector;
        tmpSliderSelector = step.sliderSelector;
      } else {
        command = step;
      }

      const stepSelector = tmpSelector ?? testSelector;
      const stepSliderSelector = tmpSliderSelector ?? testSliderSelector;

      LoggerSingleton.log(`  Step ${i + 1}: ${command}`);
      const parsedCommands = parse(command);

      for (const parsedCommand of parsedCommands) {
        const {
          action,
          elementType,
          object,
          specifier,
          isSection,
          assertBehavior,
          isNegativeAssertion,
          variableName,
          value,
          valueBehavior
        } = parsedCommand;
        const getLocatorOpts = { specifier, isSection };

        if (action === 'click') {
          const locator = getLocator(page, elementType, object, stepSelector, getLocatorOpts);

          await locator.click();
        } else if (action === 'fill') {
          const locator = getLocator(page, elementType, object, stepSelector, getLocatorOpts);

          await locator.fill(value!);
        } else if (action === 'slide') {
          const locator = getLocator(page, stepSliderSelector === 'shadcn' ? 'generic' : elementType, object, stepSelector, getLocatorOpts);
          const slider = new SliderLocator(
            page,
            locator,
            stepSliderSelector === 'shadcn'
              ? {
                  locator: 'span[data-slot=slider-thumb]',
                  valueAttribute: 'aria-valuenow',
                  maxAttribute: 'aria-valuemax',
                  minAttribute: 'aria-valuemin'
                }
              : undefined
          );
          await slider.initSliderAttributes();

          await expect(slider.slider).toBeVisible();

          const numberValue = Number(value);
          if (isNaN(numberValue))
            throw new Error(`Expected valid number for slider value, received ${numberValue} (from ${JSON.stringify(value)})`);

          await slider.move(numberValue);
        } else if (action === 'ensure') {
          const locator = getLocator(page, elementType, object, testSelector, getLocatorOpts);
          const expectedValue = getAssertedValueDependingOnEnv(variables, variableName, value);
          let expectLocator = isNegativeAssertion ? expect(locator).not : expect(locator);

          switch (assertBehavior) {
            case 'exist': {
              await expectLocator.toBeVisible();
              break;
            }
            case 'contain': {
              await expectLocator.toContainText(expectedValue);
              break;
            }
            case 'exact': {
              if (valueBehavior === 'accessible') {
                await expectLocator.toHaveAccessibleDescription(expectedValue);
              } else if (valueBehavior === 'error') {
                const errorTextId = await locator.getAttribute('aria-errormessage');
                const tmpLocator = getLocator(page, 'generic', errorTextId!, 'id');
                expectLocator = isNegativeAssertion ? expect(tmpLocator).not : expect(tmpLocator);

                await expectLocator.toHaveText(expectedValue);
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
          const locator = getLocator(page, elementType, object, testSelector, getLocatorOpts);

          variables[variableName!] = elementType === 'textbox' ? await locator.inputValue() : await locator.innerText();
        } else if (action === 'hover') {
          const locator = getLocator(page, elementType, object, testSelector, getLocatorOpts);

          await locator.hover();
        }
      }
    }

    await opts?.onFinishTestCase(page);
  }
}

// Helper functions.
function getAssertedValueDependingOnEnv(variables: Record<string, string>, variableName?: string, value?: string) {
  if (process.env.MOCK) {
    return variableName ? variableName : `"${value}"`;
  }

  return variableName ? variables[variableName] : value!;
}
