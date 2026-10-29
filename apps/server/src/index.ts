#!/usr/bin/env node
import { styleText } from "node:util";
import { readVersion } from "./version.ts";
import { RouteStore } from "./routeStore.ts";
import { RoutesFile } from "./routesFile.ts";
import { parseCLI } from "./cli.ts";
import { PhantomServer } from "./server.ts";
import { logger } from "./logger.ts";
import { hex, hexBg, COLOURS } from "./utils.ts";

const VERSION = readVersion();

const options = parseCLI(VERSION);
const store = new RouteStore();

if (options.command === "init") {
  const defaultRoutes = [
    {
      path: "/health",
      method: "GET",
      status: 200,
      body: { status: "ok", service: "phantom" },
      enabled: true,
      delay: 0,
      errorRate: 0,
      headers: {},
    },
  ];

  new RoutesFile("routes.json", store).write(defaultRoutes);
  logger.success("Created default routes.json");
  logger.info("Run 'phantom' to start the server");
  process.exit(0);
}

const routesFile = new RoutesFile(options.config, store);

if (options.verbose) {
  logger.setLogLevel("verbose");
} else if (options.quiet) {
  logger.setLogLevel("quiet");
}

const phantom = new PhantomServer({
  version: VERSION,
  globalDelay: options.delay,
  globalErrorRate: options.errorRate,
  store,
  routesFile,
});

routesFile.watch();

const port = await phantom.start(options.port, options.host);
showBanner(port, options.host);
// The banner clears the screen, so load the routes after it to keep their log line visible.
routesFile.load();

/**
 * Returns the host for the dashboard link. A browser can't open 0.0.0.0 or ::, which mean every interface.
 */
function dashboardHost(host: string) {
  const isThisMachine = host === "127.0.0.1" || host === "0.0.0.0" || host === "::";
  return isThisMachine ? "localhost" : host;
}

function showBanner(port: number, host: string) {
  console.clear();

  const art = [
    "      ████████      ",
    "    ████████████    ",
    "   ██████████████   ",
    "  ████████████████  ",
    "  ████  ████  ████  ",
    "  ████████████████  ",
    "  ████████████████  ",
    "  ████████████████  ",
    "  ████████████████  ",
    "  ██   ██  ██   ██  ",
  ];

  const brand = hexBg(COLOURS.PURPLE, "PHANTOM");
  const details = [
    `${brand}  ${styleText("white", `v${VERSION}`)}`,
    `address:   ${hex(COLOURS.PURPLE, `${host}:${port}`)}`,
    `config:    ${hex(COLOURS.PURPLE, options.config)}`,
    `dashboard: ${hex(COLOURS.PURPLE, `http://${dashboardHost(host)}:${port}/_dashboard/`)}`,
    styleText("dim", "─".repeat(44)),
  ];

  console.log("");
  art.forEach((line, i) => {
    // start at line 3 of the ASCII art
    const info = details[i - 3] || "";
    console.log(`${hex(COLOURS.PURPLE, line)}  ${info}`);
  });
  console.log("");
}

function shutdown() {
  logger.info("Shutting down Phantom...");

  void phantom.stop().then(() => {
    logger.success("Server stopped");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
