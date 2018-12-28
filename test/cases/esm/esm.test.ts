// @ts-ignore: import will be resolved
import { bundle } from "../../../dist/regal-bundler.cjs.js";

describe("Case: ESM", () => {
    it("Bundles successfully", async () => {
        await bundle({
            configLocation: __dirname
        });
    });
});
