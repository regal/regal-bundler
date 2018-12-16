import { expect } from "chai";
import "mocha";

import * as path from "path";

import { loadUserConfig } from "../../src/get-config";

describe("Get Config", function() {
    describe("loadUserConfig", function() {
        it("Loads config properly", async function() {
            const config = await loadUserConfig(
                path.join(__dirname, "..", "testcases", "basic")
            );

            expect(config).to.deep.equal({
                gameMetadata: {
                    name: "basic",
                    author: "Bob Basic"
                }
            });
        });
    });
});
