import { bundle, ModuleFormat } from "../../src";
import * as rollup from "rollup";
import { getConfig } from "../../src/get-config";
import { bundleHeader, getPlugins } from "../../src/bundle";
import { LoadedConfiguration } from "../../src/interfaces-internal";
import standardBundle from "../../src/bundle-standard";
import { onStartCommand, onPlayerCommand, Game } from "regal";

jest.mock("rollup");
jest.mock("../../src/get-config");

const sampleConfig = () => ({
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
            bundle: "standard",
            format: ModuleFormat.CJS,
            minify: false
        }
    }
});

const mockBundle = (config: LoadedConfiguration) => {
    const bundleWrite = jest.fn();

    // @ts-ignore
    getConfig.mockResolvedValueOnce(config);
    // @ts-ignore
    rollup.rollup.mockResolvedValueOnce({
        write: bundleWrite
    });

    return bundleWrite;
};

describe("Bundle", () => {
    describe("bundle", () => {
        it("Creates the bundle", async () => {
            const config = sampleConfig();
            const bundleWrite = mockBundle(config);

            await bundle();

            expect(bundleWrite).toBeCalledWith({
                file: config.bundler.output.file,
                format: config.bundler.output.format,
                banner: bundleHeader()
            });
        });

        it("Includes the header as a rollup banner if minify is false", async () => {
            const config = sampleConfig();
            config.bundler.output.minify = false;

            const bundleWrite = mockBundle(config);

            await bundle();

            expect(bundleWrite.mock.calls[0][0].banner).toBe(bundleHeader());
        });

        it("Does not include the header as a rollup banner if minify is true", async () => {
            const config = sampleConfig();
            config.bundler.output.minify = true;

            const bundleWrite = mockBundle(config);

            await bundle();

            expect(bundleWrite.mock.calls[0][0].banner).toBeUndefined;
        });
    });

    describe("getPlugins", () => {
        it("Includes terser if output.minify is true", () => {
            const config = sampleConfig();
            config.bundler.output.minify = true;

            const plugins = getPlugins(config);
            expect(plugins.find(p => p.name === "terser")).not.toBeUndefined();
        });

        it("Does not include terser if output.minify is false", () => {
            const config = sampleConfig();
            config.bundler.output.minify = false;

            const plugins = getPlugins(config);
            expect(plugins.find(p => p.name === "terser")).toBeUndefined();
        });

        it("Includes typescript plugin if input.ts is true", () => {
            const config = sampleConfig();
            config.bundler.input.ts = true;

            const plugins = getPlugins(config);
            expect(plugins.find(p => p.name === "rpt2")).not.toBeUndefined();
        });

        it("Does not include typescript plugin if input.ts is false", () => {
            const config = sampleConfig();
            config.bundler.input.ts = false;

            const plugins = getPlugins(config);
            expect(plugins.find(p => p.name === "rpt2")).toBeUndefined();
        });
    });

    describe("Standard Bundle", () => {
        beforeAll(() => {
            onStartCommand(game => game.output.write("hi"));
            onPlayerCommand(cmd => game => game.output.write(cmd));
            Game.init({
                name: "My Game",
                author: "Joe Cowman"
            });
        });

        it("Behaves the same as Regal GameApi", () => {
            const bundle = standardBundle(Game);

            expect(Game.getMetadataCommand()).toEqual(
                bundle.getMetadataCommand()
            );

            const seed = { seed: "foo" };
            const response = bundle.postStartCommand(seed);
            expect(Game.postStartCommand(seed)).toEqual(response);

            const instance = response.instance;
            expect(Game.postPlayerCommand(instance, "1")).toEqual(
                bundle.postPlayerCommand(instance, "1")
            );
            expect(Game.postUndoCommand(instance)).toEqual(
                bundle.postUndoCommand(instance)
            );

            const opt = { debug: true };
            expect(Game.postOptionCommand(instance, opt)).toEqual(
                bundle.postOptionCommand(instance, opt)
            );
        });

        it("Does not have Game.init or Game.reset", () => {
            const bundle = standardBundle(Game) as any;
            expect(bundle.init).toBeUndefined;
            expect(bundle.reset).toBeUndefined;
        });
    });
});
