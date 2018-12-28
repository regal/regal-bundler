/*
 * Contains interfaces for internal use within regal-bundler.
 *
 * Copyright (c) Joseph R Cowman
 * Licensed under MIT License (see https://github.com/regal/regal-bundler)
 */

import { GameMetadata } from "regal";
import { BundleConfig } from "./interfaces-public";

/** Bundler and game configuration options. */
export interface LoadedConfiguration {
    /** Bundler configuration options. */
    bundler: BundleConfig;
    /** Game configuration options. */
    game: GameMetadata;
}
