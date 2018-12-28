/*
 * Contains the standard game bundle factory.
 *
 * The standard game bundle is an implementation of Regal's GameApi.
 * It initializes itself internally, and cannot be reset.
 *
 * Copyright (c) Joseph R Cowman
 * Licensed under MIT License (see https://github.com/regal/regal-bundler)
 */

import { GameApi } from "regal";

export default (game: GameApi): GameApi => {
    return {
        getMetadataCommand: game.getMetadataCommand.bind(game),
        postPlayerCommand: game.postPlayerCommand.bind(game),
        postStartCommand: game.postStartCommand.bind(game),
        postUndoCommand: game.postUndoCommand.bind(game),
        postOptionCommand: game.postOptionCommand.bind(game)
    };
};
