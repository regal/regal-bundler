/*
 * Contains functions for loading custom bundler/game configuration.
 *
 * Copyright (c) Joseph R Cowman
 * Licensed under MIT License (see https://github.com/regal/regal-bundler)
 */

import * as _slugify from "@sindresorhus/slugify";
import * as _cosmiconfig from "cosmiconfig";
import * as path from "path";
import { GameMetadata, RegalError } from "regal";
import * as _sanitize from "sanitize-filename";
import { LoadedConfiguration } from "./interfaces-internal";
import {
    BundlerOptions,
    ModuleFormat,
    RecursivePartial
} from "./interfaces-public";

// Alias imports to allow executing namespaces
const cosmiconfig = _cosmiconfig;
const slugify = _slugify;
const sanitize = _sanitize;

// Eliminate readonly modifier
type Writeable<T> = { -readonly [P in keyof T]-?: T[P] };

const metadataKeys: Array<keyof GameMetadata> = [
    "name",
    "author",
    "description",
    "homepage",
    "repository"
];

/**
 * Loads user configuration, searching in `regal.json` and the
 * `regal` property in `package.json`.
 * @param configLocation The directory to search.
 */
export const loadUserConfig = async (
    configLocation: string
): Promise<RecursivePartial<LoadedConfiguration>> => {
    const explorer = cosmiconfig("regal", {
        searchPlaces: ["package.json", "regal.json"]
    });

    let config: RecursivePartial<LoadedConfiguration>;
    const searchResult = await explorer.search(configLocation);

    if (searchResult === null) {
        config = {};
    } else {
        config = searchResult.config;
    }

    if (config.game === undefined) {
        config.game = {};
    }

    const pkgPath = path.join(configLocation, "package.json");
    const pkg = await import(pkgPath);

    const metadata: RecursivePartial<Writeable<GameMetadata>> = config.game;

    for (const mk of metadataKeys) {
        if (metadata[mk] === undefined && pkg[mk] !== undefined) {
            metadata[mk] = pkg[mk];
        }
    }

    return config;
};

const makeFileName = (gameName: string) =>
    `${sanitize(slugify(gameName))}.regal.js`;

/**
 * Fills in omitted configuration options with their default values,
 * modifying the original object.
 * @param configLocation The directory to search.
 * @param userOpts The configuration object.
 */
export const fillInOpts = (
    configLocation: string,
    userOpts: RecursivePartial<LoadedConfiguration>
): LoadedConfiguration => {
    if (userOpts.game === undefined || userOpts.game.name === undefined) {
        throw new RegalError("game.name must be defined.");
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
        } else {
            c.input.ts = true;
        }
    }
    if (c.input.file === undefined) {
        const inputFile = c.input.ts ? "index.ts" : "index.js";
        c.input.file = path.join(configLocation, "src", inputFile);
    } else {
        c.input.file = path.join(configLocation, c.input.file);
    }

    if (c.output === undefined) {
        c.output = {};
    }
    if (c.output.file === undefined) {
        c.output.file = path.join(
            configLocation,
            makeFileName(userOpts.game.name)
        );
    } else {
        c.output.file = path.join(configLocation, c.output.file);
    }
    if (c.output.bundle === undefined) {
        c.output.bundle = "standard";
    }
    if (c.output.format === undefined) {
        c.output.format = ModuleFormat.CJS;
    }
    if (c.output.minify === undefined) {
        c.output.minify = false;
    }

    return userOpts as LoadedConfiguration;
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
export const getConfig = async (
    opts: RecursivePartial<BundlerOptions> = {}
): Promise<LoadedConfiguration> => {
    if (opts.configLocation === undefined) {
        opts.configLocation = process.cwd();
    }

    const userOpts = await loadUserConfig(opts.configLocation);
    fillInOpts(opts.configLocation, userOpts);

    if (opts.bundler !== undefined) {
        if (opts.bundler.input !== undefined) {
            Object.assign(userOpts.bundler.input, opts.bundler.input);
        }
        if (opts.bundler.output !== undefined) {
            Object.assign(userOpts.bundler.output, opts.bundler.output);
        }
    }

    return userOpts as LoadedConfiguration;
};
