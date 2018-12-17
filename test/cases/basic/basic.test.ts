import * as path from "path";
import { GameResponse, GameApi } from "regal";

import {
    getConfig,
    bundle,
    BundleType,
    ModuleFormat
    // @ts-ignore: import will be resolved
} from "../../../dist/regal-bundler.cjs.js";

const lines = (response: GameResponse) =>
    response.output.log.map(ol => ol.data);

describe("Case: basic", () => {
    it("Loads the correct configuration", async () => {
        const config = await getConfig({ configLocation: __dirname });

        expect(config).toEqual({
            bundleConfig: {
                input: {
                    file: path.join(__dirname, "src", "index.ts"),
                    ts: true
                },
                output: {
                    bundle: BundleType.STANDARD,
                    file: path.join(__dirname, "basic.regal.js"),
                    format: ModuleFormat.CJS,
                    minify: false
                }
            },
            gameMetadata: {
                name: "basic",
                author: "Bob Basic"
            }
        });
    });

    it("Creates a functional bundle", async () => {
        await bundle({ configLocation: __dirname });
        // @ts-ignore: import will be resolved
        const Game: GameApi = await import("./basic.regal.js");

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
});
