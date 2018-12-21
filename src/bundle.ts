import * as rollup from "rollup";
import * as _commonjs from "rollup-plugin-commonjs";
import * as insert from "rollup-plugin-insert";
import * as _json from "rollup-plugin-json";
import * as _resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import * as _typescript from "rollup-plugin-typescript2";
import * as _virtual from "rollup-plugin-virtual";
import standardBundle from "./bundle-standard";
import { getConfig } from "./get-config";
import { LoadedConfiguration } from "./interfaces-internal";
import { BundlerOptions, RecursivePartial } from "./interfaces-public";

// Alias imports to allow executing namespaces
const json = _json;
const resolve = _resolve;
const typescript = _typescript;
const commonjs = _commonjs;
const virtual = _virtual;

const footerCode = (metadata: string) => `
/* Initialize game */
Game.init(${metadata});
/* Generate bundle */
const bundledGame = makeBundle(Game);
`;

const esFooter = (metadata: string) => `
import { Game } from "regal";
import makeBundle from "_bundle";
${footerCode(metadata)}
export { bundledGame as default };
`;

const cjsFooter = (metadata: string) => `
const Game = require("regal").Game;
const makeBundle = require("_bundle");
${footerCode(metadata)}
module.exports = bundledGame;
`;

export const bundleFooter = (config: LoadedConfiguration) => {
    const footer = config.bundler.input.ts ? esFooter : cjsFooter;
    return footer(JSON.stringify(config.game, undefined, 2));
};

export const bundleHeader = () => "/** BUNDLED GAME */";

export const getPlugins = (config: LoadedConfiguration): rollup.Plugin[] => {
    const plugins: rollup.Plugin[] = [];

    const bundleFunc = standardBundle.toString();
    const footer = bundleFooter(config);

    plugins.push(
        insert.append(footer, {
            include: config.bundler.input.file
        }),
        virtual({
            _bundle: `export default ${bundleFunc};`
        }),
        resolve(),
        json({ exclude: "node_modules/**" })
    );

    if (config.bundler.input.ts) {
        plugins.unshift(
            (typescript as any)({
                tsconfigOverride: {
                    compilerOptions: { module: "es2015" }
                }
            })
        );
    } else {
        plugins.push(commonjs());
    }

    if (config.bundler.output.minify) {
        plugins.push(terser({ output: { preamble: bundleHeader() } }));
    }

    return plugins;
};

export const bundle = async (opts: RecursivePartial<BundlerOptions> = {}) => {
    const config = await getConfig(opts);
    const plugins = getPlugins(config);

    const inputOpts: rollup.RollupFileOptions = {
        input: config.bundler.input.file,
        plugins
    };

    const build = await rollup.rollup(inputOpts);

    const outputOpts: rollup.OutputOptions = {
        file: config.bundler.output.file,
        format: config.bundler.output.format
    };

    if (!config.bundler.output.minify) {
        outputOpts.banner = bundleHeader();
    }

    await build.write(outputOpts);
};
