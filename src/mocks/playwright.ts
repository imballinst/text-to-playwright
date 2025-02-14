import { LoggerSingleton } from '../logger';

export const chromium = {
  launch() {
    return {
      newPage() {
        return createPageOrLocator();
      },
      close() {}
    };
  }
};

export { LoggerSingleton };

const locatorContents: Record<string, string> = {};

function createPageOrLocator(prevLocator?: string[]) {
  const obj: Record<string, any> = {
    locatorTextArray: prevLocator ? [...prevLocator] : ['page'],
    setContent() {},
    first() {
      const newInstance = createPageOrLocator(this.locatorTextArray);
      newInstance.locatorTextArray.push(`.first()`);

      return newInstance;
    }
  };
  Object.setPrototypeOf(obj, {
    toString: function () {
      const thisObject = this as any;
      const result = thisObject.locatorTextArray.join('');

      return result;
    }
  });

  const addedMethods = ['locator', 'getByLabel', 'getByRole'];
  for (const method of addedMethods) {
    obj[method] = function (element: string, opts?: any) {
      const newInstance = createPageOrLocator(obj.locatorTextArray);
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

  const addedActions = ['click', 'fill', 'innerText'];
  for (const action of addedActions) {
    obj[action] = function (...args) {
      const result = this.locatorTextArray.join('');
      let param = '';

      if (action === 'fill') {
        locatorContents[result] = args[0];
        param = `"${args[0]}"`;
      }

      LoggerSingleton.log(`    await ${result}.${action}(${param})`);
    };
  }

  return obj;
}
