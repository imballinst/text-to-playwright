import { LoggerSingleton } from '../logger';

export type Locator = any;
export type Page = any;

export function expect(locator: any) {
  const getExpectations = (isNegative?: boolean) => ({
    toBeVisible: () => {
      LoggerSingleton.log(`    await ${renderLocator(locator, isNegative)}.toBeVisible()`);
    },
    toContainText: (value: any) => {
      LoggerSingleton.log(`    await ${renderLocator(locator, isNegative)}.toContainText(${value})`);
    },
    toHaveText: (value: any) => {
      LoggerSingleton.log(`    await ${renderLocator(locator, isNegative)}.toHaveText(${value})`);
    },
    toHaveAccessibleDescription: (value: any) => {
      LoggerSingleton.log(`    await ${renderLocator(locator, isNegative)}.toHaveAccessibleDescription(${value})`);
    }
  });

  return {
    not: getExpectations(true),
    ...getExpectations()
  };
}

function renderLocator(locator: any, isNegative: boolean | undefined) {
  return locator + (isNegative ? '.not' : '');
}
