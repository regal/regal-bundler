/**
 * Regal Bundler
 *
 * Copyright (c) Joe Cowman
 * Licensed under MIT License (see https://github.com/regal/regal-bundler)
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rollup = require('rollup');
var _commonjs = require('rollup-plugin-commonjs');
var insert = require('rollup-plugin-insert');
var _json = require('rollup-plugin-json');
var _resolve = require('rollup-plugin-node-resolve');
var rollupPluginTerser = require('rollup-plugin-terser');
var _typescript = require('rollup-plugin-typescript2');
var _virtual = require('rollup-plugin-virtual');
var _slugify = require('@sindresorhus/slugify');
var _cosmiconfig = require('cosmiconfig');
var path = require('path');
var regal = require('regal');
var _sanitize = require('sanitize-filename');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var standardBundle = (game) => {
    return {
        getMetadataCommand: game.getMetadataCommand.bind(game),
        postPlayerCommand: game.postPlayerCommand.bind(game),
        postStartCommand: game.postStartCommand.bind(game),
        postUndoCommand: game.postUndoCommand.bind(game),
        postOptionCommand: game.postOptionCommand.bind(game)
    };
};

/** Supported JavaScript module formats. */
(function (ModuleFormat) {
    ModuleFormat["CJS"] = "cjs";
    ModuleFormat["ESM"] = "esm";
    ModuleFormat["UMD"] = "umd";
})(exports.ModuleFormat || (exports.ModuleFormat = {}));

// Alias imports to allow executing namespaces
const cosmiconfig = _cosmiconfig;
const slugify = _slugify;
const sanitize = _sanitize;
const metadataKeys = [
    "name",
    "author",
    "description",
    "homepage",
    "repository"
];
/* Wrapper for dynamic imports so that they can be mocked during tests. */
const importDynamic = (s) => Promise.resolve(require(s));
/**
 * Loads user configuration, searching in `regal.json` and the
 * `regal` property in `package.json`.
 * @param configLocation The directory to search.
 */
const loadUserConfig = (configLocation) => __awaiter(undefined, void 0, void 0, function* () {
    const explorer = cosmiconfig("regal", {
        searchPlaces: ["package.json", "regal.json"]
    });
    let config;
    const searchResult = yield explorer.search(configLocation);
    if (searchResult === null) {
        config = {};
    }
    else {
        config = searchResult.config;
    }
    if (config.game === undefined) {
        config.game = {};
    }
    const pkgPath = path.join(configLocation, "package.json");
    let pkg;
    try {
        pkg = yield importDynamic(pkgPath);
    }
    catch (ex1) {
        // If configLocation can't be resolved, attempt to resolve it
        // relative to the current working directory.
        try {
            pkg = yield importDynamic(path.join(process.cwd(), pkgPath));
        }
        catch (ex2) {
            throw new regal.RegalError(`Could not resolve configLocation at ${pkgPath}`);
        }
    }
    const metadata = config.game;
    for (const mk of metadataKeys) {
        if (metadata[mk] === undefined && pkg[mk] !== undefined) {
            metadata[mk] = pkg[mk];
        }
    }
    if (metadata.gameVersion) {
        console.warn(`gameVersion must be configured by the version property of package.json, not by setting gameVersion yourself. In this case, "${metadata.gameVersion}" will be ignored and "${pkg.version}" will be used in the bundle's metadata instead.`);
    }
    metadata.gameVersion = pkg.version;
    return config;
});
const makeFileName = (gameName) => `${sanitize(slugify(gameName))}.regal.js`;
/**
 * Fills in omitted configuration options with their default values,
 * modifying the original object.
 * @param configLocation The directory to search.
 * @param userOpts The configuration object.
 */
const fillInOpts = (configLocation, userOpts) => {
    if (userOpts.game === undefined || userOpts.game.name === undefined) {
        throw new regal.RegalError("game.name must be defined.");
    }
    if (userOpts.bundler === undefined) {
        userOpts.bundler = {};
    }
    const c = userOpts.bundler;
    if (c.input === undefined) {
        c.input = {};
    }
    if (c.input.ts === undefined) {
        if (c.input.file !== undefined && c.input.file.endsWith("js")) {
            c.input.ts = false;
        }
        else {
            c.input.ts = true;
        }
    }
    if (c.input.file === undefined) {
        const inputFile = c.input.ts ? "index.ts" : "index.js";
        c.input.file = path.join(configLocation, "src", inputFile);
    }
    else {
        c.input.file = path.join(configLocation, c.input.file);
    }
    if (c.output === undefined) {
        c.output = {};
    }
    if (c.output.file === undefined) {
        c.output.file = path.join(configLocation, makeFileName(userOpts.game.name));
    }
    else {
        c.output.file = path.join(configLocation, c.output.file);
    }
    if (c.output.bundle === undefined) {
        c.output.bundle = "standard";
    }
    if (c.output.format === undefined) {
        c.output.format = exports.ModuleFormat.CJS;
    }
    if (c.output.minify === undefined) {
        c.output.minify = false;
    }
    return userOpts;
};
/**
 * Loads user configuration, searching in `regal.json` and the
 * `regal` property in `package.json`.
 *
 * @param opts Bundler configuration options and the directory
 * to search for user config (optional). If `configLocation` is
 * omitted, the current working directory will be used. Values in
 * `opts.bundler` will override those found by the config loader.
 * If no value is found for a given property, a default value will
 * be used in its place.
 */
