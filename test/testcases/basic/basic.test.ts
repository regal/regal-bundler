import { expect } from "chai";
import "mocha";

import { getConfig } from "../../../src/get-config";

describe("Case: basic", function() {
    it("Loads the correct configuration", function() {
        return getConfig({
            configLocation: __dirname
        }).then(config =>
            expect(config).to.deep.equal({
                gameMetadata: {
                    name: "basic",
                    author: "Bob Basic"
                }
            })
        );
    });
});
