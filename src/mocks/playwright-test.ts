export type Locator = any;
export type Page = any;

export function expect(locator: any) {
  return {
    toBeVisible: () => {
      locator.logger(`    await ${locator}.toBeVisible()`);
    },
    toContainText: (value: any) => {
      locator.logger(`    await ${locator}.toContainText('${value}')`);
    },
    toHaveText: (value: any) => {
      locator.logger(`    await ${locator}.toHaveText('${value}')`);
    }
  };
}
