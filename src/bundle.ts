import { GameMetadata } from "regal";
import * as rollup from "rollup";
import * as insert from "rollup-plugin-insert";
import * as json from "rollup-plugin-json";
import * as resolve from "rollup-plugin-node-resolve";
import * as typescript from "rollup-plugin-typescript2";
import { getConfig } from "./get-config";
import { BundlerOptions, RecursivePartial } from "./interfaces-public";

const LOG = false;
// tslint:disable:no-console

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

    if (LOG) {
        console.log(bundle.imports);
        console.log(bundle.exports);
        console.log(bundle.modules);
    }

    const outputOpts: rollup.OutputOptions = {
        file: config.bundleConfig.output.file,
        format: config.bundleConfig.output.format,
        banner: "/** BUNDLED GAME */"
    };

    const { code, map } = await bundle.generate(outputOpts);

    if (LOG) {
        console.log(code);
        console.log(map);
    }

    await bundle.write(outputOpts);
};
