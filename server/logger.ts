import { styleText } from "node:util";
import { hexBg, centerText, COLOURS } from "./utils.ts";

export type LogLevel = "verbose" | "quiet" | "default";

/**
 * Handles terminal output.
 * "default" shows traffic, "verbose" shows system noise, "quiet" is errors only.
 */
class Logger {
  private level: LogLevel = "default";

  constructor(level: LogLevel = "default") {
    this.level = level;
  }

  setLogLevel(level: LogLevel) {
    this.level = level;
  }

  /**
   * Logs an incoming request.
   * Shows in "default" and "verbose" levels.
   */
  request(method: string, status: number, path: string, duration: number) {
    if (this.level === "quiet") return;

    const colours: Record<string, string> = {
      GET: COLOURS.BLUE,
      POST: COLOURS.PURPLE,
      PUT: COLOURS.ORANGE,
      PATCH: COLOURS.PEACH,
      DELETE: COLOURS.RED,
    };

    const methodColour = colours[method.toUpperCase()] || "#ffffff";
    const statusColour = status >= 400 ? "red" : "green";

    const methodBadge = hexBg(methodColour, centerText(method, 6));

    console.log(` ${methodBadge}` + `  ${styleText(statusColour, status.toString())}` + `  ${styleText("white", path.padEnd(35))}` + ` ${styleText("dim", `(${duration}ms)`)}`);
  }

  /**
   * Extra system info.
   * Only shows up in "verbose" mode.
   */
  info(message: string) {
    if (this.level !== "verbose") return;
    console.log(`${styleText("blue", "[Info]  ")} ${styleText("dim", message)}`);
  }

  /**
   * Logs stuff like history clears.
   * Shows in "default" and "verbose" levels.
   */
  admin(message: string) {
    if (this.level === "quiet") return;
    console.log(`${styleText("yellow", "[Admin] ")} ${message}`);
  }

  /**
   * Logs a green checkmark for successful setups.
   */
  success(message: string) {
    if (this.level === "quiet") return;
    console.log(`  \u2713 ${styleText("green", message)}`);
  }

  /**
   * Log an error, always shows regardless of log level.
   */
  error(message: string, error?: any) {
    console.error(`${styleText("red", "[Error] ")} ${message}`);
    if (error) console.error(error);
  }
}

export const logger = new Logger();
