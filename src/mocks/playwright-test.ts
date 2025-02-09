export function expect(locator: any) {
  return {
    toBeVisible: () => {
      locator.logger(`    await ${locator}.toBeVisible()`);
    },
    toContainText: (value) => {
      locator.logger(`    await ${locator}.toContainText('${value}')`);
    },
    toHaveText: (value) => {
      locator.logger(`    await ${locator}.toHaveText('${value}')`);
    }
  };
}
