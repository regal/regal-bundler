import { expect } from "chai";
import "mocha";

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

describe("Case: basic", function() {
    it("Loads the correct configuration", async function() {
        const config = await getConfig({ configLocation: __dirname });

        expect(config).to.deep.equal({
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

    it("Creates a functional bundle", async function() {
        await bundle({ configLocation: __dirname });
        // @ts-ignore: import will be resolved
        const Game: GameApi = await import("./basic.regal.js");

        let response = Game.postStartCommand();
        expect(response.output.wasSuccessful).to.be.true;
        expect(lines(response)).to.deep.equal(["Game initialized to zero."]);

        response = Game.postPlayerCommand(response.instance, "inc");
        expect(response.output.wasSuccessful).to.be.true;
        expect(lines(response)).to.deep.equal([
            "Game state incremented from 0 to 1."
        ]);

        for (let i = 0; i < 5; i++) {
            response = Game.postPlayerCommand(response.instance, "dec");
        }
        expect(response.output.wasSuccessful).to.be.true;
        expect(lines(response)).to.deep.equal([
            "Game state decremented from -3 to -4."
        ]);

        response = Game.postPlayerCommand(response.instance, "woof");
        expect(response.output.wasSuccessful).to.be.true;
        expect(lines(response)).to.deep.equal([
            "Command not recognized: 'woof'."
        ]);
    });
});
