console.info = () => {};

export function expect(locator: any) {
  return {
    toBeVisible: () => {
      console.debug(`${locator}.toBeVisible()`);
    },
    toContainText: (value) => {
      console.debug(`${locator}.toContainText('${value}')`);
    },
    toHaveText: (value) => {
      console.debug(`${locator}.toHaveText('${value}')`);
    }
  };
}
