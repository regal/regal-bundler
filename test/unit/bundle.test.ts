import { bundle, BundleType, ModuleFormat } from "../../src";
import * as rollup from "rollup";
import { getConfig } from "../../src/get-config";

jest.mock("rollup");
jest.mock("../../src/get-config");

const sampleConfig = {
    game: {
        name: "My Cool Game",
        author: "Joe Cowman"
    },
    bundler: {
        input: {
            file: "sample/in",
            ts: true
        },
        output: {
            file: "sample/out",
            bundle: BundleType.STANDARD,
            format: ModuleFormat.CJS,
            minify: true
        }
    }
};

describe("Bundle", () => {
    it("Creates the bundle", async () => {
        const bundleWrite = jest.fn();

        // @ts-ignore
        getConfig.mockResolvedValueOnce(sampleConfig);
        // @ts-ignore
        rollup.rollup.mockResolvedValueOnce({
            write: bundleWrite
        });

        await bundle();

        expect(bundleWrite).toBeCalledWith({
            file: sampleConfig.bundler.output.file,
            format: sampleConfig.bundler.output.format,
            banner: "/** BUNDLED GAME */"
        });
    });
});
