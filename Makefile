PORT ?= 3001

.PHONY: build clean dev test run help

dev:
	(cd dashboard && pnpm dev) & (cd server && pnpm dev)

build: clean
	cd dashboard && pnpm run build
	cd server && pnpm run build

publish: build
	cp README.md server/
	cd server && npm publish --access public

run:
	cd server && node ./dist/index.js --port $(PORT)

clean:
	rm -rf dashboard/build
	rm -rf server/dist

test:
	cd server && pnpm test

help:
	@echo ""
	@echo "  make dev      - Run dashboard and server in development mode"
	@echo "  make build    - Clean and build both parts of the project"
	@echo "  make publish  - Build and publish to NPM"
	@echo "  make run      - Run the compiled code from ./server/dist"
	@echo "  make test     - Run all server-side tests"
	@echo "  make clean    - Wipe all build artifacts"
	@echo ""
	@echo "Variables:"
	@echo "  PORT          - Set the port for 'make run' (default: 3001)"
