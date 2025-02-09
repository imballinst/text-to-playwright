export const chromium = {
  launch() {
    return {
      newPage() {
        const locator = createPageOrLocator();
        locator.setContent = () => {};

        return locator;
      },
      close() {}
    };
  }
};

function createPageOrLocator(prevLocator?: string[], prevAction?: boolean) {
  const obj: Record<string, any> = {
    locatorTextArray: prevLocator ? [...prevLocator] : ['page'],
    isAction: prevAction ?? false,
    setContent() {},
    first() {
      const newInstance = createPageOrLocator(this.locatorTextArray, this.isAction);
      newInstance.locatorTextArray.push(`.first()`);

      return newInstance;
    }
  };
  Object.setPrototypeOf(obj, {
    toString: function () {
      const result = this.locatorTextArray.join('');
      if (!this.isAction) return result;

      return `await ${result}`;
    }
  });

  const addedMethods = ['locator', 'getByLabel', 'getByRole'];
  for (const method of addedMethods) {
    obj[method] = function (element: string, opts?: any) {
      const newInstance = createPageOrLocator(obj.locatorTextArray, obj.isAction);
      const renderedArgs: string[] = [`"${element}"`];

      if (opts) {
        const { has, ...rest } = opts;
        const renderedOpts: string[] = [];

        for (const key in rest) {
          renderedOpts.push(`${key}: "${rest[key]}"`);
        }

        if (has) {
          renderedOpts.push(`has: ${has}`);
        }

        renderedArgs.push(`{ ${renderedOpts.join(', ')} }`);
      }

      newInstance.locatorTextArray.push(`.${method}(${renderedArgs.join(', ')})`);

      return newInstance;
    };
  }

  const addedActions = ['click', 'fill'];
  for (const action of addedActions) {
    obj[action] = function () {
      const result = this.locatorTextArray.join('');
      console.log(`    await ${result}.${action}()`);
    };
  }

  return obj;
}
