export const chromium = {
  launch() {
    return {
      newPage(logger: (typeof console)['log']) {
        const locator = createPageOrLocator(logger);
        locator.setContent = () => {};

        return locator;
      },
      close() {}
    };
  }
};

function createPageOrLocator(logger: (typeof console)['log'], prevLocator?: string[], prevAction?: boolean) {
  const obj: Record<string, any> = {
    locatorTextArray: prevLocator ? [...prevLocator] : ['page'],
    isAction: prevAction ?? false,
    logger,
    setContent() {},
    first() {
      const newInstance = createPageOrLocator(logger, this.locatorTextArray, this.isAction);
      newInstance.locatorTextArray.push(`.first()`);

      return newInstance;
    }
  };
  Object.setPrototypeOf(obj, {
    toString: function () {
      const thisObject = this as any;

      const result = thisObject.locatorTextArray.join('');
      if (!thisObject.isAction) return result;

      return `await ${result}`;
    }
  });

  const addedMethods = ['locator', 'getByLabel', 'getByRole'];
  for (const method of addedMethods) {
    obj[method] = function (element: string, opts?: any) {
      const newInstance = createPageOrLocator(logger, obj.locatorTextArray, obj.isAction);
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
    obj[action] = function (...args) {
      const param = action === 'fill' ? `"${args[0]}"` : '';

      const result = this.locatorTextArray.join('');
      logger(`    await ${result}.${action}(${param})`);
    };
  }

  return obj;
}
