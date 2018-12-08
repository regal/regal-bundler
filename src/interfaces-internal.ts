import { GameMetadata } from "regal";
import { BundleConfig } from "./interfaces-public";

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

export interface LoadedConfiguration {
    bundleConfig: BundleConfig;
    gameMetadata: GameMetadata;
}
