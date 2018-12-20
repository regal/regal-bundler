const regal = require("regal");

const init = regal.on("INIT", game => {
    game.output.write("Game initialized to zero.");
    game.state.num = 0;
});

const incr = regal.on("INCR", game =>
    game.output.write(
        `Game state incremented from ${game.state.num} to ${++game.state.num}.`
    )
);

const decr = regal.on("DECR", game =>
    game.output.write(
        `Game state decremented from ${game.state.num} to ${--game.state.num}.`
    )
);

regal.onStartCommand(init);
regal.onPlayerCommand(cmd => game => {
    if (cmd.startsWith("i")) {
        return incr;
    } else if (cmd.startsWith("d")) {
        return decr;
    }
    game.output.write(`Command not recognized: '${cmd}'.`);
    return regal.noop;
});
