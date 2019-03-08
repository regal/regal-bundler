# regal-bundler

[![npm version](https://badge.fury.io/js/regal-bundler.svg)](https://badge.fury.io/js/regal-bundler)
[![CircleCI](https://circleci.com/gh/regal/regal-bundler.svg?style=svg)](https://circleci.com/gh/regal/regal-bundler)
[![Coverage Status](https://coveralls.io/repos/github/regal/regal-bundler/badge.svg?branch=master)](https://coveralls.io/github/regal/regal-bundler?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

`regal-bundler` is a tool that packages a [Regal](https://github.com/regal/regal) game into a deployable game bundle.

## Overview

In order to be used by clients, a [Regal](https://github.com/regal/regal) game must be bundled. *Bundling* is the process of converting a Regal game's **development source** (i.e. the TypeScript or JavaScript source files that the game developer writes) into a **game bundle**, which is a self-contained file that contains all the code necessary to play the game via a single API.

Game bundles are the form through which Regal games are shared, downloaded, and played.

## Usage

### Installation

The bundler is available on npm:

```
npm install --save-dev regal-bundler
```

### Bundling a Game

Generate a game bundle with the `bundle` function. This creates a JavaScript file that exports an implementation of the [Regal `GameApi`](https://github.com/regal/regal/blob/master/src/api/game-api.ts) (see [bundles](#bundles) for more information).

```ts
import { bundle } from "regal-bundler";

bundle({ configLocation: "PATH/TO/MY/PROJECT" });
```

`bundle` takes an optional configuration argument, which is specified below.

### Configuration

Configuration for both the Regal game and the game bundler are stored in the same place. Config values can be stored in `regal.json` or the `regal` property in `package.json` with the following schema:

```
{
    game: GameMetadata
    bundler: BundleConfig
}
```

See the [Regal documentation](https://github.com/regal/regal/blob/master/src/config/game-metadata.ts) for a description of `GameMetadata`.

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

Values in `bundler` will override those found in any configuration files. If no value is found for a given property, a default value will be used in its place. Note that no configuration is necessary to bundle a game.

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

Whether minification should be done on the bundle after it's generated. Defaults to false.

### Bundles

Game bundles are the form through which Regal games are shared, downloaded, and played.

Since games built on the Regal framework are intended to be *enjoyed by all people, on all platforms*, the goal is for many bundle types to allow the same game to be ported to different platforms with no extra work.

Currently, only the **standard** bundle is supported, which is simply an implementation of the [Regal `GameApi`](https://github.com/regal/regal/blob/master/src/api/game-api.ts).

A standard Regal game bundle can be consumed like so:

```ts
const Game: GameApi = await import("./my-game.regal.js");

let response = Game.postStartCommand();
response = Game.postPlayerCommand(response.instance, "command");
```