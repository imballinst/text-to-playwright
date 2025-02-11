export class LoggerSingleton {
  static log = console.log;

  static setLogger = (fn: typeof console.log) => {
    LoggerSingleton.log = fn;
  };
}
