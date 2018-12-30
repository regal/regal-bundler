import * as path from "path";
import * as fs from "fs";
import { GameApi } from "regal";
import { lines } from "../../test-utils";
import { bundleHeader } from "../../../src/bundle";

// @ts-ignore: import will be resolved
import { bundle, getConfig } from "../../../dist/regal-bundler.cjs.js";

describe("Case: Minify", () => {
    beforeAll(
        async () =>
            await bundle({
                configLocation: __dirname
            })
    );

    it("CJS minification of the basic bundle is functional", async () => {
        // @ts-ignore: import will be resolved
        const Game: GameApi = await import("./the-smallest-game.regal.js");

        let response = Game.postStartCommand();
        expect(response.output.wasSuccessful).toBe(true);
        expect(lines(response)).toEqual(["Game initialized to zero."]);

        response = Game.postPlayerCommand(response.instance, "inc");
        expect(response.output.wasSuccessful).toBe(true);
        expect(lines(response)).toEqual([
            "Game state incremented from 0 to 1."
        ]);

        for (let i = 0; i < 5; i++) {
            response = Game.postPlayerCommand(response.instance, "dec");
        }
        expect(response.output.wasSuccessful).toBe(true);
        expect(lines(response)).toEqual([
            "Game state decremented from -3 to -4."
        ]);

        response = Game.postPlayerCommand(response.instance, "woof");
        expect(response.output.wasSuccessful).toBe(true);
        expect(lines(response)).toEqual(["Command not recognized: 'woof'."]);
    });

    it("Minified file is the correct number of lines", async () => {
        const config = await getConfig({ configLocation: __dirname });
        const file = fs.readFileSync(
            path.join(__dirname, "./the-smallest-game.regal.js")
        );
        const actualLines = file.toString().split("\n").length;

        const expectedLines = bundleHeader(config).split("\n").length + 2; // Header line(s) + one line of source + empty line

        expect(actualLines).toBe(expectedLines);
    });
});
