import { onStartCommand, onPlayerCommand, on, noop, Agent } from "regal";

class MyAgent extends Agent {
    constructor(public num: number) {
        super();
    }
}

interface State {
    tracker: MyAgent;
}

const init = on<State>("INIT", game => {
    game.output.write("Game initialized to zero.");
    game.state.tracker = new MyAgent(0);
});

const incr = on<State>("INCR", game =>
    game.output.write(
        `Game state incremented from ${game.state.tracker.num} to ${++game.state
            .tracker.num}.`
    )
);

const decr = on<State>("DECR", game =>
    game.output.write(
        `Game state decremented from ${game.state.tracker.num} to ${--game.state
            .tracker.num}.`
    )
);

onStartCommand(init);
onPlayerCommand(cmd => game => {
    if (cmd.charAt(0) === "i") {
        return incr;
    } else if (cmd.charAt(0) === "d") {
        return decr;
    }
    game.output.write(`Command not recognized: '${cmd}'.`);
    return noop;
});
