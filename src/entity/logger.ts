import { stringify } from "../utils/string_helper";

export class Logger {
  static info(msg: string | Error): void {
    if (typeof msg !== "string") {
      msg = stringify(msg);
    }
    console.log(msg);
  }

  static warn(msg: string | Error): void {
    if (typeof msg !== "string") {
      msg = stringify(msg);
    }
    console.warn(msg);
  }

  static error(msg: string | Error): void {
    if (typeof msg !== "string") {
      msg = stringify(msg);
    }
    console.error(msg);
  }

  info(msg: string | Error): void {
    Logger.info(msg);
  }

  warn(msg: string | Error): void {
    Logger.warn(msg);
  }

  error(msg: string | Error): void {
    Logger.error(msg);
  }
}
