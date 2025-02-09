console.info = () => {};

export function expect(locator: any) {
  return {
    toBeVisible: () => {
      console.log(`    await ${locator}.toBeVisible()`);
    },
    toContainText: (value) => {
      console.log(`    await ${locator}.toContainText('${value}')`);
    },
    toHaveText: (value) => {
      console.log(`    await ${locator}.toHaveText('${value}')`);
    }
  };
}
