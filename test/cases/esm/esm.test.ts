import * as path from "path";
import * as fs from "fs";
import { GameApi } from "regal";
import { lines } from "../../test-utils";
import { bundleHeader } from "../../../src/bundle";

// @ts-ignore: import will be resolved
import { bundle } from "../../../dist/regal-bundler.cjs.js";

describe("Case: ESM", () => {
    beforeAll(
        async () =>
            await bundle({
                configLocation: __dirname
            })
    );

    it("TODO", async () => {
        // @ts-ignore: import will be resolved
        // const Game: GameApi = await import("./the-smallest-game.regal.js");
        // let response = Game.postStartCommand();
        // expect(response.output.wasSuccessful).toBe(true);
        // expect(lines(response)).toEqual(["Game initialized to zero."]);
        // response = Game.postPlayerCommand(response.instance, "inc");
        // expect(response.output.wasSuccessful).toBe(true);
        // expect(lines(response)).toEqual([
        //     "Game state incremented from 0 to 1."
        // ]);
        // for (let i = 0; i < 5; i++) {
        //     response = Game.postPlayerCommand(response.instance, "dec");
        // }
        // expect(response.output.wasSuccessful).toBe(true);
        // expect(lines(response)).toEqual([
        //     "Game state decremented from -3 to -4."
        // ]);
        // response = Game.postPlayerCommand(response.instance, "woof");
        // expect(response.output.wasSuccessful).toBe(true);
        // expect(lines(response)).toEqual(["Command not recognized: 'woof'."]);
    });
});
