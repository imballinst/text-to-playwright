import { LoggerSingleton } from '../logger';

export type Locator = any;
export type Page = any;

export function expect(locator: any) {
  return {
    toBeVisible: () => {
      LoggerSingleton.log(`    await ${locator}.toBeVisible()`);
    },
    toContainText: (value: any) => {
      LoggerSingleton.log(`    await ${locator}.toContainText(${value})`);
    },
    toHaveText: (value: any) => {
      LoggerSingleton.log(`    await ${locator}.toHaveText(${value})`);
    }
  };
}
