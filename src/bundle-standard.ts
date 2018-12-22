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
