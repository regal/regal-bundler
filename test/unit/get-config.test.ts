import * as cosmiconfig from "cosmiconfig";
import * as path from "path";

import * as Config from "../../src/get-config";
import { LoadedConfiguration } from "../../src/interfaces-internal";
import { BundleType, ModuleFormat, RecursivePartial } from "../../src";

// Mock importing package.json
const pkgRetValue = jest.fn();
jest.mock("../../package.json", () => pkgRetValue());
const mockPkgImport = (config: any) => {
    pkgRetValue.mockResolvedValue(config);
};

// Mock cosmiconfig.search
jest.mock("cosmiconfig");
const mockCosmiconfig = (config: any) => {
    const retVal = config === null ? null : { config };
    // @ts-ignore
    cosmiconfig.mockImplementationOnce(() => ({
        search: () => retVal
    }));
};

describe("Get Config", () => {
    describe("loadUserConfig", () => {
        afterEach(() => {
            jest.resetModules(); // Solves race condition
        });

        it("Can load a full configuration", async () => {
            const regalConfig: LoadedConfiguration = {
                game: {
                    name: "My Cool Game",
                    author: "Joe Cowman",
                    headline: "Welcome to the best game!",
                    description: "The best game ever.",
                    homepage: "https://example.com",
                    repository: "https://github.com/regal/regal",
                    options: {
                        debug: true
                    }
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

            mockPkgImport({});
            mockCosmiconfig(regalConfig);

            const config = await Config.loadUserConfig(process.cwd());

            expect(config).toEqual(regalConfig);
        });

        it("Loads some metadata values from package.json if no Regal config is present", async () => {
            const expectedConfig = {
                name: "My Cool Game",
                author: "Joe Cowman",
                description: "The best game ever.",
                homepage: "https://example.com",
                repository: "https://github.com/regal/regal"
            };

            const pkgConfig = { ...expectedConfig, dependencies: [] };

            mockPkgImport(pkgConfig);
            mockCosmiconfig(null);

            const config = await Config.loadUserConfig(process.cwd());

            expect(config).toEqual({
                game: expectedConfig
            });
        });

        it("Regal config values take precedence over package.json values", async () => {
            const regalConfig = {
                game: {
                    name: "My Cool Game",
                    author: "Joe Cowman"
                }
            };

            const pkgConfig = {
                name: "regal-my-cool-game",
                author: "jcowman"
            };

            mockCosmiconfig(regalConfig);
            mockPkgImport(pkgConfig);

            const config = await Config.loadUserConfig(process.cwd());

            expect(config).toEqual(regalConfig);
        });
    });

    describe("fillInOpts", () => {
        it("Errors if game.name is not defined", () => {
            expect(() => Config.fillInOpts(process.cwd(), {})).toThrow(
                "RegalError: game.name must be defined."
            );
        });

        it("Fills in all default values if nothing is specified", () => {
            expect(
                Config.fillInOpts(process.cwd(), {
                    game: { name: "My Cool Game" }
                })
            ).toEqual({
                bundler: {
                    input: {
                        ts: true,
                        file: path.join(process.cwd(), "src", "index.ts")
                    },
                    output: {
                        file: path.join(process.cwd(), "my-cool-game.regal.js"),
                        bundle: BundleType.STANDARD,
                        format: ModuleFormat.CJS,
                        minify: false
                    }
                },
                game: {
                    name: "My Cool Game"
                }
            });
        });

        it("Does not fill in values if they're specified", () => {
            const config: LoadedConfiguration = {
                game: {
                    name: "My Cool Game",
                    author: "Joe Cowman",
                    options: {
                        seed: "bloop"
                    }
                },
                bundler: {
                    input: {
                        ts: true,
                        file: "start.ts"
                    },
                    output: {
                        file: "out.js",
                        bundle: BundleType.STANDARD,
                        format: ModuleFormat.ESM,
                        minify: true
                    }
                }
            };

            const configCopy: LoadedConfiguration = JSON.parse(
                JSON.stringify(config)
            );
            Config.fillInOpts(process.cwd(), configCopy);

            config.bundler.input.file = path.join(process.cwd(), "start.ts");
            config.bundler.output.file = path.join(process.cwd(), "out.js");

            expect(configCopy).toEqual(config);
        });

        it("input.ts defaults to false if input.file is specified as ending with .js", () => {
            expect(
                Config.fillInOpts(process.cwd(), {
                    game: { name: "foo" },
                    bundler: { input: { file: "index.js" } }
                }).bundler.input.ts
            ).toBe(false);
        });

        it("input.file defaults to .js extension if input.ts is specified as false", () => {
            expect(
                Config.fillInOpts(process.cwd(), {
                    game: { name: "bar" },
                    bundler: { input: { ts: false } }
                }).bundler.input.file
            ).toBe(path.join(process.cwd(), "src", "index.js"));
        });
    });

    describe("getConfig", () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("opts.configLocation defaults to the project directory", async () => {
            const loadUserConfig = jest
                .spyOn(Config, "loadUserConfig")
                .mockResolvedValue({});
            const fillInOpts = jest
                .spyOn(Config, "fillInOpts")
                .mockReturnValue({});

            await Config.getConfig();

            expect(loadUserConfig).toBeCalledWith(process.cwd());
            expect(fillInOpts).toBeCalledWith(process.cwd(), {});
        });

        it("opts argument overrides options loaded from configuration (1)", async () => {
            const loadedConfig: RecursivePartial<LoadedConfiguration> = {
                game: {
                    name: "My Cool Game",
                    author: "Joe Cowman"
                },
                bundler: {
                    output: {
                        format: ModuleFormat.ESM,
                        minify: true
                    }
                }
            };

            jest.spyOn(Config, "loadUserConfig").mockResolvedValue(
                loadedConfig
            );

            const result = await Config.getConfig({
                configLocation: __dirname,
                bundler: { output: { minify: false } }
            });

            expect(result.game).toEqual(loadedConfig.game);
            expect(result.bundler.output).toEqual({
                format: ModuleFormat.ESM,
                minify: false,
                file: path.join(__dirname, "my-cool-game.regal.js"),
                bundle: BundleType.STANDARD
            });
        });

        it("opts argument overrides options loaded from configuration (2)", async () => {
            const loadedConfig: RecursivePartial<LoadedConfiguration> = {
                game: {
                    name: "My Cool Game",
                    author: "Joe Cowman"
                },
                bundler: {
                    input: {
                        ts: false
                    }
                }
            };

            jest.spyOn(Config, "loadUserConfig").mockResolvedValue(
                loadedConfig
            );

            const result = await Config.getConfig({
                configLocation: __dirname,
                bundler: { input: { ts: true } }
            });

            expect(result.game).toEqual(loadedConfig.game);
            expect(result.bundler.input).toEqual({
                ts: true,
                file: path.join(__dirname, "src", "index.js")
            });
        });
    });
});
