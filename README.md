# PHANTOM

[![npm version](https://img.shields.io/npm/v/%40jamesmddoyle%2Fphantom?color=5e4d8a)](https://www.npmjs.com/package/@jamesmddoyle/phantom)
[![CI](https://github.com/jmmd2000/phantom/actions/workflows/ci.yml/badge.svg)](https://github.com/jmmd2000/phantom/actions/workflows/ci.yml)

Phantom is a low-level API mocker and traffic inspector. Built using raw Node.js TCP sockets. It includes a built in dashboard for real-time monitoring and route configuration.

![Phantom dashboard](https://raw.githubusercontent.com/jmmd2000/phantom/master/docs/dashboard.png)

## Quick start

```bash
npx @jamesmddoyle/phantom init
npx @jamesmddoyle/phantom
```

The dashboard runs at http://localhost:3001/_dashboard/.

## Features

- **Traffic Inspector**: View request and response headers, bodies, and latency in a real-time feed.
- **Chaos Engine**: Injected artificial delays and random error rates on a per-route basis.
- **Deep Search**: Filter request history by path, method, or content within the body.
- **Self-Contained**: The server serves both the mock API and the static dashboard UI on a single port.
- **Binary Support**: Capability to handle and serve binary assets like images.

## How it's built

Phantom is built on raw TCP sockets, not Node's `http` module. HTTP parsing and WebSocket framing are written by hand.

## Installation

Install Phantom globally via npm:

```bash
npm i -g @jamesmddoyle/phantom
```

## Usage

Run `phantom init` to create a starter `routes.json` file in your current directory.

To start the server, run `phantom` in any directory. It will look for a `routes.json` file by default.

## CLI Options

- `--port`: The port to run the server on (default: 3001).
- `--host`: The address to listen on (default: 127.0.0.1, this machine only). Use `0.0.0.0` to accept connections from other machines.
- `--config`: Custom path to a routes JSON file.
- `--delay`: Global latency override in milliseconds.
- `--error-rate`: Global failure rate override (0.0 to 1.0).
- `--verbose`: Show all system logs and debug information.
- `--quiet`: Hide all non-error logs (shows only errors).

## Route Configuration

Example `routes.json` structure:

```json
[
  {
    "path": "/api/users",
    "method": "GET",
    "status": 200,
    "body": { "id": 1, "name": "Phantom User" },
    "enabled": true,
    "delay": 500,
    "errorRate": 0.1
  }
]
```

## Commands

- `make dev`: Run the dashboard and server in development mode.
- `make build`: Build both projects for production.
- `make run`: Run the production build locally.
- `make test`: Run server-side tests.
