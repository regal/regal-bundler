import * as path from "path";
import * as fs from "fs";
import { GameApi } from "regal";
import { lines } from "../../test-utils";

import {
    getConfig,
    bundle,
    ModuleFormat
    // @ts-ignore: import will be resolved
} from "../../../dist/regal-bundler.cjs.js";
import { bundleHeader } from "../../../src/bundle";

describe("Case: Basic", () => {
    beforeAll(async () => {
        await bundle({ configLocation: __dirname });
    });

    it("Loads the correct configuration", async () => {
        const config = await getConfig({ configLocation: __dirname });

        expect(config).toEqual({
            bundler: {
                input: {
                    file: path.join(__dirname, "src", "index.ts"),
                    ts: true
                },
                output: {
                    bundle: "standard",
                    file: path.join(__dirname, "basic.regal.js"),
                    format: ModuleFormat.CJS,
                    minify: false
                }
            },
            game: {
                name: "basic",
                author: "Bob Basic"
            }
        });
    });

    it("Creates a functional bundle", async () => {
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

    it("Puts the header at the beginning of the bundle", async () => {
        const config = await getConfig({ configLocation: __dirname });
        fs.readFileSync(path.join(__dirname, "./basic.regal.js"))
            .toString()
            .startsWith(bundleHeader(config));
    });
});
