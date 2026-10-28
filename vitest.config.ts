import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

const serverRoot = path.resolve(import.meta.dirname, "server");
const integrationTests = "__tests__/**/*.integration.test.ts";

const serverProject = { root: serverRoot };

const serverTest = {
  expect: { requireAssertions: true },
  environment: "node",
  setupFiles: ["./__tests__/vitest.setup.ts"],
};

export default defineConfig({
  test: {
    reporters: ["dot"],
    projects: [
      {
        ...serverProject,
        test: {
          ...serverTest,
          name: "server-unit",
          include: ["__tests__/**/*.test.ts"],
          exclude: [...configDefaults.exclude, integrationTests],
        },
      },
      {
        ...serverProject,
        test: {
          ...serverTest,
          name: "server-integration",
          include: [integrationTests],
        },
      },
    ],
  },
});
