# Changelog

## [Unreleased]

## [0.3.1] - 2026-10-29

### Changed

- The README has a screenshot and a quick start.

### Fixed

- `--quiet` hides everything except errors, including the startup banner and routes file messages.
- The startup banner only clears the screen when output is a terminal, so logs such as Docker's keep their history.

## [0.3.0] - 2026-10-29

### Added

- `--host` sets the address the server listens on.

### Changed

- The server listens on 127.0.0.1 by default, so only this machine can connect. Use `--host 0.0.0.0` to accept connections from other machines.
- The startup banner shows the address the server listens on.

## [0.2.7] - 2026-10-29

### Fixed

- Routes match on method as well as path. A route with no method answers GET.

## [0.2.6] - 2026-10-28

### Fixed

- A request that fails while being handled gets a 500 instead of stopping the server.
- A path with invalid percent-encoding gets a 400.
- Route paths match characters such as `.` and `(` literally.

## [0.2.5] - 2026-10-28

### Fixed

- Dashboard file requests can no longer read files outside the dashboard folder.

## [0.2.4] - 2026-10-28

### Added

- The package includes the MIT licence file.
- Releases are published from GitHub Actions with npm provenance.

### Changed

- The dashboard is built with SvelteKit 3 and Vite 8.
- The dashboard no longer logs to the browser console when it connects. A lost connection is logged as a warning.

### Fixed

- Phantom starts in a folder with no `routes.json`. It logs where it looked and suggests `phantom init`, instead of crashing.
- Creating `routes.json` while Phantom runs loads its routes without a restart. Deleting it keeps the routes that were already loaded.
- The routes line in the startup log prints once, below the banner, instead of twice above it.
- The package no longer ships compiled tests, type declarations or source maps.

## [0.2.1] - 2026-03-07

### Changed

- Updated the README.

## [0.2.0] - 2026-03-07

### Added

- `phantom init` creates a starter `routes.json` in the current folder.
- `--verbose` and `--quiet` set how much Phantom logs.
- A startup banner shows the version, port, routes file and dashboard address.

## [0.1.2] - 2026-03-05

### Changed

- The dashboard moved to `/_dashboard`. A request to `/` redirects there, unless a route is mocked at `/`.

## [0.1.1] - 2026-03-02

### Changed

- The package is published as `@jamesmddoyle/phantom`.

## [0.1.0] - 2026-03-02

### Added

- A mock API server built on raw TCP sockets, with routes read from `routes.json` and reloaded when the file changes.
- Path parameters, custom response headers, and a delay and error rate for each route.
- A dashboard with a live request feed, search and filters, request and response details, log export and route settings.
- CLI flags for the port, the routes file, and a global delay and error rate.

[Unreleased]: https://github.com/jmmd2000/phantom/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/jmmd2000/phantom/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/jmmd2000/phantom/compare/v0.2.7...v0.3.0
[0.2.7]: https://github.com/jmmd2000/phantom/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/jmmd2000/phantom/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/jmmd2000/phantom/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/jmmd2000/phantom/compare/v0.2.1...v0.2.4
[0.2.1]: https://github.com/jmmd2000/phantom/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/jmmd2000/phantom/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/jmmd2000/phantom/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/jmmd2000/phantom/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/jmmd2000/phantom/releases/tag/v0.1.0
