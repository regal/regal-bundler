import { expect } from "chai";
import "mocha";

import { getConfig } from "../../../src/get-config";
import * as path from "path";
import { BundleType, ModuleFormat } from "../../../src/interfaces-public";
import { bundle } from "../../../src";

describe("Case: basic", function() {
    it("Loads the correct configuration", function() {
        return getConfig({
            configLocation: __dirname
        }).then(config =>
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
            })
        );
    });

    it.skip("Creates a functional bundle", function() {
        return bundle({
            configLocation: __dirname
        }).then(() => {
            expect(true).to.be.true;
        });
    });
});
