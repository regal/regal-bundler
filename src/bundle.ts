import { GameMetadata } from "regal";
import * as rollup from "rollup";
import * as insert from "rollup-plugin-insert";
import * as _json from "rollup-plugin-json";
import * as _resolve from "rollup-plugin-node-resolve";
import * as _typescript from "rollup-plugin-typescript2";
import { getConfig } from "./get-config";
import { BundlerOptions, RecursivePartial } from "./interfaces-public";

// Alias imports to allow executing namespaces
const json = _json;
const resolve = _resolve;
const typescript = _typescript;

const bundleFooter = (md: GameMetadata) => `
import { Game } from "regal";
/** Initialize game **/
Game.init(${JSON.stringify(md, undefined, 2)});
export { Game as default };
`;

export default async (opts: RecursivePartial<BundlerOptions> = {}) => {
    const config = await getConfig(opts);

    const inputOpts: rollup.RollupFileOptions = {
        input: config.bundleConfig.input.file,
        plugins: [
            (typescript as any)({
                tsconfigOverride: {
                    compilerOptions: { module: "es2015" }
                }
            }),
            resolve(),
            json({ exclude: "node_modules/**" }),
            insert.append(bundleFooter(config.gameMetadata), {
                include: config.bundleConfig.input.file
            })
        ]
    };

    const bundle = await rollup.rollup(inputOpts);

    const outputOpts: rollup.OutputOptions = {
        file: config.bundleConfig.output.file,
        format: config.bundleConfig.output.format,
        banner: "/** BUNDLED GAME */"
    };

    await bundle.write(outputOpts);
};
