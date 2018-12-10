import { GameMetadata } from "regal";
import { BundleConfig } from "./interfaces-public";

export interface LoadedConfiguration {
    bundleConfig: BundleConfig;
    gameMetadata: GameMetadata;
}
