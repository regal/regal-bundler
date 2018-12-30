import * as rollup from "rollup";
import { LoadedConfiguration } from "./interfaces-internal";
import { BundlerOptions, RecursivePartial } from "./interfaces-public";
/**
 * Imports and exports used for bundles in ESM format.
 * @param metadata Stringified game metadata.
 */
export declare const esFooter: (metadata: string) => string;
/**
 * Imports and exports used for bundles in CJS format.
 * @param metadata Stringified game metadata.
 */
export declare const cjsFooter: (metadata: string) => string;
/**
 * Generates code that's appended to the game bundle.
 * @param config The loaded configuration.
 */
export declare const makeBundleFooter: (config: LoadedConfiguration) => string;
/**
 * Loads the appropriate game bundler (for now, only `standard` is supported).
 * @param config The loaded configuration.
 */
export declare const makeBundler: (config: LoadedConfiguration) => {
    bundleFooter: string;
    bundlePlugin: any;
};
/**
 * Generates the header comment put at the top of the emitted bundle.
 * @param config The loaded configuration.
 */
export declare const bundleHeader: (config: LoadedConfiguration) => string;
/**
 * Load and configure the appropriate Rollup plugins.
 * @param config The loaded configuration.
 */
export declare const getPlugins: (config: LoadedConfiguration) => rollup.Plugin[];
/**
 * Creates the Rollup output option object given the loaded configuration.
 * @param config The loaded configuration.
 */
export declare const makeOutputOpts: (config: LoadedConfiguration) => rollup.OutputOptions;
/**
 * Generates a Regal game bundle.
 * @param opts Configuration for the bundler (optional).
 */
export declare const bundle: (opts?: RecursivePartial<BundlerOptions>) => Promise<void>;
