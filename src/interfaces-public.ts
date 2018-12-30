/*
 * Contains public interfaces for use with regal-bundler.
 *
 * Copyright (c) Joseph R Cowman
 * Licensed under MIT License (see https://github.com/regal/regal-bundler)
 */

/** Type that makes every property of an object optional recursively. */
export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

/** Options passed to `bundle`. */
export interface BundlerOptions {
    /** The directory from which to load user configuration. */
    configLocation: string;
    /** Bundler configuration options. */
    bundler: BundleConfig;
}

/** Bundler configuration options. */
export interface BundleConfig {
    /** Input configuration options. */
    input: BundleConfigInput;
    /** Output configuration options. */
    output: BundleConfigOutput;
}

/** Bundler input configuration options. */
export interface BundleConfigInput {
    /**
     * The root file from which to start bundling.
     * Defaults to `src/index.ts` (or `.js`).
     */
    file: string;

    /**
     * Whether the project contains Typescript code that must be compiled.
     * Defaults to true.
     */
    ts: boolean;
}

/** Bundler output configuration options. */
export interface BundleConfigOutput {
    /**
     * The file name of the emitted bundle, relative to the configuration location.
     * Defaults to `(game-name).regal.js`.
     */
    file: string;

    /**
     * The type of game bundle to generate.
     * Defaults to `standard`, which is the only supported value at this time.
     */
    bundle: string;

    /**
     * The module format of the generated bundle.
     * Acceptable values include `cjs` (default), `esm`, and `umd`.
     */
    format: ModuleFormat;

    /** Whether the bundle's source should be minified. */
    minify: boolean;
}

/** Supported JavaScript module formats. */
export enum ModuleFormat {
    CJS = "cjs",
    ESM = "esm",
    UMD = "umd"
}
