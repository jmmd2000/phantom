import path from "node:path";

// The server reads routes.json from the current folder, so the tests run from the server folder.
process.chdir(path.resolve(import.meta.dirname, ".."));
