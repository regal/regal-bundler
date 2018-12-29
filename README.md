# regal-bundler

[![CircleCI](https://circleci.com/gh/regal/regal-bundler.svg?style=svg)](https://circleci.com/gh/regal/regal-bundler)
[![Coverage Status](https://coveralls.io/repos/github/regal/regal-bundler/badge.svg?branch=master)](https://coveralls.io/github/regal/regal-bundler?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Utility that packages a [Regal](https://github.com/regal/regal) game into a deployable game bundle.

## Usage

### Installation

The bundler is available on npm:

```
npm install --save-dev regal-bundler
```

### Bundling a Game

Generate a game bundle with the `bundle` function.

```ts
import { bundle } from "regal-bundler";

bundle({
    configLocation: "PATH/TO/MY/PROJECT"
});
```

`bundle` takes an optional configuration argument, which is specified below.

### Configuration

Configuration options can be stored in `regal.json` or the `regal` property in `package.json`.

`bundle` takes a single, optional argument with the following structure:

```
{
    configLocation: string,
    bundler: {
        input: {
            file,
            ts
        },
        output: {
            file,
            bundle,
            format,
            minify
        }
    }
}
```

#### `configLocation`: string

Location of `regal.json` and/or `package.json`. Defaults to the project's root directory.

#### `bundler`: BundleConfig

The `BundlerConfig` object contains configuration options for `regal-bundler`. These options may be specified under the optional `bundler` property of `regal.json` if desired.

Any options specified when `bundle` is called shall override those present in `regal.json`.

#### `bunder.input`: BundleConfigInput

Options for how the development source is specified.

#### `bundler.input.file`: string

The game's index file. Default to `src/index.ts` if `ts` is true or unspecified, `src/index.js` if `ts` is false.

#### `bundler.input.ts`: string

Specifies whether the source is TypeScript or JavaScript. If true, the bundler will compile the TypeScript before bundling.

#### `bundler.output`: BundleConfigOutput

Options for how the game bundle is emitted.

#### `bundler.output.file`: string

The file to which the game bundle will be created. Convention is to end the filename with `.regal.js` (or `.regal.mjs`), but this is not enforced. Defaults to `game-name.regal.js`.

#### `bundler.output.bundle`: string

The type of bundle to produce. Currently, this will only allow `standard` as its value (but can be left unspecified).

#### `bundler.output.format`: string

The module format of the bundle. Options: `cjs`, `esm`, `umd`. Defaults to `cjs`.

#### `bundler.output.minify`: boolean

Whether minification should be done on the bundle after it's generated. Defaults to true.