# Releasing

1. As the last commit on the branch, bump `version` in `apps/server/package.json` and add its entry to `CHANGELOG.md`.
2. Merge the branch into `master`.
3. Tag the merge with an annotated tag: `git tag -a v0.2.4 -m "v0.2.4"`.
4. Push with `git push --follow-tags`.

The release workflow checks the tag and the changelog, runs CI, publishes to npm and creates the GitHub release.
