import { GameMetadata } from "regal";
import { BundleConfig } from "./interfaces-public";
/** Bundler and game configuration options. */
export interface LoadedConfiguration {
    /** Bundler configuration options. */
    bundler: BundleConfig;
    /** Game configuration options. */
    game: GameMetadata;
}
