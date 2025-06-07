# ERR_PACKAGE_PATH_NOT_EXPORTED with @bufbuild/protobuf v2.0.0–v2.4.0

## Summary

When using `@bufbuild/protobuf` v2.0.0–v2.4.0 (as a dependency of `sass-embedded` v1.89.1), the Sass compilation fails with the following error:

```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]:
Package subpath './codegenv2' is not defined by "exports"
 in node_modules/sass-embedded/node_modules/@bufbuild/protobuf/package.json
```

## Reproduction Steps

1. Create an empty directory
2. Run `npm init -y`
3. Install `sass-embedded@1.89.1`
4. In your `package.json`, add an override to pin `@bufbuild/protobuf` to a version within the `^2.0.0` range:
   ```json
   "overrides": {
     "@bufbuild/protobuf": "2.0.0"
   }
   ```
5. Create `input.scss`:
   ```scss
   $primary-color: #333;
   .example { color: $primary-color; }
   ```
6. Create `index.js`:
   ```js
   import { compileAsync } from 'sass-embedded';
   const result = await compileAsync("input.scss");
   console.log(result.css.toString());
   ```
7. Run `node index.js`

## Tested Combinations

- `sass-embedded@1.89.0` + `@bufbuild/protobuf@2.0.0` → No error
- `sass-embedded@1.89.1` + `@bufbuild/protobuf@2.0.0–2.4.0` → `ERR_PACKAGE_PATH_NOT_EXPORTED`
- `sass-embedded@1.89.1` + `@bufbuild/protobuf@2.5.0` → No error

## Root Cause

In `@bufbuild/protobuf` versions ≤ 2.4.0, the `exports` map in `package.json` does not include `./codegenv2`, causing `require('@bufbuild/protobuf/codegenv2')` to fail. In v2.5.0, the `exports` field was updated:

```diff
 "exports": {
   ".": { … },
   "./codegenv1": { … },
 + "./codegenv2": {
 +   "import": "./dist/esm/codegenv2/index.js",
 +   "require": "./dist/cjs/codegenv2/index.js"
 + },
   "./reflect": { … },
   …
 }
```

## Expected Behavior

Sass compilation should succeed regardless of how `sass-embedded` and its dependencies are installed.

## Environment

- macOS 14.6.1
- Node.js 22.15.0
- `sass-embedded@1.89.1`
- `@bufbuild/protobuf@2.0.0–2.4.0` reproduces the issue
- `@bufbuild/protobuf@2.5.0` does not reproduce the issue

## Conditions

- A normal `npm install` respects `^2.0.0` and installs the latest v2.x (v2.5.2), avoiding the issue.
- Dependabot and similar tools respect `package-lock.json` and may keep v2.4.0, leading to this error.

## Proposed Fix

Update the dependency range of `@bufbuild/protobuf` in `sass-embedded`’s `package.json` to `^2.5.0` to avoid v2.0.0–2.4.0.
