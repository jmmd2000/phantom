import { styleText } from "node:util";
import { hexBg, centreText, COLOURS } from "./utils.ts";

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

    const methodBadge = hexBg(methodColour, centreText(method, 6));

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
   * Logs an admin action, such as clearing the history.
   * Shows in "default" and "verbose" levels.
   */
  admin(message: string) {
    if (this.level === "quiet") return;
    console.log(`${styleText("yellow", "[Admin] ")} ${message}`);
  }

  /**
   * Logs a success line with a green tick.
   * Shows in "default" and "verbose" levels.
   */
  success(message: string) {
    if (this.level === "quiet") return;
    console.log(`  \u2713 ${styleText("green", message)}`);
  }

  /**
   * Logs a change to the routes file.
   * Shows in "default" and "verbose" levels.
   */
  config(message: string) {
    if (this.level === "quiet") return;
    console.log(styleText("blue", `[Config] ${message}`));
  }

  /**
   * Logs something that needs attention but isn't an error.
   * Shows in "default" and "verbose" levels.
   */
  warn(message: string) {
    if (this.level === "quiet") return;
    console.log(styleText("yellow", message));
  }

  /**
   * Prints the startup banner. It clears the screen first only when output is a terminal, so logs such as Docker's keep their history.
   * Shows in "default" and "verbose" levels.
   */
  banner(lines: string[]) {
    if (this.level === "quiet") return;
    if (process.stdout.isTTY) console.clear();

    for (const line of lines) {
      console.log(line);
    }
  }

  /**
   * Logs an error. Always shows, whatever the log level.
   */
  error(message: string, error?: unknown) {
    console.error(`${styleText("red", "[Error] ")} ${message}`);
    if (error) console.error(error);
  }
}

export const logger = new Logger();
