export class LoggerSingleton {
  static log = LoggerSingleton.wrapLogger(console.log);

  // We might want to consider to have a wrapper fn instead for more flexibility later.
  private static preText: string | undefined;

  static setPreText(pre: string) {
    if (!process.env.MOCK) return;

    LoggerSingleton.preText = pre;
  }

  static setLogger = (fn: typeof console.log) => {
    LoggerSingleton.log = LoggerSingleton.wrapLogger(fn);
  };

  private static wrapLogger(fn: typeof console.log) {
    return function log(...args: Parameters<typeof console.log>) {
      const preText = LoggerSingleton.preText ?? '';
      LoggerSingleton.preText = undefined;

      let argsText = args.join(' ');
      if (preText) {
        argsText = argsText.trim();
      }

      fn(preText + argsText);
    };
  }
}
