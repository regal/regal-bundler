import * as path from "path";

import { loadUserConfig } from "../../src/get-config";

describe("Get Config", () => {
    describe("loadUserConfig", () => {
        it.only("Loads config properly", async () => {
            const config = await loadUserConfig(
                path.join(__dirname, "..", "testcases", "basic")
            );

            expect(config).toEqual({
                gameMetadata: {
                    name: "basic",
                    author: "Bob Basic"
                }
            });
        });
    });
});
