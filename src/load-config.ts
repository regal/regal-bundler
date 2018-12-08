import { LoadedConfiguration, RecursivePartial } from "./interfaces-internal";

const tempConfig = (): RecursivePartial<LoadedConfiguration> => ({
    gameMetadata: {
        name: "New Game",
        author: "Bob Billy",
        homepage: "http://example.com",
        options: {
            debug: true
        }
    },
    bundleConfig: {
        input: {
            file: "src/index.ts",
            ts: true
        },
        output: {
            file: "dist/new-game.regal.js",
            bundle: "standard",
            format: "umd",
            minify: true
        }
    }
});

export const loadConfig = async (
    regalConfigLocation: string,
    pkgLocation: string
): Promise<RecursivePartial<LoadedConfiguration>> => {
    return Promise.resolve(tempConfig());
};
