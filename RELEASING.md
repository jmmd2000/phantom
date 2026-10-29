# Releasing

1. Each change adds its user-facing lines under `## [Unreleased]` in `CHANGELOG.md`.
2. To release, commit `chore: release X.Y.Z` on `master`. It bumps `version` in `apps/server/package.json` and moves the Unreleased lines under `## [X.Y.Z] - <date>`.
3. Tag the release commit with an annotated tag: `git tag -a vX.Y.Z -m "vX.Y.Z"`.
4. Push with `git push --follow-tags`. Push one release tag at a time.

The release workflow checks the tag and the changelog, runs CI, publishes to npm and creates the GitHub release.
