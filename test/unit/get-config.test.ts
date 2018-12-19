import * as cosmiconfig from "cosmiconfig";

import { loadUserConfig } from "../../src/get-config";
import { LoadedConfiguration } from "../../src/interfaces-internal";
import { BundleType, ModuleFormat } from "../../src/interfaces-public";

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

            const config = await loadUserConfig(process.cwd());

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

            const config = await loadUserConfig(process.cwd());

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

            const config = await loadUserConfig(process.cwd());

            expect(config).toEqual(regalConfig);
        });
    });
});
