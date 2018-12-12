import * as _cosmiconfig from "cosmiconfig";
import * as _filenamify from "filenamify";
import * as _path from "path";
import { GameMetadata } from "regal";
import { LoadedConfiguration } from "./interfaces-internal";
import {
    BundlerOptions,
    BundleType,
    ModuleFormat,
    RecursivePartial
} from "./interfaces-public";

const fixModule = <T>(o: T) => (o as any).default || o;
const cosmiconfig = fixModule(_cosmiconfig);
const filenamify = fixModule(_filenamify);
const path = fixModule(_path);

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
    if (userOpts.bundleConfig === undefined) {
        userOpts.bundleConfig = {};
    }

    const c = userOpts.bundleConfig;

    if (c.input === undefined) {
        c.input = {};
    }
    if (c.input.ts === undefined) {
        c.input.ts = true;
    }
    if (c.input.file === undefined) {
        const inputFile = c.input.ts ? "index.ts" : "index.js";
        c.input.file = path.join(process.cwd(), "src", inputFile);
    }

    if (c.output === undefined) {
        c.output = {};
    }
    if (c.output.file === undefined) {
        const filename = filenamify(userOpts.gameMetadata.name, "-") as string;
        c.output.file = path.join(process.cwd(), `${filename}.regal.js`);
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
    const userOpts = await loadUserConfig(opts.configLocation);
    const filledOpts = fillInOpts(userOpts);

    if (opts.bundler !== undefined) {
        if (opts.bundler.input !== undefined) {
            Object.assign(filledOpts.bundleConfig.input, opts.bundler.input);
        }
        if (opts.bundler.output !== undefined) {
            Object.assign(filledOpts.bundleConfig.output, opts.bundler.output);
        }
    }

    return filledOpts;
};
