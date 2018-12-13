import { onStartCommand, onPlayerCommand, on, noop } from "regal";

interface State {
    num: number;
}

const init = on<State>("INIT", game => {
    game.output.write("Game initialized to zero.");
    game.state.num = 0;
});

const incr = on<State>("INCR", game =>
    game.output.write(
        `Game state incremented from ${game.state.num} to ${++game.state.num}.`
    )
);

const decr = on<State>("DECR", game =>
    game.output.write(
        `Game state decremented from ${game.state.num} to ${--game.state.num}.`
    )
);

onStartCommand(init);
onPlayerCommand(cmd => game => {
    if (cmd.startsWith("i")) {
        return incr;
    } else if (cmd.startsWith("d")) {
        return decr;
    }
    game.output.write(`Command not recognized: '${cmd}'.`);
    return noop;
});
