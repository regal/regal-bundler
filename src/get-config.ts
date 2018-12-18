import * as _cosmiconfig from "cosmiconfig";
import * as _filenamify from "filenamify";
import * as path from "path";
import { GameMetadata } from "regal";
import { LoadedConfiguration } from "./interfaces-internal";
import {
    BundlerOptions,
    BundleType,
    ModuleFormat,
    RecursivePartial
} from "./interfaces-public";

// Alias imports to allow executing namespaces
const cosmiconfig = _cosmiconfig;
const filenamify = _filenamify;

// Eliminate readonly modifier
type Writeable<T> = { -readonly [P in keyof T]-?: T[P] };

const metadataKeys: Array<keyof GameMetadata> = [
    "name",
    "author",
    "description",
    "homepage",
    "repository"
];

export const loadUserConfig = async (
    configLocation: string
): Promise<RecursivePartial<LoadedConfiguration>> => {
    const explorer = cosmiconfig("regal", {
        searchPlaces: ["package.json", "regal.json"]
    });

    let config: RecursivePartial<LoadedConfiguration>;
    const searchResult = await explorer.search(configLocation);

    if (searchResult === null) {
        config = {
            game: {}
        };
    } else {
        config = searchResult.config;
    }

    const pkgPath = path.join(configLocation, "package.json");
    const pkg = await import(pkgPath);

    const metadata: RecursivePartial<Writeable<GameMetadata>> = config.game;

    for (const mk of metadataKeys) {
        if (metadata[mk] === undefined && pkg[mk] !== undefined) {
            metadata[mk] = pkg[mk];
        }
    }

    return config;
};

export const fillInOpts = (
    configLocation: string,
    userOpts: RecursivePartial<LoadedConfiguration>
): LoadedConfiguration => {
    if (userOpts.bundler === undefined) {
        userOpts.bundler = {};
    }
    const c = userOpts.bundler;

    if (c.input === undefined) {
        c.input = {};
    }
    if (c.input.ts === undefined) {
        c.input.ts = true;
    }
    if (c.input.file === undefined) {
        const inputFile = c.input.ts ? "index.ts" : "index.js";
        c.input.file = path.join(configLocation, "src", inputFile);
    }

    if (c.output === undefined) {
        c.output = {};
    }
    if (c.output.file === undefined) {
        const filename = filenamify(userOpts.game.name, {
            replacement: "-"
        }) as string;
        c.output.file = path.join(configLocation, `${filename}.regal.js`);
    }
    if (c.output.bundle === undefined) {
        c.output.bundle = BundleType.STANDARD;
    }
    if (c.output.format === undefined) {
        c.output.format = ModuleFormat.CJS;
    }
    if (c.output.minify === undefined) {
        c.output.minify = false;
    }

    return userOpts as LoadedConfiguration;
};

export const getConfig = async (
    opts: RecursivePartial<BundlerOptions> = {}
): Promise<LoadedConfiguration> => {
    if (opts.configLocation === undefined) {
        opts.configLocation = process.cwd();
    }

    const userOpts = await loadUserConfig(opts.configLocation);
    const filledOpts = fillInOpts(opts.configLocation, userOpts);

    if (opts.bundler !== undefined) {
        if (opts.bundler.input !== undefined) {
            Object.assign(filledOpts.bundler.input, opts.bundler.input);
        }
        if (opts.bundler.output !== undefined) {
            Object.assign(filledOpts.bundler.output, opts.bundler.output);
        }
    }

    return filledOpts;
};
