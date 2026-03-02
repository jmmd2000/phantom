import { cac } from "cac";

const cli = cac("phantom");

export function parseCLI() {
  cli
    .option("--port <port>", "Port to run the server on", { default: 3001 })
    .option("--config <path>", "Path to the routes JSON file", {
      default: "routes.json",
    })
    .option("--delay <ms>", "Global delay override for all routes (milliseconds)")
    .option("--error-rate <rate>", "Global error rate override (0.0 to 1.0) for all routes")
    .help()
    .version("0.0.0");

  const parsed = cli.parse();

  if (parsed.options.help || parsed.options.version) {
    process.exit(0);
  }

  return {
    port: Number(parsed.options.port),
    config: String(parsed.options.config),
    delay: parsed.options.delay !== undefined ? Number(parsed.options.delay) : null,
    errorRate: parsed.options.errorRate !== undefined ? Number(parsed.options.errorRate) : null,
  };
}
