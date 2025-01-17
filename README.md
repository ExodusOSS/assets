[![Checks](https://github.com/ExodusMovement/assets/actions/workflows/checks.yaml/badge.svg?branch=main)](https://github.com/ExodusMovement/assets/actions/workflows/checks.yaml) [![Integration Tests](https://github.com/ExodusMovement/assets/actions/workflows/integration-tests.yaml/badge.svg?branch=main)](https://github.com/ExodusMovement/assets/actions/workflows/integration-tests.yaml) [![Version](https://github.com/ExodusMovement/assets/actions/workflows/version.yaml/badge.svg)](https://github.com/ExodusMovement/assets/actions/workflows/version.yaml) [![Publish](https://github.com/ExodusMovement/assets/actions/workflows/publish.yaml/badge.svg)](https://github.com/ExodusMovement/assets/actions/workflows/publish.yaml) [![CodeQL](https://github.com/ExodusMovement/assets/actions/workflows/codeql.yml/badge.svg)](https://github.com/ExodusMovement/assets/actions/workflows/codeql.yml)

# Assets

This repository contains all asset libraries used by the Exodus apps. Each asset-specific
subdirectory in the project represents one asset or asset family.

All packages share base build, testing tools and code style. These can be overridden or extended at asset level if needed.

## Contributing

To start using this repo, clone it as usual and open an editor in root folder.

For contributing code, let's follow the same guidelines as for the other Exodus apps, but most
importantly:

1. Always create PRs, do not commit directly to the main branch.
1. Get at least one developer to review your work.
1. Use a squash-and-merge to merge your branch into 'main'.

## Getting started

This repository uses a modern version of yarn that doesn't support `.npmrc` files anymore. To gain access to Exodus'
private packages, you have to invoke `yarn npm login` and login with your credentials. This has to be done once only.

After that, you can install dependencies as usual.

### Migrating an existing library or integration

This section describes how to migrate an existing library or integration and keep its git commit history.

#### Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [git-filter-repo](https://github.com/newren/git-filter-repo/blob/main/INSTALL.md)

GH SSH authentication [has to be configured](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/about-ssh) or alternatively the `--https` flag has to be used.

#### Usage

Install `@exodus/migrate` globally (`npm i -g @exodus/migrate`), run `exodus-migrate` and specify the path to the repository, or subdirectory within the repository.

For the latter you can simply navigate to the subdirectory in the GH UI and copy the URL from your browser's
address bar. If the subdirectory does not contain a `package.json`, a basic `package.json` will be created on your
behalf. More info can be found in the [`@exodus/migrate` repository](https://github.com/ExodusMovement/exodus-migrate)

1. On the assets repo root folder, create a new import `$IMPORT_BRANCH` branch

```sh
# unified an asset from a wallet after beeing decupled as much as possible from the wallet.
exodus-migrate --url https://github.com/ExodusMovement/exodus-mobile/tree/master/src/_local_modules/assets/ripple --target-dir ripple/ripple-plugin --scope @exodus --rename-tags


# move a library from another repository
exodus-migrate --url https://github.com/ExodusMovement/exodus-core/tree/master/packages/assets-base --target-dir shield/assets-base --scope @exodus --rename-tags
```

The script will replace the `repository`, `homepage`, and `bugs.url` properties in `package.json` to point to assets
and set the homepage to the module's folder on main.

2. You should check for potentially broken badges in your README.md, no longer required ci folders,
   eslint configs, .gitignore files, and lockfiles on package level. `yarn postmigrate` can help to identify unwanted
   files and create new config files to extend the root configuration in this repository. If the last commit affects files inside the imported package's folder, `yarn postmigrate` will be able to determine the package automatically. Otherwise you can supply the module path manually: `yarn postmigrate modules/orders-monitor`.

3. Many `devDependencies` may no longer be required as they are hoisted to avoid duplication and use the same
   versions across all modules. Prune what you can from your imported module.

4. Adapt code to the new style, fix any broken unit test, run `yarn install` at top level an commit.

5. Create a PR for reviewing but DO NOT merge it! The changes cannot be merged using the GH UI without losing the history. Merging has to be done locally to `main`
   as fast-forward merge. This only works if no other PR has been merged in-between. Using the `--ff-only` flag will
   make git abort should a fast-forward merge not be possible. All the work was in vain then and you have to start over
   from `1.` Better be fast this time!

```bash
  git checkout main
  git merge $IMPORT_BRANCH --ff-only
```

5. Last, push to main directly.

The tool keeps the the file history and creats a merge commit on the head. Notify @tim to allow merge commit on the main branch.

Note: if your package is missing them you will most likely need to add `babel.config.js` and `jest.config.js`. `yarn postmigrate` also offers to add them (see 2.)

### Creating a new asset integration

Copy and paste `__template__` folder into the new integration. Replace `asset` folder and key names with the name of the new asset.

### Test

Examples:

```
# to compile all build packages
yarn build

# all packages unit tests
yarn test

# all unit tests for an asset folder
yarn test:asset <assetName>

# all packages integration tests (.integration.test.js files)
yarn test:integration

# all packages unit and integration tests
yarn test:all

# all modified packages unit tests
yarn test --since origin/main

# all modified packages integration tests (.integration.test.js files)
yarn test:integration --since origin/main

# all modified packages unit and integration tests
yarn test:all --since origin/main

# just one package unit tests
yarn test --scope @exodus/bitcoin-plugin

# just one package integration tests (.integration.test.js files)
yarn test:integration --scope @exodus/bitcoin-plugin

# just one package unit and integratin tests
yarn test:all --scope  @exodus/bitcoin-plugin

# all unit and integration tests at package level
cd bitcoin/bitcoin-plugin
yarn test
```

Similary, you can replace `test` with `lint` to check style, and `lint:fix` to auto-fix errors if possible

### Build

If your module needs transpiling (i.e. Babel or Typescript) before publishing, make sure to add
a `build` script to the `package.json` of the module.

Examples:

```
# build all
yarn build

# build one library
yarn build --scope @exodus/bitcoin-meta
```

### Version

You have some options to release packages, ordered by preference:

- merge a PR with eligible commit type. The following don't trigger a release: `chore`, `docs`, `test`, `ci`. Check GH [action](https://github.com/ExodusMovement/assets/blob/main/.github/workflows/version-dispatch.yaml)
- run [the version workflow](https://github.com/ExodusMovement/assets/actions/workflows/version.yaml) directly through the GH UI.
- run `yarn release` and select the package(s) you want to release
- run `yarn release` and supply packages as a positional argument: `yarn release bitcoin-meta,bitcoin-lib,bitcoin-api`

All of these derive version bumps from the conventional commit history and create a release PR, labeled with `publish-on-merge`. Make sure that the checks on the release PR pass, especially when releasing packages that depend on other packages from this repository.

For more options to `yarn release`, see the [CLI docs](https://github.com/ExodusMovement/lerna-release-action/tree/main/cli).

### Publish

All packages that received a version bump in the previous step are automatically published to npm after merging
the release PR. The tags listed in the PR body will be added to the merge commit.

Initial versions can be published by manually executing [the publish workflow](https://github.com/ExodusMovement/assets/actions/workflows/publish.yaml). All packages with versions not currently present in the registry will be published. If unclear how to run the publish workfow, please follow [these](https://user-images.githubusercontent.com/2863630/203893329-f0eca8d0-4f8c-4ccb-abc2-65bfd819fa61.png) instructions.

### Backfix

A brief guide on how to perform a backfix. Let's say there's a fix in `@exodus/asset-lib` version `5.2.0` that you want to backfix to a previous version, `4.1.0`.

1. Locate the commit of the previous release you want to backfix. Create a branch named `@exodus/asset-lib@4` from that commit.
2. Create a new branch and a pull request pointing to `@exodus/asset-lib@4`. Cherry-pick the commit to be backfixed and bump the package version to `4.1.1`.
3. Once approved, merge the PR into `@exodus/asset-lib@4`.
4. In GitHub, go to "Actions" and locate the "Publish" item on the left. Click on "Run workflow" and select the `@exodus/asset-lib@4` branch instead of `main`.

The backfixed `@exodus/asset-lib@4.1.1` will be published and available for use in a platform. **There is no need to publish from a local machine**.

Backfix branches like `@exodus/asset-lib@4` need to be periodically cleaned up once platforms have moved to later versions.

### Commit messages

Commit messages and PR titles should follow the [conventional commits specification](https://github.com/ExodusMovement/conventional-commit-spec/). Breaking changes are denoted with a bang (`!`) before the colon (`:`) in the commit message and will result in a major version bump.

> feat!: all roads lead to Gotham

If your PR only affects a section of a package, you may use a scope. Please refrain from using scopes for package names as they will show up in the `CHANGELOG.md` and the scope is redundant there. PRs are labelled with the package names they affect, so it also doesn't add any value in the GH UI.

🟩 Good

> feat(plugin): add createAsset

🟥 Bad

> feat(ripple): add createAsset

### Dependencies

#### Breaking changes

Occasionally, it is necessary to introduce a breaking change. Fixing downstream packages may only require a patch or minor, and not always warrant a breaking change. The solution is to create a PR chain. Changes that are breaking from a consumer perspective are isolated in the first PR, and non-breaking downstream errors are fixed in follow-up PRs. To avoid failing checks on main for an extended period, the chain should not be merged manually. Instead, apply the label `action/merge-chain` to the tip of the PR chain. It will merge the first PR, rebase the following PR onto main, and continue on merging until the entire chain is merged.

#### Inter-package

If your package requires referencing one of the packages maintained in this mono repo and you want
to consume the latest unpublished changes without having to set a specific version, you have to
manually add that dependency to `package.json` and set the version to `*`. This manual step is
currently required because of an incompatibility between more recent yarn versions (berry) and
lerna.

Latest code changes are automatically reflected in the import and versioning/publishing
takes care of keeping the version in the module's `package.json` up-to-date.

## CI

This repo uses sophisticated caching courtesy of nx and Github Actions. When changing non-module-local
configuration/code, you may want to clear the cache in the CI to force checks to re-run. You can do so
by running `yarn cache:delete` or use the [GH page](https://github.com/ExodusMovement/assets/actions/caches) for
managing caches. The CLI client has the advantage of being able to purge all caches for a given branch. This is
currently not supported in the UI.

Github Actions only runs test and lint of PR's changed packages and their dependents.
Once merged, Github Actions runs lint and unit tests of all packages if cache is not hit on the main branch.

## Conventions

First see [general conventions](https://coda.io/d/Engineering-Handbook_dWMI1pUBpME/Recipes-Patterns-Anti-Patterns_suk6k).
