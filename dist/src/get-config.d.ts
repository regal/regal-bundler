import { LoadedConfiguration } from "./interfaces-internal";
import { BundlerOptions, RecursivePartial } from "./interfaces-public";
export declare const importDynamic: (s: string) => Promise<any>;
/**
 * Loads user configuration, searching in `regal.json` and the
 * `regal` property in `package.json`.
 * @param configLocation The directory to search.
 */
export declare const loadUserConfig: (configLocation: string) => Promise<RecursivePartial<LoadedConfiguration>>;
/**
 * Fills in omitted configuration options with their default values,
 * modifying the original object.
 * @param configLocation The directory to search.
 * @param userOpts The configuration object.
 */
export declare const fillInOpts: (configLocation: string, userOpts: RecursivePartial<LoadedConfiguration>) => LoadedConfiguration;
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
export declare const getConfig: (opts?: RecursivePartial<BundlerOptions>) => Promise<LoadedConfiguration>;
