import * as cosmiconfig from "cosmiconfig";
import * as path from "path";
import { GameMetadata } from "regal";
import { LoadedConfiguration } from "./interfaces-internal";
import { BundlerOptions, RecursivePartial } from "./interfaces-public";

// Eliminate readonly modifier - https://stackoverflow.com/questions/42999983/typescript-removing-readonly-modifier
type Writeable<T> = { -readonly [P in keyof T]-?: T[P] };

const metadataKeys: Array<keyof GameMetadata> = [
    "name",
    "author",
    "description",
    "homepage",
    "repository"
];

const loadUserConfig = async (
    configLocation?: string
): Promise<RecursivePartial<LoadedConfiguration>> => {
    const explorer = cosmiconfig("regal", {
        searchPlaces: ["package.json", "regal.json"]
    });

    let config: RecursivePartial<LoadedConfiguration>;
    const searchResult = await explorer.search(configLocation);

    if (searchResult === null) {
        config = {
            gameMetadata: {}
        };
    } else {
        config = searchResult.config;
    }

    const pkgPath = path.join(configLocation, "package.json");
    const pkg = await import(pkgPath);

    const metadata: RecursivePartial<Writeable<GameMetadata>> =
        config.gameMetadata;

    for (const mk of metadataKeys) {
        if (metadata[mk] === undefined && pkg[mk] !== undefined) {
            metadata[mk] = pkg[mk];
        }
    }

    return config;
};

const fillInOpts = (
    userOpts: RecursivePartial<LoadedConfiguration>
): LoadedConfiguration => {
    return userOpts as any; // TODO
};

export const getConfig = async (
    opts: RecursivePartial<BundlerOptions> = {}
): Promise<LoadedConfiguration> => {
    const userOpts = await loadUserConfig(opts.configLocation);

    return fillInOpts(userOpts);
};
