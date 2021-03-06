import * as cosmiconfig from "cosmiconfig";
import * as path from "path";

import * as Config from "../../src/get-config";
import { LoadedConfiguration } from "../../src/interfaces-internal";
import { ModuleFormat, RecursivePartial } from "../../src";
import { RegalError } from "regal";

// Mock importing package.json
const mockPkgImport = (config: any) => {
    return jest.spyOn(Config, "importDynamic").mockResolvedValue(config);
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
    it("dynamicImport wrapper works properly", async () => {
        const mockTest = jest.fn();
        jest.mock("../../package.json", () => mockTest());
        const p = path.join(process.cwd(), "package.json");
        await Config.importDynamic(p);
        expect(mockTest).toHaveBeenCalled();
    });

    describe("loadUserConfig", () => {
        afterEach(() => {
            jest.resetModules(); // Solves race condition
            jest.resetAllMocks();
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
                        bundle: "standard",
                        format: ModuleFormat.CJS,
                        minify: true
                    }
                }
            };

            mockPkgImport({
                version: "2.0.2"
            });
            mockCosmiconfig(regalConfig);

            const config = await Config.loadUserConfig(process.cwd());

            expect(config).toEqual({
                game: { ...regalConfig.game, gameVersion: "2.0.2" },
                bundler: regalConfig.bundler
            });
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

        it("If configLocation can't be resolved, attempt to resolve it relative to the current working directory", async () => {
            mockCosmiconfig({});

            const pkgConfig = {
                name: "regal-my-cool-game",
                author: "jcowman"
            };

            const configLocation = "./rel";
            const relativePath = path.join(configLocation, "package.json");
            const absolutePath = path.join(process.cwd(), relativePath);

            const checkFail = jest.fn();
            const importSpy = jest
                .spyOn(Config, "importDynamic")
                .mockImplementation(arg => {
                    if (arg === absolutePath) {
                        return Promise.resolve(pkgConfig);
                    } else {
                        checkFail(arg);
                        return Promise.reject("Could not resolve.");
                    }
                });

            const config = await Config.loadUserConfig(configLocation);

            expect(config).toEqual({
                game: pkgConfig
            });
            expect(importSpy).toBeCalledTimes(2);
            expect(importSpy).toBeCalledWith(relativePath);
            expect(importSpy).toBeCalledWith(absolutePath);
            expect(checkFail).toBeCalledTimes(1);
            expect(checkFail).toBeCalledWith(relativePath);
        });

        it("If the fallback for loading configLocation doesn't work, throw an error", async () => {
            mockCosmiconfig({});
            jest.spyOn(Config, "importDynamic").mockRejectedValue("err");

            const expectedPath = path.join("foo", "package.json");

            await expect(Config.loadUserConfig("foo")).rejects.toEqual(
                new RegalError(
                    `Could not resolve configLocation at ${expectedPath}`
                )
            );
        });

        it("Loads the gameVersion from package.json", async () => {
            const pkgConfig = {
                name: "regal-my-cool-game",
                author: "jcowman",
                version: "1.2.1"
            };

            mockCosmiconfig({});
            mockPkgImport(pkgConfig);

            const config = await Config.loadUserConfig(process.cwd());
            expect(config.game.gameVersion).toEqual("1.2.1");
        });

        it("Setting gameVersion in the Regal config does not set the value (when version is defined)", async () => {
            const pkgConfig = {
                name: "regal-my-cool-game",
                author: "jcowman",
                version: "1.0.0"
            };

            mockCosmiconfig({ game: { gameVersion: "2.1.2" } });
            mockPkgImport(pkgConfig);

            const config = await Config.loadUserConfig(process.cwd());
            expect(config.game.gameVersion).toEqual("1.0.0");
        });

        it("Setting gameVersion in the Regal config does not set the value (when version is undefined)", async () => {
            const pkgConfig = {
                name: "regal-my-cool-game",
                author: "jcowman"
            };

            mockCosmiconfig({ game: { gameVersion: "2.1.2" } });
            mockPkgImport(pkgConfig);

            const config = await Config.loadUserConfig(process.cwd());
            expect(config.game.gameVersion).toBeUndefined();
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
                        bundle: "standard",
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
                        bundle: "standard",
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
                bundle: "standard"
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
