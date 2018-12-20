import { GameMetadata } from "regal";
import * as rollup from "rollup";
import * as insert from "rollup-plugin-insert";
import * as _json from "rollup-plugin-json";
import * as _resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import * as _typescript from "rollup-plugin-typescript2";
import { getConfig } from "./get-config";
import { LoadedConfiguration } from "./interfaces-internal";
import { BundlerOptions, RecursivePartial } from "./interfaces-public";

// Alias imports to allow executing namespaces
const json = _json;
const resolve = _resolve;
const typescript = _typescript;

export const bundleFooter = (md: GameMetadata) => `
import { Game } from "regal";
/** Initialize game **/
Game.init(${JSON.stringify(md, undefined, 2)});
export { Game as default };
`;

export const bundleHeader = () => "/** BUNDLED GAME */";

export const getPlugins = (config: LoadedConfiguration): rollup.Plugin[] => {
    const plugins: rollup.Plugin[] = [];

    plugins.push(
        (typescript as any)({
            tsconfigOverride: {
                compilerOptions: { module: "es2015" }
            }
        }),
        resolve(),
        json({ exclude: "node_modules/**" }),
        insert.append(bundleFooter(config.game), {
            include: config.bundler.input.file
        })
    );

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
