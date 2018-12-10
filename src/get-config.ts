import { LoadedConfiguration } from "./interfaces-internal";
import { BundlerOptions, RecursivePartial } from "./interfaces-public";

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

const loadUserConfig = async (
    regalConfigLocation: string,
    pkgLocation: string
): Promise<RecursivePartial<LoadedConfiguration>> => {
    return tempConfig();
};

const fillInOpts = (
    userOpts: RecursivePartial<LoadedConfiguration>
): LoadedConfiguration => {
    return userOpts as any; // TODO
};

export const getConfig = async (
    opts: RecursivePartial<BundlerOptions>
): Promise<LoadedConfiguration> => {
    const userOpts = await loadUserConfig(
        opts.regalConfigLocation,
        opts.pkgLocation
    );

    return fillInOpts(userOpts);
};
