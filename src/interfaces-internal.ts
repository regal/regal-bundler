import { GameMetadata } from "regal";
import { BundleConfig } from "./interfaces-public";

export interface LoadedConfiguration {
    bundler: BundleConfig;
    game: GameMetadata;
}