const getConfig = (opts = {}) => __awaiter(undefined, void 0, void 0, function* () {
    if (opts.configLocation === undefined) {
        opts.configLocation = process.cwd();
    }
    const userOpts = yield loadUserConfig(opts.configLocation);
    fillInOpts(opts.configLocation, userOpts);
    if (opts.bundler !== undefined) {
        if (opts.bundler.input !== undefined) {
            Object.assign(userOpts.bundler.input, opts.bundler.input);
        }
        if (opts.bundler.output !== undefined) {
            Object.assign(userOpts.bundler.output, opts.bundler.output);
        }
    }
    return userOpts;
});

// Alias imports to allow executing namespaces
const json = _json;
const resolve = _resolve;
const typescript = _typescript;
const commonjs = _commonjs;
const virtual = _virtual;
/**
 * Format-agnostic footer code.
 * @param metadata Stringified game metadata.
 */
const footerCode = (metadata) => `
/* Initialize game */
Game.init(${metadata});
/* Generate bundle */
const bundledGame = makeBundle(Game);
`;
/**
 * Imports and exports used for bundles in ESM format.
 * @param metadata Stringified game metadata.
 */
const esFooter = (metadata) => `
import { Game } from "regal";
import makeBundle from "_bundle";
${footerCode(metadata)}
export { bundledGame as default };
`;
/**
 * Imports and exports used for bundles in CJS format.
 * @param metadata Stringified game metadata.
 */
const cjsFooter = (metadata) => `
const Game = require("regal").Game;
const makeBundle = require("_bundle");
${footerCode(metadata)}
module.exports = bundledGame;
`;
/**
 * Generates code that's appended to the game bundle.
 * @param config The loaded configuration.
 */
const makeBundleFooter = (config) => {
    const footer = config.bundler.input.ts ? esFooter : cjsFooter;
    return footer(JSON.stringify(config.game, undefined, 2));
};
/**
 * Loads the appropriate game bundler (for now, only `standard` is supported).
 * @param config The loaded configuration.
 */
const makeBundler = (config) => {
    let bundleFunc;
    const bundleType = config.bundler.output.bundle;
    if (bundleType.toLowerCase() === "standard") {
        bundleFunc = standardBundle.toString();
    }
    else {
        throw new regal.RegalError(`Illegal bundle type: ${bundleType}`);
    }
    return {
        bundleFooter: makeBundleFooter(config),
        bundlePlugin: virtual({
            _bundle: `export default ${bundleFunc};`
        })
    };
};
/**
 * Generates the header comment put at the top of the emitted bundle.
 * @param config The loaded configuration.
 */
const bundleHeader = (config) => `/** 
* ${config.game.name} ${config.game.gameVersion !== undefined ? config.game.gameVersion : ""}
* by ${config.game.author}
*
* Powered by the Regal Framework (https://github.com/regal/regal).
*/`;
/**
 * Load and configure the appropriate Rollup plugins.
 * @param config The loaded configuration.
 */
const getPlugins = (config) => {
    const plugins = [];
    const { bundleFooter, bundlePlugin } = makeBundler(config);
    plugins.push(insert.append(bundleFooter, {
        include: config.bundler.input.file
    }), bundlePlugin, resolve(), json({ exclude: "node_modules/**" }));
    if (config.bundler.input.ts) {
        plugins.unshift(typescript({
            tsconfigOverride: {
                compilerOptions: { module: "es2015" }
            },
            clean: true // Cache needs to be wiped so that concurrent bundles don't fail
        }));
    }
    else {
        plugins.push(commonjs());
    }
    if (config.bundler.output.minify) {
        plugins.push(rollupPluginTerser.terser({ output: { preamble: bundleHeader(config) } }));
    }
    return plugins;
};
/**
 * Creates the Rollup output option object given the loaded configuration.
 * @param config The loaded configuration.
 */
const makeOutputOpts = (config) => {
    const output = {
        file: config.bundler.output.file
    };
    const format = config.bundler.output.format.toLowerCase();
    switch (format) {
        case exports.ModuleFormat.CJS:
        case exports.ModuleFormat.ESM:
            output.format = format;
            break;
        case exports.ModuleFormat.UMD:
            output.format = format;
            output.name = "Game";
            break;
        default:
            throw new regal.RegalError(`Illegal module format: ${format}`);
    }
    if (!config.bundler.output.minify) {
        output.banner = bundleHeader(config);
    }
    return output;
};
/**
 * Generates a Regal game bundle.
 * @param opts Configuration for the bundler (optional).
 */
const bundle = (opts = {}) => __awaiter(undefined, void 0, void 0, function* () {
    const config = yield getConfig(opts);
    const plugins = getPlugins(config);
    const inputOpts = {
        input: config.bundler.input.file,
        plugins
    };
    const build = yield rollup.rollup(inputOpts);
    const outputOpts = makeOutputOpts(config);
    yield build.write(outputOpts);
    console.log(`Created a game bundle for '${config.game.name}' at ${outputOpts.file}`);
});

exports.bundle = bundle;
exports.getConfig = getConfig;
